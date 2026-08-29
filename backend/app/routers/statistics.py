from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user, CurrentUser
from app.services.statistics_service import (
    get_overall_stats,
    get_subject_stats,
    get_teacher_stats,
)
from app.schemas import OverallStats, SubjectStats, TeacherStats

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/overall", response_model=OverallStats)
def overall_statistics(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return get_overall_stats(db, current_user.user_id, current_user.group_number)


@router.get("/subjects", response_model=List[SubjectStats])
def subject_statistics(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return get_subject_stats(db, current_user.user_id, current_user.group_number)


@router.get("/teachers", response_model=List[TeacherStats])
def teacher_statistics(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return get_teacher_stats(db, current_user.user_id, current_user.group_number)
