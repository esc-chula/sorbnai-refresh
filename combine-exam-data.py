"""
Combine schedule/range data and extracted course rosters into the website's
main exam JSON structure.

Usage:
    py combine-exam-data.py
    py combine-exam-data.py --output public/sheet.json

The output shape matches src/types/class.ts:
{
  "<course_code>": {
    "date": "...",
    "time": "...",
    "code": "...",
    "title": "...",
    "sum_student": 0,
    "group": [
      {
        "building": "...",
        "room": "...",
        "students": 0,
        "student_list": [
          {"id": "...", "name": "", "seat": 1, "withdrawn": false}
        ]
      }
    ]
  }
}
"""

import argparse
import json
import os
import re
from collections import OrderedDict
from typing import Any, Dict, Iterable, List, Tuple


DEFAULT_SCHEDULE = "sheet-range.json"
DEFAULT_ROSTER_JSON = "course-students.json"
DEFAULT_PDF_ROSTER_JSON = "course-students-pdf.json"
DEFAULT_OUTPUT = os.path.join("public", "sheet.json")


def clean(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return re.sub(r"\s+", " ", str(value)).strip()


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file, object_pairs_hook=OrderedDict)


def build_student_list(student_ids: Iterable[str]) -> List[Dict[str, Any]]:
    students = []
    for seat, student_id in enumerate(student_ids, start=1):
        students.append(
            {
                "id": clean(student_id),
                "name": "",
                "seat": seat,
                "withdrawn": False,
            }
        )
    return students


def empty_group(group: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "building": clean(group.get("building")),
        "room": clean(group.get("room")),
        "students": int(group.get("students", 0) or 0),
        "student_list": [],
    }


def roster_group(group: Dict[str, Any], count_from_list: bool) -> Dict[str, Any]:
    student_ids = [clean(student_id) for student_id in group.get("student_ids", []) if clean(student_id)]
    return {
        "building": clean(group.get("building")),
        "room": clean(group.get("room")),
        "students": len(student_ids) if count_from_list else int(group.get("students", 0) or 0),
        "student_list": build_student_list(student_ids),
    }


def make_base_schedule(schedule_path: str) -> "OrderedDict[str, Dict[str, Any]]":
    raw_schedule = load_json(schedule_path)
    schedule: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()

    for _, course in raw_schedule.items():
        code = clean(course.get("code"))
        if not code:
            continue

        if code not in schedule:
            schedule[code] = {
                "date": clean(course.get("date")),
                "time": clean(course.get("time")),
                "code": code,
                "title": clean(course.get("title")),
                "sum_student": int(course.get("sum_student", 0) or 0),
                "group": [],
            }

        schedule[code]["group"].extend(
            empty_group(group)
            for group in course.get("group", [])
        )

    return schedule


def iter_roster_courses(paths: Iterable[str]) -> Iterable[Tuple[str, Dict[str, Any], str]]:
    for path in paths:
        if not path or not os.path.exists(path):
            continue

        data = load_json(path)
        courses = data.get("courses", {})
        for code, course in courses.items():
            yield clean(code), course, path


def apply_roster_courses(
    schedule: "OrderedDict[str, Dict[str, Any]]",
    roster_paths: Iterable[str],
    count_from_list: bool,
) -> List[str]:
    warnings = []

    for code, roster_course, source_path in iter_roster_courses(roster_paths):
        if not code:
            continue

        roster_groups = [
            roster_group(group, count_from_list=count_from_list)
            for group in roster_course.get("groups", [])
        ]

        if code not in schedule:
            schedule[code] = {
                "date": clean(roster_course.get("date")),
                "time": clean(roster_course.get("time")),
                "code": code,
                "title": clean(roster_course.get("title")),
                "sum_student": int(roster_course.get("sum_student", 0) or 0),
                "group": roster_groups,
            }
        else:
            schedule[code]["date"] = clean(roster_course.get("date")) or schedule[code]["date"]
            schedule[code]["time"] = clean(roster_course.get("time")) or schedule[code]["time"]
            schedule[code]["title"] = clean(roster_course.get("title")) or schedule[code]["title"]
            schedule[code]["sum_student"] = int(roster_course.get("sum_student", 0) or 0) or schedule[code]["sum_student"]
            schedule[code]["group"] = roster_groups

        expected_total = int(schedule[code].get("sum_student", 0) or 0)
        listed_total = sum(len(group["student_list"]) for group in schedule[code]["group"])
        if expected_total and listed_total and expected_total != listed_total:
            warnings.append(
                "{} from {}: sum_student={} but student_list total={}".format(
                    code,
                    source_path,
                    expected_total,
                    listed_total,
                )
            )

    return warnings


def write_json(path: str, data: Dict[str, Any]) -> None:
    output_dir = os.path.dirname(path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
        file.write("\n")


def build_output(args: argparse.Namespace) -> Tuple[Dict[str, Any], List[str]]:
    schedule = make_base_schedule(args.schedule)
    warnings = []
    warnings.extend(
        apply_roster_courses(
            schedule,
            [args.roster_json, args.pdf_roster_json],
            count_from_list=args.count_from_list,
        )
    )
    return schedule, warnings


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--schedule", default=DEFAULT_SCHEDULE)
    parser.add_argument("--roster-json", default=DEFAULT_ROSTER_JSON)
    parser.add_argument("--pdf-roster-json", default=DEFAULT_PDF_ROSTER_JSON)
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--count-from-list",
        action="store_true",
        help="Set each room's students count to len(student_list) for roster-backed courses.",
    )
    args = parser.parse_args()

    output, warnings = build_output(args)
    write_json(args.output, output)

    total_courses = len(output)
    total_rooms = sum(len(course["group"]) for course in output.values())
    total_student_records = sum(
        len(group["student_list"])
        for course in output.values()
        for group in course["group"]
    )
    print(
        "Done! {} written with {} course(s), {} room(s), {} student record(s).".format(
            args.output,
            total_courses,
            total_rooms,
            total_student_records,
        )
    )
    for warning in warnings:
        print("Warning: {}".format(warning))


if __name__ == "__main__":
    main()
