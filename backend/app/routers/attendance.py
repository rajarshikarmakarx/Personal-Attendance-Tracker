from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user, CurrentUser
from app.services.attendance_service import upsert_attendance, delete_attendance
from app.schemas import AttendanceUpsert, AttendanceOut

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.put("", response_model=AttendanceOut)
def mark_attendance(
    payload: AttendanceUpsert,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return upsert_attendance(db, payload, current_user.user_id, current_user.group_number)


@router.delete("/{attendance_id}", status_code=204)
def remove_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    delete_attendance(db, attendance_id, current_user.user_id)
