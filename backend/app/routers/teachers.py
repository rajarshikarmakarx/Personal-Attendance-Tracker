from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Teacher
from app.schemas import TeacherOut

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("", response_model=List[TeacherOut])
def list_teachers(db: Session = Depends(get_db)):
    return db.query(Teacher).order_by(Teacher.name).all()


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher
