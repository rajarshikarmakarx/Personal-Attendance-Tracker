"""
Seed script — run from the backend/ directory:
    python seed_data.py

Idempotent: will not duplicate records if run multiple times.
Contains timetable data for both Group 1 and Group 2.
"""

import sys
import os
from datetime import time

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine
from app.models import Base, Subject, Teacher, TimetableEntry, WeekdayEnum

# ─────────────────────────────────────────────────────────────────────────────
# SHARED DATA (same for both groups)
# ─────────────────────────────────────────────────────────────────────────────

SUBJECTS = [
    {"name": "Engineering Mathematics-I",  "code": "MTH1101", "short_name": "Maths"},
    {"name": "Engineering Physics-I",      "code": "PHY1001", "short_name": "Physics"},
    {"name": "Basic Electronics",          "code": "ECE1001", "short_name": "Electronics"},
    {"name": "Communication Skills",       "code": "HUM1002", "short_name": "Comm Skills"},
    {"name": "Professional Skills",        "code": "SS0001",  "short_name": "Soft Skills"},
    {"name": "Engineering Mechanics",      "code": "MEC1051", "short_name": "Mechanics"},
    {"name": "Manufacturing Technology",   "code": "MEC1052", "short_name": "Manufacturing"},
    {"name": "Electronics Laboratory",     "code": "ECE1051", "short_name": "ECE Lab"},
    {"name": "Physics Laboratory",         "code": "PHY1051", "short_name": "Physics Lab"},
]

TEACHERS = [
    # ── Group 1 teachers ──────────────────────────────────────────────────────
    {"name": "MS"},   # ECE1001 lectures
    {"name": "RJR"},  # PHY1001 Mon/Tue
    {"name": "CMM"},  # Soft Skills
    {"name": "SJC"},  # ECE1051 Lab Gr1 Mon
    {"name": "MDC"},  # HUM1002 Mon Gr1
    {"name": "SR"},   # MTH1101 lectures
    {"name": "ABC"},  # HUM1002 Tue + T1 Fri
    {"name": "RB"},   # MTH1101 tutorials
    {"name": "DB"},   # MEC1052 Lab Wed Gr1 / MEC1052 Lab Thu Gr2
    {"name": "AC"},   # PHY1001 Thu/Fri
    {"name": "VKS"},  # MEC1051 lecture + lab Thu Gr1
    {"name": "RS"},   # MEC1052 Fri Gr1
    {"name": "AD"},   # PHY1051 Lab Fri Gr1
    {"name": "KM"},   # HUM1002 T2 Fri (both groups)
    # ── Group 2 teachers ──────────────────────────────────────────────────────
    {"name": "RRP"},  # ECE1051 Lab Mon Gr2
    {"name": "SB"},   # MEC1051 Lab Wed Gr2
    {"name": "AB"},   # MEC1051 lecture Thu Gr2
    {"name": "ANP"},  # PHY1051 Lab Fri Gr2
    {"name": "RM"},   # MEC1052 lecture Fri Gr2
]

# ─────────────────────────────────────────────────────────────────────────────
# GROUP 1 TIMETABLE
# ─────────────────────────────────────────────────────────────────────────────

