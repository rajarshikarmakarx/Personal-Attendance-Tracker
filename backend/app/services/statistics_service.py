from datetime import date
from typing import List
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from app.models import AttendanceRecord, TimetableEntry, Subject, Teacher, AttendanceStatusEnum
from app.schemas import OverallStats, SubjectStats, TeacherStats

SESSION_START_DATE = date(2026, 8, 10)


def _calc_percentage(attended: int, conducted: int) -> float:
    if conducted == 0:
        return 0.0
    return round(attended / conducted * 100, 1)


def get_overall_stats(db: Session, user_id: str, group_number: int) -> OverallStats:
    counts = (
        db.query(AttendanceRecord.status, func.count(AttendanceRecord.id))
        .join(TimetableEntry, AttendanceRecord.timetable_entry_id == TimetableEntry.id)
        .filter(
            AttendanceRecord.user_id == user_id,
            TimetableEntry.group_number == group_number,
            AttendanceRecord.date >= SESSION_START_DATE,
        )
        .group_by(AttendanceRecord.status)
        .all()
    )

    count_map = {status: cnt for status, cnt in counts}
    present = count_map.get(AttendanceStatusEnum.PRESENT, 0)
    absent = count_map.get(AttendanceStatusEnum.ABSENT, 0)
    cancelled = count_map.get(AttendanceStatusEnum.CANCELLED, 0)
    conducted = present + absent

    return OverallStats(
        present=present,
        absent=absent,
        cancelled=cancelled,
        conducted=conducted,
        percentage=_calc_percentage(present, conducted),
    )


def get_subject_stats(db: Session, user_id: str, group_number: int) -> List[SubjectStats]:
    rows = (
        db.query(
            Subject.id,
            Subject.name,
            Subject.code,
            Subject.short_name,
            AttendanceRecord.status,
            func.count(AttendanceRecord.id)
        )
        .join(TimetableEntry, TimetableEntry.subject_id == Subject.id)
        .outerjoin(
            AttendanceRecord,
            and_(
                TimetableEntry.id == AttendanceRecord.timetable_entry_id,
                AttendanceRecord.user_id == user_id,
                AttendanceRecord.date >= SESSION_START_DATE,
            )
        )
        .filter(TimetableEntry.group_number == group_number)
        .group_by(Subject.id, AttendanceRecord.status)
        .all()
    )

    subject_data = {}
    for subj_id, name, code, short_name, status, count in rows:
        if subj_id not in subject_data:
            subject_data[subj_id] = {
                "id": subj_id,
                "name": name,
                "code": code,
                "short_name": short_name,
                "present": 0,
                "absent": 0,
                "cancelled": 0,
            }
        if status == AttendanceStatusEnum.PRESENT:
            subject_data[subj_id]["present"] = count
        elif status == AttendanceStatusEnum.ABSENT:
            subject_data[subj_id]["absent"] = count
        elif status == AttendanceStatusEnum.CANCELLED:
            subject_data[subj_id]["cancelled"] = count

    result = []
    for s_id, data in subject_data.items():
        present = data["present"]
        absent = data["absent"]
        conducted = present + absent
        result.append(SubjectStats(
            subject_id=data["id"],
            subject_name=data["name"],
            subject_code=data["code"],
            subject_short_name=data["short_name"],
            present=present,
            absent=absent,
            cancelled=data["cancelled"],
            conducted=conducted,
            percentage=_calc_percentage(present, conducted),
        ))
    return result


def get_teacher_stats(db: Session, user_id: str, group_number: int) -> List[TeacherStats]:
    rows = (
        db.query(
            Teacher.id,
            Teacher.name,
            Subject.id,
            Subject.name,
            Subject.code,
            AttendanceRecord.status,
            func.count(AttendanceRecord.id)
        )
        .join(TimetableEntry, TimetableEntry.teacher_id == Teacher.id)
        .join(Subject, TimetableEntry.subject_id == Subject.id)
        .outerjoin(
            AttendanceRecord,
            and_(
                TimetableEntry.id == AttendanceRecord.timetable_entry_id,
                AttendanceRecord.user_id == user_id,
                AttendanceRecord.date >= SESSION_START_DATE,
            )
        )
        .filter(TimetableEntry.group_number == group_number)
        .group_by(Teacher.id, Subject.id, AttendanceRecord.status)
        .all()
    )

    teacher_data = {}
    for teacher_id, teacher_name, subj_id, subj_name, subj_code, status, count in rows:
        key = (teacher_id, subj_id)
        if key not in teacher_data:
            teacher_data[key] = {
                "teacher_id": teacher_id,
                "teacher_name": teacher_name,
                "subject_id": subj_id,
                "subject_name": subj_name,
                "subject_code": subj_code,
                "present": 0,
                "absent": 0,
                "cancelled": 0,
            }
        if status == AttendanceStatusEnum.PRESENT:
            teacher_data[key]["present"] = count
        elif status == AttendanceStatusEnum.ABSENT:
            teacher_data[key]["absent"] = count
        elif status == AttendanceStatusEnum.CANCELLED:
            teacher_data[key]["cancelled"] = count

    result = []
    for key, data in teacher_data.items():
        present = data["present"]
        absent = data["absent"]
        conducted = present + absent
        result.append(TeacherStats(
            teacher_id=data["teacher_id"],
            teacher_name=data["teacher_name"],
            subject_id=data["subject_id"],
            subject_name=data["subject_name"],
            subject_code=data["subject_code"],
            present=present,
            absent=absent,
            cancelled=data["cancelled"],
            conducted=conducted,
            percentage=_calc_percentage(present, conducted),
        ))
    return result
