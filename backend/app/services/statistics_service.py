from typing import List
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from app.models import AttendanceRecord, TimetableEntry, Subject, Teacher, AttendanceStatusEnum
from app.schemas import OverallStats, SubjectStats, TeacherStats


def _calc_percentage(attended: int, conducted: int) -> float:
    if conducted == 0:
        return 0.0
    return round(attended / conducted * 100, 1)


def get_overall_stats(db: Session, user_id: str) -> OverallStats:
    counts = (
        db.query(AttendanceRecord.status, func.count(AttendanceRecord.id))
        .join(TimetableEntry, AttendanceRecord.timetable_entry_id == TimetableEntry.id)
        .filter(
            AttendanceRecord.user_id == user_id,
            TimetableEntry.user_id == user_id,
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


def get_subject_stats(db: Session, user_id: str) -> List[SubjectStats]:
    # Query all subjects for the user
    subjects = db.query(Subject).filter(Subject.user_id == user_id).order_by(Subject.name).all()
    if not subjects:
        return []

    # Get attendance counts per subject
    rows = (
        db.query(
            Subject.id,
            AttendanceRecord.status,
            func.count(AttendanceRecord.id)
        )
        .join(TimetableEntry, TimetableEntry.subject_id == Subject.id)
        .join(AttendanceRecord, and_(
            TimetableEntry.id == AttendanceRecord.timetable_entry_id,
            AttendanceRecord.user_id == user_id,
        ))
        .filter(Subject.user_id == user_id)
        .group_by(Subject.id, AttendanceRecord.status)
        .all()
    )

    counts_by_subject = {}
    for subj_id, status, count in rows:
        counts_by_subject.setdefault(subj_id, {})[status] = count

    result = []
    for s in subjects:
        c_map = counts_by_subject.get(s.id, {})
        present = c_map.get(AttendanceStatusEnum.PRESENT, 0)
        absent = c_map.get(AttendanceStatusEnum.ABSENT, 0)
        cancelled = c_map.get(AttendanceStatusEnum.CANCELLED, 0)
        conducted = present + absent
        result.append(SubjectStats(
            subject_id=s.id,
            subject_name=s.name,
            subject_code=s.code,
            subject_short_name=s.short_name,
            present=present,
            absent=absent,
            cancelled=cancelled,
            conducted=conducted,
            percentage=_calc_percentage(present, conducted),
        ))

    return result


def get_teacher_stats(db: Session, user_id: str) -> List[TeacherStats]:
    rows = (
        db.query(
            TimetableEntry.teacher_id,
            TimetableEntry.teacher_name,
            Teacher.name.label("teacher_table_name"),
            Subject.id.label("subject_id"),
            Subject.name.label("subject_name"),
            Subject.code.label("subject_code"),
            AttendanceRecord.status,
            func.count(AttendanceRecord.id)
        )
        .join(Subject, TimetableEntry.subject_id == Subject.id)
        .outerjoin(Teacher, TimetableEntry.teacher_id == Teacher.id)
        .join(AttendanceRecord, and_(
            TimetableEntry.id == AttendanceRecord.timetable_entry_id,
            AttendanceRecord.user_id == user_id,
        ))
        .filter(TimetableEntry.user_id == user_id)
        .group_by(
            TimetableEntry.teacher_id,
            TimetableEntry.teacher_name,
            Teacher.name,
            Subject.id,
            Subject.name,
            Subject.code,
            AttendanceRecord.status
        )
        .all()
    )

    teacher_data = {}
    for t_id, t_name, t_table_name, subj_id, subj_name, subj_code, status, count in rows:
        display_name = t_name or t_table_name or "Instructor"
        key = (display_name, subj_id)
        if key not in teacher_data:
            teacher_data[key] = {
                "teacher_id": t_id,
                "teacher_name": display_name,
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