TIMETABLE_GR1 = {
    "MONDAY": [
        {"start_time": "09:00", "end_time": "10:00", "subject_code": "ECE1001", "teacher": "MS",  "room": "ICT210", "class_type": "L",   "period_number": 1},
        {"start_time": "10:00", "end_time": "11:00", "subject_code": "PHY1001", "teacher": "RJR", "room": "ICT210", "class_type": "L",   "period_number": 2},
        {"start_time": "11:00", "end_time": "12:00", "subject_code": "SS0001",  "teacher": "CMM", "room": "CB616",  "class_type": "L",   "period_number": 3},
        {"start_time": "13:00", "end_time": "15:00", "subject_code": "ECE1051", "teacher": "SJC", "room": "ICT502", "class_type": "LAB", "period_number": 4},
        {"start_time": "15:00", "end_time": "16:00", "subject_code": "HUM1002", "teacher": "MDC", "room": "ICT105", "class_type": "L",   "period_number": 6},
    ],
    "TUESDAY": [
        {"start_time": "09:00", "end_time": "10:00", "subject_code": "MTH1101", "teacher": "SR",  "room": "ICT210", "class_type": "L", "period_number": 1},
        {"start_time": "10:00", "end_time": "11:00", "subject_code": "PHY1001", "teacher": "RJR", "room": "ICT210", "class_type": "L", "period_number": 2},
        {"start_time": "11:00", "end_time": "12:00", "subject_code": "HUM1002", "teacher": "ABC", "room": "ICT210", "class_type": "L", "period_number": 3},
        {"start_time": "13:00", "end_time": "14:00", "subject_code": "MTH1101", "teacher": "RB",  "room": "ICT210", "class_type": "T", "period_number": 4},
        {"start_time": "14:00", "end_time": "15:00", "subject_code": "ECE1001", "teacher": "MS",  "room": "ICT210", "class_type": "L", "period_number": 5},
        {"start_time": "15:00", "end_time": "16:00", "subject_code": "MTH1101", "teacher": "RB",  "room": "ICT210", "class_type": "T", "period_number": 6},
    ],
    "WEDNESDAY": [
        {"start_time": "09:00", "end_time": "12:00", "subject_code": "MEC1052", "teacher": "DB",  "room": "CME 214", "class_type": "LAB", "period_number": 1},
        {"start_time": "14:00", "end_time": "15:00", "subject_code": "MTH1101", "teacher": "SR",  "room": "ICT210",  "class_type": "L",   "period_number": 5},
        {"start_time": "15:00", "end_time": "16:00", "subject_code": "ECE1001", "teacher": "MS",  "room": "ICT210",  "class_type": "L",   "period_number": 6},
    ],
    "THURSDAY": [
        {"start_time": "09:00", "end_time": "10:00", "subject_code": "PHY1001", "teacher": "AC",  "room": "ICT210",  "class_type": "L",   "period_number": 1},
        {"start_time": "10:00", "end_time": "11:00", "subject_code": "MTH1101", "teacher": "RB",  "room": "ICT210",  "class_type": "L",   "period_number": 2},
        {"start_time": "11:00", "end_time": "12:00", "subject_code": "MEC1051", "teacher": "VKS", "room": "ICT210",  "class_type": "L",   "period_number": 3},
        {"start_time": "13:00", "end_time": "16:00", "subject_code": "MEC1051", "teacher": "VKS", "room": "CME B06", "class_type": "LAB", "period_number": 4},
    ],
    "FRIDAY": [
        {"start_time": "09:00", "end_time": "12:00", "subject_code": "PHY1051", "teacher": "AD",  "room": "CB106A", "class_type": "LAB", "period_number": 1},
        {"start_time": "13:00", "end_time": "14:00", "subject_code": "PHY1001", "teacher": "AC",  "room": "ICT210", "class_type": "L",   "period_number": 4},
        {"start_time": "14:00", "end_time": "15:00", "subject_code": "MEC1052", "teacher": "RS",  "room": "ICT210", "class_type": "L",   "period_number": 5},
        {"start_time": "15:00", "end_time": "16:00", "subject_code": "HUM1002", "teacher": "ABC", "room": "ICT210", "class_type": "T",   "period_number": 6},
        {"start_time": "16:00", "end_time": "17:00", "subject_code": "HUM1002", "teacher": "KM",  "room": "ICT206", "class_type": "T",   "period_number": 7},
    ],
}

# ─────────────────────────────────────────────────────────────────────────────
# GROUP 2 TIMETABLE
# Lectures identical to Gr1; labs/some teachers differ
# ─────────────────────────────────────────────────────────────────────────────

