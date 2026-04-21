"""
PDF to JSON converter for Chulalongkorn University exam attendance sheets (CR56).

Usage:
    python pdf-to-json.py                      # auto-scan default folder
    python pdf-to-json.py <folder>             # scan all PDFs in folder
    python pdf-to-json.py <pdf1> [pdf2] ...    # specific PDF files

Each PDF is a CR56 attendance sheet for one room of one course.
Output: sheet.json

Dependencies:
    pip install pdfplumber
"""

import sys
import os
import re
import glob
import json
from datetime import datetime

import pdfplumber

# Default folder to scan when no args given
DEFAULT_FOLDER = "รายชื่อนิสิตเข้าสอบ ปลาย ภาคปลาย 2568"

# Ensure UTF-8 stdout on Windows (Thai filenames)
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def parse_cr56_header(text: str) -> dict:
    """Extract course info from CR56 page header text."""
    info = {}

    # "COURSE : 2100201 INTRO AI DATE & TIME : 7/5/2026 08:30 - 10:30"
    # Title ends where the next field header starts (DATE, BUILDING, etc.) or EOL.
    m = re.search(
        r"COURSE\s*:\s*(\d+)\s+(.+?)(?:\s+(?:DATE\s*&\s*TIME|BUILDING|ROOM|PAGE|ACADEMIC)\s*:|\n|$)",
        text,
    )
    if m:
        info["code"] = m.group(1).strip()
        info["title"] = m.group(2).strip()

    # BUILDING : ENG1   ROOM : 303
    m = re.search(r"BUILDING\s*:\s*(\S+)", text)
    if m:
        info["building"] = m.group(1).strip()
    m = re.search(r"ROOM\s*:\s*(\S+)", text)
    if m:
        info["room"] = m.group(1).strip()

    # DATE & TIME : 1/12/2025 08:30 - 11:30
    m = re.search(r"DATE\s*&\s*TIME\s*:\s*(\d{1,2}/\d{1,2}/\d{4})\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})", text)
    if m:
        date_str = m.group(1)
        start_time = m.group(2)
        end_time = m.group(3)
        # Convert 1/12/2025 to "Mon 01 Dec 25" format
        dt = datetime.strptime(date_str, "%d/%m/%Y")
        info["date"] = dt.strftime("%a %d %b %y")
        info["time"] = f"{start_time}-{end_time}"

    return info


# Line format on a CR56 page:
#   "1 653 02560 21 Piyapat Wongchaiphanit no signature (W)"
#   "2 653 02816 21 Patcharapong Namwongsa _______________"
STUDENT_LINE_RE = re.compile(
    r"^\s*(?P<no>\d+)\s+"
    r"(?P<id>\d{3}\s+\d{5}\s+\d{2})\s+"
    r"(?P<rest>.+?)\s*$"
)


def parse_student_line(line: str) -> dict | None:
    """Parse a single text line into a student dict, or None if not a student row."""
    m = STUDENT_LINE_RE.match(line)
    if not m:
        return None

    no_str = m.group("no")
    clean_id = re.sub(r"\s+", "", m.group("id"))
    rest = m.group("rest").strip()

    # rest = "<NAME...> <SIGNATURE>"
    # SIGNATURE is either underscores or "no signature (W)".
    withdrawn = False
    sig_match = re.search(
        r"\s+(no\s*signature\s*\(\s*W\s*\)|_+)\s*$",
        rest,
        re.IGNORECASE,
    )
    if sig_match:
        if sig_match.group(1).lower().startswith("no"):
            withdrawn = True
        name = rest[: sig_match.start()].strip()
    else:
        name = rest

    if not name:
        return None

    return {
        "id": clean_id,
        "name": name,
        "seat": int(no_str),
        "withdrawn": withdrawn,
    }


