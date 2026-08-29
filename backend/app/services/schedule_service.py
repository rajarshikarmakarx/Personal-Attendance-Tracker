from datetime import date as date_type
from typing import List
from sqlalchemy.orm import Session, joinedload
from app.models import TimetableEntry, AttendanceRecord, WeekdayEnum
from app.schemas import ScheduleEntryOut, SubjectOut, TeacherOut

_WEEKDAY_MAP = {
    0: WeekdayEnum.MONDAY,
    1: WeekdayEnum.TUESDAY,
    2: WeekdayEnum.WEDNESDAY,
    3: WeekdayEnum.THURSDAY,
    4: WeekdayEnum.FRIDAY,
    5: WeekdayEnum.SATURDAY,
    6: WeekdayEnum.SUNDAY,
}


SESSION_START_DATE = date_type(2026, 8, 10)


def get_schedule_for_date(
    db: Session,
    target_date: date_type,
    user_id: str,
    group_number: int,
) -> List[ScheduleEntryOut]:
    if target_date < SESSION_START_DATE:
        return []

    weekday = _WEEKDAY_MAP[target_date.weekday()]

    entries = (
        db.query(TimetableEntry)
        .options(joinedload(TimetableEntry.subject), joinedload(TimetableEntry.teacher))
        .filter(
            TimetableEntry.weekday == weekday,
            TimetableEntry.group_number == group_number,
        )
        .order_by(TimetableEntry.start_time)
        .all()
    )

    if not entries:
        return []

    entry_ids = [e.id for e in entries]
    records = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.user_id == user_id,
            AttendanceRecord.timetable_entry_id.in_(entry_ids),
            AttendanceRecord.date == target_date,
        )
        .all()
    )
    record_map = {r.timetable_entry_id: r for r in records}

    result = []
    for entry in entries:
        rec = record_map.get(entry.id)
        result.append(
            ScheduleEntryOut(
                timetable_entry_id=entry.id,
                subject=SubjectOut.model_validate(entry.subject),
                teacher=TeacherOut.model_validate(entry.teacher),
                start_time=entry.start_time,
                end_time=entry.end_time,
                room=entry.room,
                class_type=entry.class_type,
                period_number=entry.period_number,
                status=rec.status.value if rec else "UNMARKED",
                attendance_id=rec.id if rec else None,
                notes=rec.notes if rec else None,
            )
        )

    return result


def get_schedule_for_range(
    db: Session,
    start_date: date_type,
    end_date: date_type,
    user_id: str,
    group_number: int,
) -> dict[str, List[ScheduleEntryOut]]:
    if end_date < SESSION_START_DATE:
        return {}

    # Clamp start_date to SESSION_START_DATE
    if start_date < SESSION_START_DATE:
        start_date = SESSION_START_DATE

    from datetime import timedelta

    # 1. Fetch all timetable entries for this group
    timetable_entries = (
        db.query(TimetableEntry)
        .options(joinedload(TimetableEntry.subject), joinedload(TimetableEntry.teacher))
        .filter(TimetableEntry.group_number == group_number)
        .all()
    )

    # Group timetable entries by weekday for quick lookup
    entries_by_weekday = {}
    for entry in timetable_entries:
        entries_by_weekday.setdefault(entry.weekday, []).append(entry)

    # 2. Fetch all attendance records for this user in the date range
    records = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.user_id == user_id,
            AttendanceRecord.date >= start_date,
            AttendanceRecord.date <= end_date,
        )
        .all()
    )

    # Group records by (date, timetable_entry_id)
    record_map = {(r.date, r.timetable_entry_id): r for r in records}

    # 3. Iterate through each day in the range and construct schedule list
    result = {}
    curr_date = start_date
    while curr_date <= end_date:
        date_str = curr_date.isoformat()
        weekday = _WEEKDAY_MAP[curr_date.weekday()]
        day_entries = entries_by_weekday.get(weekday, [])

        if day_entries:
            day_schedule = []
            for entry in day_entries:
                rec = record_map.get((curr_date, entry.id))
                day_schedule.append(
                    ScheduleEntryOut(
                        timetable_entry_id=entry.id,
                        subject=SubjectOut.model_validate(entry.subject),
                        teacher=TeacherOut.model_validate(entry.teacher),
                        start_time=entry.start_time,
                        end_time=entry.end_time,
                        room=entry.room,
                        class_type=entry.class_type,
                        period_number=entry.period_number,
                        status=rec.status.value if rec else "UNMARKED",
                        attendance_id=rec.id if rec else None,
                        notes=rec.notes if rec else None,
                    )
                )
            # Sort by start_time
            day_schedule.sort(key=lambda x: x.start_time)
            result[date_str] = day_schedule

        curr_date += timedelta(days=1)

    return result

