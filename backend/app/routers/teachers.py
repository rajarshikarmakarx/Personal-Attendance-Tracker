from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Teacher
from app.schemas import TeacherOut, TeacherCreate
from app.auth import get_current_user, CurrentUser

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("", response_model=List[TeacherOut])
def list_teachers(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    return (
        db.query(Teacher)
        .filter(Teacher.user_id == current_user.user_id)
        .order_by(Teacher.name)
        .all()
    )


@router.post("", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
def create_teacher(
    payload: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    teacher = Teacher(
        user_id=current_user.user_id,
        name=payload.name.strip(),
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    teacher = (
        db.query(Teacher)
        .filter(Teacher.id == teacher_id, Teacher.user_id == current_user.user_id)
        .first()
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher
