from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import AttendanceRecord, TimetableEntry
from app.schemas import AttendanceUpsert


def upsert_attendance(
    db: Session,
    payload: AttendanceUpsert,
    user_id: str,
    group_number: int,
) -> AttendanceRecord:
    # Verify timetable entry exists AND belongs to user's group
    entry = (
        db.query(TimetableEntry)
        .filter(
            TimetableEntry.id == payload.timetable_entry_id,
            TimetableEntry.group_number == group_number,
        )
        .first()
    )
    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Timetable entry not found or does not belong to your group",
        )

    record = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.user_id == user_id,
            AttendanceRecord.timetable_entry_id == payload.timetable_entry_id,
            AttendanceRecord.date == payload.date,
        )
        .first()
    )

    if record:
        record.status = payload.status
        record.notes = payload.notes
        record.updated_at = datetime.utcnow()
    else:
        record = AttendanceRecord(
            user_id=user_id,
            timetable_entry_id=payload.timetable_entry_id,
            date=payload.date,
            status=payload.status,
            notes=payload.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return record


def delete_attendance(db: Session, attendance_id: int, user_id: str) -> None:
    record = (
        db.query(AttendanceRecord)
        .filter(
            AttendanceRecord.id == attendance_id,
            AttendanceRecord.user_id == user_id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    db.delete(record)
    db.commit()
