"""
Extract enrolled student IDs from per-course PDF roster files.

Usage:
    py extract-course-students-pdf.py
    py extract-course-students-pdf.py --roster-dir src/data --schedule sheet-range.json --output course-students-pdf.json

Supported roster sources:
    - .pdf: extracts page headers and 10-digit student IDs from compressed
      PDF text streams.

The filename should contain the course code, for example:
    2301107.pdf

No external PDF package is required for the current roster format. For PDF
courses, room assignment comes from each page header in the PDF, not from
sheet-range.json.
"""

import argparse
import glob
import json
import os
import re
import zlib
from collections import OrderedDict
from typing import Any, Dict, List, Optional, Set, Tuple


DEFAULT_ROSTER_DIR = os.path.join("src", "data")
DEFAULT_SCHEDULE = "sheet-range.json"
DEFAULT_OUTPUT = "course-students-pdf.json"
STUDENT_ID_RE = re.compile(r"\b\d{10}\b")
SPACED_STUDENT_ID_RE = re.compile(r"\b(\d{3})\s+(\d{5})\s+(\d{2})\b")
STUDENT_ID_CANDIDATE_RE = re.compile(r"6[3-9]\d{6}(21|22|23|33|37)")


def clean(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return re.sub(r"\s+", " ", str(value)).strip()


def course_code_from_filename(path: str) -> Optional[str]:
    match = re.search(r"(\d{7})", os.path.basename(path))
    return match.group(1) if match else None


def extract_ids_from_text(text: str) -> List[str]:
    ids = set(STUDENT_ID_RE.findall(text or ""))
    for match in SPACED_STUDENT_ID_RE.finditer(text or ""):
        ids.add("".join(match.groups()))
    return sorted(ids)


def decoded_pdf_streams(path: str) -> List[str]:
    data = open(path, "rb").read()
    streams = []
    for match in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", data, re.S):
        raw = match.group(1)
        try:
            streams.append(zlib.decompress(raw).decode("latin1", "ignore"))
        except Exception:
            continue
    return streams


def literal_strings(text: str) -> List[str]:
    return re.findall(r"\(([^()]*)\)", text)


def extract_literal_digit_runs(text: str) -> List[str]:
    return re.findall(r"\d+", "".join(literal_strings(text)))


def is_student_id_candidate(value: str) -> bool:
    return STUDENT_ID_CANDIDATE_RE.fullmatch(value) is not None


def extract_ids_from_row_sequences(run: str) -> Set[str]:
    ids: Set[str] = set()
    for start in range(len(run)):
        for row_len in (1, 2, 3):
            if start + row_len + 10 > len(run):
                continue

            row_text = run[start:start + row_len]
            if not row_text or row_text.startswith("0"):
                continue

            position = start
            row_no = int(row_text)
            found: List[str] = []
            while True:
                row_prefix = str(row_no)
                if not run.startswith(row_prefix, position):
                    break

                id_start = position + len(row_prefix)
                candidate = run[id_start:id_start + 10]
                if len(candidate) != 10 or not is_student_id_candidate(candidate):
                    break

                found.append(candidate)
                position = id_start + 10
                row_no += 1

            if len(found) >= 2:
                ids.update(found)

    return ids


def extract_id_from_single_row_run(run: str) -> Set[str]:
    ids: Set[str] = set()
    for row_len in (1, 2, 3):
        if len(run) != row_len + 10:
            continue

        row_text = run[:row_len]
        candidate = run[row_len:]
        if row_text.startswith("0"):
            continue
        if is_student_id_candidate(candidate):
            ids.add(candidate)

    return ids


def is_page_start(literals: List[str], course_code: str) -> bool:
    compact_header = "".join(literals[:12]).replace(" ", "")
    return course_code in compact_header


def split_pdf_pages(path: str, course_code: str) -> List[Dict[str, Any]]:
    pages: List[Dict[str, Any]] = []
    current: Optional[Dict[str, Any]] = None

    for text in decoded_pdf_streams(path):
        literals = literal_strings(text)
        if not literals:
            continue

        if is_page_start(literals, course_code):
            if current:
                pages.append(current)
            current = {"texts": [text], "literals": list(literals)}
        elif current:
            current["texts"].append(text)
            current["literals"].extend(literals)

    if current:
        pages.append(current)

    return pages


def parse_pdf_time(literals: List[str]) -> str:
    tokens = [clean(value) for value in literals[:40]]

    for index, token in enumerate(tokens):
        if token != "-":
            continue
        if index < 3 or index + 3 >= len(tokens):
            continue

        start_hour = tokens[index - 3]
        start_minute = tokens[index - 1]
        end_hour = tokens[index + 1]
        end_minute = tokens[index + 3]
        if all(re.fullmatch(r"\d{1,2}", part) for part in [start_hour, start_minute, end_hour, end_minute]):
            return "{}:{}-{}:{}".format(
                start_hour.zfill(2),
                start_minute.zfill(2),
                end_hour.zfill(2),
                end_minute.zfill(2),
            )

    return ""


def parse_pdf_room_header(literals: List[str]) -> Dict[str, str]:
    tokens = [clean(value) for value in literals[:50]]
    dash_indices = [index for index, token in enumerate(tokens) if "-" in token]
    search_start = dash_indices[-1] + 1 if dash_indices else 0

    building = ""
    building_index = -1
    for index in range(search_start, len(tokens)):
        token = tokens[index]
        next_tokens = [value for value in tokens[index + 1:index + 4] if value]
        next_token = next_tokens[0] if next_tokens else ""

        if token == "TAB":
            building = "TAB"
            building_index = index
            break
        if token == "M" and next_tokens[:2] == ["HM", "K"]:
            building = "MHMK"
            building_index = index
            break
        if token == "ENG":
            building = "ENG"
            building_index = index
            if re.fullmatch(r"\d+", next_token):
                building = "ENG {}".format(next_token)
            break
        if token == "CUP" or (token == "C" and next_token == "UP"):
            building = "CUP"
            building_index = index
            break

    room_tokens = []
    if building_index >= 0:
        for token in tokens[search_start:building_index]:
            if re.fullmatch(r"\d+", token):
                room_tokens.append(token)

    return {
        "building": building,
        "room": "".join(room_tokens),
    }


def pdf_table_start_index(literals: List[str]) -> int:
    tokens = [clean(value) for value in literals[:60]]
    dash_indices = [index for index, token in enumerate(tokens) if "-" in token]
    search_start = dash_indices[-1] + 1 if dash_indices else 0

    for index in range(search_start, len(tokens)):
        token = tokens[index]
        next_indices = [
            next_index
            for next_index in range(index + 1, min(index + 4, len(tokens)))
            if tokens[next_index]
        ]
        next_index = next_indices[0] if next_indices else index + 1
        next_token = tokens[next_index] if next_indices else ""

        if token == "TAB":
            return index + 1
        if token == "M" and next_indices and tokens[next_indices[0]:next_indices[0] + 2] == ["HM", "K"]:
            return next_indices[0] + 2
        if token == "ENG":
            if re.fullmatch(r"\d+", next_token):
                return next_index + 1
            return index + 1
        if token == "CUP":
            return index + 1
        if token == "C" and next_token == "UP":
            return index + 2

    return 0


def parse_student_rows_from_tokens(tokens: List[str], start_index: int, start_row: int) -> Tuple[List[str], int]:
    ids: List[str] = []
    position = start_index
    row_no = start_row

    while position < len(tokens):
        row_text = str(row_no)
        while position < len(tokens) and tokens[position] != row_text:
            position += 1
        if position >= len(tokens):
            break

        position += 1
        digits = ""
        while position < len(tokens):
            token = tokens[position]
            position += 1
            if not re.fullmatch(r"\d+", token):
                continue

            digits += token
            if len(digits) < 10:
                continue
            if len(digits) > 10 or not is_student_id_candidate(digits):
                return ids, position

            ids.append(digits)
            row_no += 1
            break
        else:
            break

    return ids, position


def extract_ids_from_page_tokens(page: Dict[str, Any]) -> List[str]:
    tokens = [clean(value) for value in page.get("literals", [])]
    table_start = pdf_table_start_index(page.get("literals", []))
    best: List[str] = []

    for index in range(table_start, len(tokens)):
        token = tokens[index]
        if not re.fullmatch(r"\d{1,3}", token):
            continue

        row_no = int(token)
        if row_no <= 0 or row_no > 200:
            continue

        ids, _ = parse_student_rows_from_tokens(tokens, index, row_no)
        if len(ids) > len(best):
            best = ids

    return best


def extract_page_student_ids(page: Dict[str, Any]) -> List[str]:
    token_ids = extract_ids_from_page_tokens(page)
    if token_ids:
        return sorted(set(token_ids))

    ids: Set[str] = set()
    page_text = "\n".join(page.get("texts", []))

    for text in page.get("texts", []):
        # Direct text IDs are rare in this PDF, but keep them when present.
        for student_id in extract_ids_from_text(text):
            if is_student_id_candidate(student_id):
                ids.add(student_id)

    # The roster tables are emitted as digit-only literal runs. Page-level
    # parsing preserves sequences that are split across PDF streams.
    for run in extract_literal_digit_runs(page_text):
        ids.update(extract_ids_from_row_sequences(run))

    return sorted(ids)


def extract_pdf_course_data(path: str, schedule_course: Dict[str, Any]) -> Dict[str, Any]:
    course_code = course_code_from_filename(path)
    if not course_code:
        raise ValueError("filename does not contain a 7-digit course code")

    groups_by_room: "OrderedDict[Tuple[str, str], Dict[str, Any]]" = OrderedDict()
    all_ids: Set[str] = set()
    pdf_time = ""

    for page in split_pdf_pages(path, course_code):
        header = parse_pdf_room_header(page.get("literals", []))
        page_ids = extract_page_student_ids(page)
        if not page_ids:
            continue

        if not pdf_time:
            pdf_time = parse_pdf_time(page.get("literals", []))

        key = (header["building"], header["room"])
        if key not in groups_by_room:
            groups_by_room[key] = {
                "building": header["building"],
                "room": header["room"],
                "students": 0,
                "range": "",
                "student_ids": [],
            }

        group_ids = groups_by_room[key]["student_ids"]
        for student_id in page_ids:
            if student_id not in group_ids:
                group_ids.append(student_id)
            all_ids.add(student_id)

    groups = []
    for group in groups_by_room.values():
        group["students"] = len(group["student_ids"])
        groups.append(group)

    student_ids = sorted(all_ids)
    return {
        "code": course_code,
        "title": schedule_course.get("title", ""),
        "date": schedule_course.get("date", ""),
        "time": pdf_time or schedule_course.get("time", ""),
        "sum_student": len(student_ids),
        "source_files": [path],
        "student_ids": student_ids,
        "student_count": len(student_ids),
        "groups": groups,
        "unmatched_student_ids": [],
        "errors": [],
    }


def load_schedule_by_code(path: str) -> Dict[str, Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as file:
        schedule_by_no = json.load(file)

    by_code: Dict[str, Dict[str, Any]] = {}
    for schedule_no, course in schedule_by_no.items():
        code = clean(course.get("code"))
        if not code:
            continue
        if code not in by_code:
            by_code[code] = {
                "schedule_no": schedule_no,
                "code": code,
                "title": clean(course.get("title")),
                "date": clean(course.get("date")),
                "time": clean(course.get("time")),
                "sum_student": course.get("sum_student", 0),
                "group": [],
            }
        by_code[code]["group"].extend(course.get("group", []))

    return by_code


def collect_roster_files(roster_dir: str) -> List[str]:
    return sorted(
        path
        for path in glob.glob(os.path.join(roster_dir, "*.pdf"))
        if course_code_from_filename(path) is not None
    )


def build_output(roster_dir: str, schedule_path: str) -> Dict[str, Any]:
    schedule_by_code = load_schedule_by_code(schedule_path)
    roster_files = collect_roster_files(roster_dir)
    courses: Dict[str, Any] = {}
    warnings = []

    for path in roster_files:
        code = course_code_from_filename(path) or ""
        schedule_course = schedule_by_code.get(code, {
            "code": code,
            "title": "",
            "date": "",
            "time": "",
            "sum_student": 0,
            "group": [],
        })

        try:
            course = extract_pdf_course_data(path, schedule_course)
        except Exception as exc:
            if code:
                course = {
                    "code": code,
                    "title": schedule_course.get("title", ""),
                    "date": schedule_course.get("date", ""),
                    "time": schedule_course.get("time", ""),
                    "sum_student": 0,
                    "source_files": [path],
                    "student_ids": [],
                    "student_count": 0,
                    "groups": [],
                    "unmatched_student_ids": [],
                    "errors": [{"file": path, "error": str(exc)}],
                }
            else:
                warnings.append({"file": path, "warning": str(exc)})
                continue

        if course["code"] in courses:
            existing = courses[course["code"]]
            existing["source_files"].extend(course["source_files"])
            existing["student_ids"] = sorted(set(existing["student_ids"]) | set(course["student_ids"]))
            existing["student_count"] = len(existing["student_ids"])
            existing["sum_student"] = existing["student_count"]
            existing["groups"].extend(course["groups"])
            existing["errors"].extend(course["errors"])
        else:
            courses[course["code"]] = course

    return {
        "schedule_source": schedule_path,
        "roster_dir": roster_dir,
        "course_count": len(courses),
        "courses": courses,
        "warnings": warnings,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--roster-dir", default=DEFAULT_ROSTER_DIR)
    parser.add_argument("--schedule", default=DEFAULT_SCHEDULE)
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    result = build_output(args.roster_dir, args.schedule)
    with open(args.output, "w", encoding="utf-8") as file:
        json.dump(result, file, ensure_ascii=False, indent=2)
        file.write("\n")

    total_students = sum(
        course["student_count"] for course in result["courses"].values()
    )
    total_errors = sum(
        len(course["errors"]) for course in result["courses"].values()
    )
    print(
        f"Done! {args.output} written with "
        f"{result['course_count']} course(s), {total_students} student id(s), "
        f"{total_errors} file error(s)."
    )


if __name__ == "__main__":
    main()
