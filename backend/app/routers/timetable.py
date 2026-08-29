from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import TimetableEntry, WeekdayEnum
from app.schemas import TimetableEntryOut

router = APIRouter(prefix="/timetable", tags=["timetable"])


@router.get("", response_model=List[TimetableEntryOut])
def list_timetable(db: Session = Depends(get_db)):
    entries = (
        db.query(TimetableEntry)
        .options(joinedload(TimetableEntry.subject), joinedload(TimetableEntry.teacher))
        .order_by(TimetableEntry.weekday, TimetableEntry.start_time)
        .all()
    )
    return entries


@router.get("/{weekday}", response_model=List[TimetableEntryOut])
def get_timetable_for_weekday(weekday: str, db: Session = Depends(get_db)):
    weekday_upper = weekday.upper()
    try:
        weekday_enum = WeekdayEnum(weekday_upper)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid weekday: {weekday}")

    entries = (
        db.query(TimetableEntry)
        .options(joinedload(TimetableEntry.subject), joinedload(TimetableEntry.teacher))
        .filter(TimetableEntry.weekday == weekday_enum)
        .order_by(TimetableEntry.start_time)
        .all()
    )
    return entries