TIMETABLE_GR2 = {
    "MONDAY": [
        {"start_time": "09:00", "end_time": "10:00", "subject_code": "ECE1001", "teacher": "MS",  "room": "ICT210", "class_type": "L",   "period_number": 1},
        {"start_time": "10:00", "end_time": "11:00", "subject_code": "PHY1001", "teacher": "RJR", "room": "ICT210", "class_type": "L",   "period_number": 2},
        {"start_time": "11:00", "end_time": "12:00", "subject_code": "SS0001",  "teacher": "CMM", "room": "CB616",  "class_type": "L",   "period_number": 3},
        # Gr2 ECE Lab: different teacher (RRP) and room (ICT401)
        {"start_time": "13:00", "end_time": "15:00", "subject_code": "ECE1051", "teacher": "RRP", "room": "ICT401", "class_type": "LAB", "period_number": 4},
        # Gr2 has no HUM1002 lecture on Monday (Library slot)
    ],
    "TUESDAY": [
        # Same as Group 1
        {"start_time": "09:00", "end_time": "10:00", "subject_code": "MTH1101", "teacher": "SR",  "room": "ICT210", "class_type": "L", "period_number": 1},
        {"start_time": "10:00", "end_time": "11:00", "subject_code": "PHY1001", "teacher": "RJR", "room": "ICT210", "class_type": "L", "period_number": 2},
        {"start_time": "11:00", "end_time": "12:00", "subject_code": "HUM1002", "teacher": "ABC", "room": "ICT210", "class_type": "L", "period_number": 3},
        {"start_time": "13:00", "end_time": "14:00", "subject_code": "MTH1101", "teacher": "RB",  "room": "ICT210", "class_type": "T", "period_number": 4},
        {"start_time": "14:00", "end_time": "15:00", "subject_code": "ECE1001", "teacher": "MS",  "room": "ICT210", "class_type": "L", "period_number": 5},
        {"start_time": "15:00", "end_time": "16:00", "subject_code": "MTH1101", "teacher": "RB",  "room": "ICT210", "class_type": "T", "period_number": 6},
    ],
    "WEDNESDAY": [
        # Gr2: MEC1051 Lab (not MEC1052), different teacher (SB) and room (CME B12)
        {"start_time": "09:00", "end_time": "12:00", "subject_code": "MEC1051", "teacher": "SB",  "room": "CME B12", "class_type": "LAB", "period_number": 1},
        {"start_time": "14:00", "end_time": "15:00", "subject_code": "MTH1101", "teacher": "SR",  "room": "ICT210",  "class_type": "L",   "period_number": 5},
        {"start_time": "15:00", "end_time": "16:00", "subject_code": "ECE1001", "teacher": "MS",  "room": "ICT210",  "class_type": "L",   "period_number": 6},
    ],
    "THURSDAY": [
        {"start_time": "09:00", "end_time": "10:00", "subject_code": "PHY1001", "teacher": "AC",  "room": "ICT210",  "class_type": "L",   "period_number": 1},
        {"start_time": "10:00", "end_time": "11:00", "subject_code": "MTH1101", "teacher": "RB",  "room": "ICT210",  "class_type": "L",   "period_number": 2},
        # Gr2: MEC1051 lecture with AB in ICT206
        {"start_time": "11:00", "end_time": "12:00", "subject_code": "MEC1051", "teacher": "AB",  "room": "ICT206",  "class_type": "L",   "period_number": 3},
        # Gr2: MEC1052 Lab (not MEC1051), teacher DB, room CME I18
        {"start_time": "13:00", "end_time": "16:00", "subject_code": "MEC1052", "teacher": "DB",  "room": "CME I18", "class_type": "LAB", "period_number": 4},
    ],
    "FRIDAY": [
        # Gr2: PHY1051 Lab with ANP in CB106B
        {"start_time": "09:00", "end_time": "12:00", "subject_code": "PHY1051", "teacher": "ANP", "room": "CB106B", "class_type": "LAB", "period_number": 1},
        {"start_time": "13:00", "end_time": "14:00", "subject_code": "PHY1001", "teacher": "AC",  "room": "ICT210", "class_type": "L",   "period_number": 4},
        # Gr2: MEC1052 lecture with RM in ICT205
        {"start_time": "14:00", "end_time": "15:00", "subject_code": "MEC1052", "teacher": "RM",  "room": "ICT205", "class_type": "L",   "period_number": 5},
        {"start_time": "15:00", "end_time": "16:00", "subject_code": "HUM1002", "teacher": "ABC", "room": "ICT210", "class_type": "T",   "period_number": 6},
        {"start_time": "16:00", "end_time": "17:00", "subject_code": "HUM1002", "teacher": "KM",  "room": "ICT206", "class_type": "T",   "period_number": 7},
    ],
}


def _t(s: str) -> time:
    h, m = s.split(":")
    return time(int(h), int(m))


def seed():
    # Tables are created via supabase_migration.sql — skip create_all to avoid
    # conflicts with Postgres enum types already defined in Supabase.
    print("Connecting to Supabase database...")

    db = SessionLocal()
    try:
        # ── Subjects ──────────────────────────────────────────────────────────
        subject_map: dict[str, Subject] = {}
        for s in SUBJECTS:
            existing = db.query(Subject).filter(Subject.code == s["code"]).first()
            if not existing:
                obj = Subject(name=s["name"], code=s["code"], short_name=s["short_name"])
                db.add(obj)
                db.flush()
                subject_map[s["code"]] = obj
                print(f"  ✓ Subject: {s['name']}")
            else:
                subject_map[s["code"]] = existing
                print(f"  · Subject exists: {s['name']}")

        # ── Teachers ──────────────────────────────────────────────────────────
        teacher_map: dict[str, Teacher] = {}
        for t in TEACHERS:
            existing = db.query(Teacher).filter(Teacher.name == t["name"]).first()
            if not existing:
                obj = Teacher(name=t["name"])
                db.add(obj)
                db.flush()
                teacher_map[t["name"]] = obj
                print(f"  ✓ Teacher: {t['name']}")
            else:
                teacher_map[t["name"]] = existing
                print(f"  · Teacher exists: {t['name']}")

        # ── Timetable Entries (Group 1 & 2) ───────────────────────────────────
        for group_number, timetable in [(1, TIMETABLE_GR1), (2, TIMETABLE_GR2)]:
            print(f"\n  Seeding Group {group_number} timetable...")
            for weekday_str, entries in timetable.items():
                weekday_enum = WeekdayEnum(weekday_str)
                for e in entries:
                    subject = subject_map[e["subject_code"]]
                    teacher = teacher_map[e["teacher"]]
                    start = _t(e["start_time"])
                    end = _t(e["end_time"])

                    existing = (
                        db.query(TimetableEntry)
                        .filter(
                            TimetableEntry.weekday == weekday_enum,
                            TimetableEntry.subject_id == subject.id,
                            TimetableEntry.teacher_id == teacher.id,
                            TimetableEntry.start_time == start,
                            TimetableEntry.group_number == group_number,
                        )
                        .first()
                    )
                    if not existing:
                        obj = TimetableEntry(
                            subject_id=subject.id,
                            teacher_id=teacher.id,
                            weekday=weekday_enum,
                            start_time=start,
                            end_time=end,
                            room=e.get("room"),
                            class_type=e.get("class_type", "L"),
                            period_number=e.get("period_number"),
                            group_number=group_number,
                        )
                        db.add(obj)
                        print(f"    ✓ Gr{group_number} {weekday_str} {e['start_time']} {e['subject_code']} ({e['teacher']})")
                    else:
                        print(f"    · Exists: Gr{group_number} {weekday_str} {e['start_time']} {e['subject_code']}")

        db.commit()
        print("\n✅ Seeding complete.")
    except Exception as ex:
        db.rollback()
        print(f"\n❌ Error during seeding: {ex}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