def parse_pdf(filepath: str) -> list[dict]:
    """
    Parse a single PDF file.
    Returns a list of room entries:
    [{"code", "title", "date", "time", "building", "room", "student_list": [...]}]
    """
    rooms = {}  # key: (code, building, room) -> room entry

    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""

            # Skip CR38 pages (page 1 form) - detect by checking for CR56 header
            if "CR56" not in text and "COURSE" not in text:
                continue

            header = parse_cr56_header(text)
            if not header.get("code"):
                continue

            key = (header["code"], header.get("building", ""), header.get("room", ""))

            if key not in rooms:
                rooms[key] = {
                    "code": header["code"],
                    "title": header.get("title", ""),
                    "date": header.get("date", ""),
                    "time": header.get("time", ""),
                    "building": header.get("building", ""),
                    "room": header.get("room", ""),
                    "student_list": [],
                }

            # Parse students directly from text lines — CR56 pages have
            # no table borders, so pdfplumber.extract_tables() returns nothing.
            existing_ids = {s["id"] for s in rooms[key]["student_list"]}
            for line in text.splitlines():
                student = parse_student_line(line)
                if student and student["id"] not in existing_ids:
                    rooms[key]["student_list"].append(student)
                    existing_ids.add(student["id"])

    return list(rooms.values())


def merge_into_schedule(schedule: dict, room_entries: list[dict]):
    """Merge parsed room entries into the exam schedule dict."""
    for entry in room_entries:
        code = entry["code"]

        if code not in schedule:
            schedule[code] = {
                "code": code,
                "title": entry["title"],
                "date": entry["date"],
                "time": entry["time"],
                "sum_student": 0,
                "group": [],
            }

        # Check if this room already exists
        existing_rooms = [
            g for g in schedule[code]["group"]
            if g["building"] == entry["building"] and g["room"] == entry["room"]
        ]

        if existing_rooms:
            # Merge students into existing room
            room = existing_rooms[0]
            existing_ids = {s["id"] for s in room["student_list"]}
            for student in entry["student_list"]:
                if student["id"] not in existing_ids:
                    room["student_list"].append(student)
                    existing_ids.add(student["id"])
            room["students"] = len(room["student_list"])
        else:
            schedule[code]["group"].append({
                "building": entry["building"],
                "room": entry["room"],
                "students": len(entry["student_list"]),
                "student_list": entry["student_list"],
            })

        # Update total student count
        schedule[code]["sum_student"] = sum(
            g["students"] for g in schedule[code]["group"]
        )


def collect_pdfs(args: list[str]) -> list[str]:
    """Resolve CLI args (files, folders, or empty) into a flat list of PDF paths."""
    sources = args if args else [DEFAULT_FOLDER]
    pdfs: list[str] = []
    for src in sources:
        if os.path.isdir(src):
            pdfs.extend(sorted(glob.glob(os.path.join(src, "*.pdf"))))
        elif os.path.isfile(src):
            pdfs.append(src)
        else:
            matched = sorted(glob.glob(src))
            if not matched:
                print(f"Warning: no match for {src}")
            pdfs.extend(matched)
    return pdfs


def main():
    pdf_files = collect_pdfs(sys.argv[1:])
    if not pdf_files:
        print(f"No PDFs found. Default folder: {DEFAULT_FOLDER}")
        sys.exit(1)

    print(f"Found {len(pdf_files)} PDF file(s) to process.")
    schedule = {}

    # Try to load existing sheet.json to merge with
    try:
        with open("sheet.json", "r", encoding="utf-8") as f:
            existing = json.load(f)
            # Re-key by code if currently keyed by number
            for key, val in existing.items():
                if "code" in val and "group" in val:
                    code = val["code"]
                    # Check if it already has student_list format
                    if val["group"] and "student_list" in val["group"][0]:
                        schedule[code] = val
    except (FileNotFoundError, json.JSONDecodeError):
        pass

    for pdf_path in pdf_files:
        print(f"Parsing: {pdf_path}")
        try:
            room_entries = parse_pdf(pdf_path)
            merge_into_schedule(schedule, room_entries)
            total_students = sum(
                len(e["student_list"]) for e in room_entries
            )
            print(f"  Found {len(room_entries)} room(s), {total_students} student(s)")
        except Exception as e:
            print(f"  Error parsing {pdf_path}: {e}")
            raise

    # Write output
    with open("sheet.json", "w", encoding="utf-8") as out:
        json.dump(schedule, out, ensure_ascii=False, indent=2)

    total_courses = len(schedule)
    total_rooms = sum(len(v["group"]) for v in schedule.values())
    total_students = sum(
        sum(len(g["student_list"]) for g in v["group"])
        for v in schedule.values()
    )
    print(f"\nDone! sheet.json written with {total_courses} course(s), {total_rooms} room(s), {total_students} student(s)")


if __name__ == "__main__":
    main()
