from datetime import date, datetime, time
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from app.models import AttendanceStatusEnum, WeekdayEnum


# ── Subject ──────────────────────────────────────────────────────────────────

class SubjectBase(BaseModel):
    name: str
    code: str
    short_name: str


class SubjectOut(SubjectBase):
    id: int

    class Config:
        from_attributes = True


# ── Teacher ───────────────────────────────────────────────────────────────────

class TeacherBase(BaseModel):
    name: str


class TeacherOut(TeacherBase):
    id: int

    class Config:
        from_attributes = True


# ── TimetableEntry ────────────────────────────────────────────────────────────

class TimetableEntryOut(BaseModel):
    id: int
    weekday: WeekdayEnum
    start_time: time
    end_time: time
    room: Optional[str]
    period_number: Optional[int]
    class_type: str
    group_number: int
    subject: SubjectOut
    teacher: TeacherOut

    class Config:
        from_attributes = True


# ── Schedule (daily view) ─────────────────────────────────────────────────────

class ScheduleEntryOut(BaseModel):
    timetable_entry_id: int
    subject: SubjectOut
    teacher: TeacherOut
    start_time: time
    end_time: time
    room: Optional[str]
    class_type: str
    period_number: Optional[int]
    status: str  # PRESENT | ABSENT | CANCELLED | UNMARKED
    attendance_id: Optional[int]
    notes: Optional[str]


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceUpsert(BaseModel):
    timetable_entry_id: int
    date: date
    status: AttendanceStatusEnum
    notes: Optional[str] = None


class AttendanceOut(BaseModel):
    id: int
    timetable_entry_id: int
    date: date
    status: AttendanceStatusEnum
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    group_number: int  # 1 or 2


class ProfileOut(BaseModel):
    user_id: UUID
    email: str
    group_number: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Statistics ────────────────────────────────────────────────────────────────

class OverallStats(BaseModel):
    present: int
    absent: int
    cancelled: int
    conducted: int
    percentage: float


class SubjectStats(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    subject_short_name: str
    present: int
    absent: int
    cancelled: int
    conducted: int
    percentage: float


class TeacherStats(BaseModel):
    teacher_id: int
    teacher_name: str
    subject_id: int
    subject_name: str
    subject_code: str
    present: int
    absent: int
    cancelled: int
    conducted: int
    percentage: float
