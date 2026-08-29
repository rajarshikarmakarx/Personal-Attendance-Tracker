from datetime import date as date_type
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user, CurrentUser
from app.services.schedule_service import get_schedule_for_date, get_schedule_for_range
from app.schemas import ScheduleEntryOut

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/range", response_model=Dict[str, List[ScheduleEntryOut]])
def get_schedule_range(
    start_date: date_type,
    end_date: date_type,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return get_schedule_for_range(db, start_date, end_date, current_user.user_id, current_user.group_number)


@router.get("/{date}", response_model=List[ScheduleEntryOut])
def get_daily_schedule(
    date: date_type,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return get_schedule_for_date(db, date, current_user.user_id, current_user.group_number)

