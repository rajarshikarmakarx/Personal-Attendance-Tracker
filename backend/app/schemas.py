from datetime import date, datetime, time
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field
from app.models import AttendanceStatusEnum, WeekdayEnum


# ── Subject ──────────────────────────────────────────────────────────────────

class SubjectBase(BaseModel):
    name: str
    code: Optional[str] = None
    short_name: Optional[str] = None
    color: Optional[str] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectOut(BaseModel):
    id: int
    user_id: str
    name: str
    code: Optional[str] = None
    short_name: str
    color: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Teacher ───────────────────────────────────────────────────────────────────

class TeacherBase(BaseModel):
    name: str


class TeacherCreate(TeacherBase):
    pass


class TeacherOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# ── TimetableEntry ────────────────────────────────────────────────────────────

class TimetableEntryOut(BaseModel):
    id: int
    weekday: WeekdayEnum
    start_time: time
    end_time: time
    room: Optional[str] = None
    period_number: Optional[int] = None
    class_type: str = "L"
    subject: SubjectOut
    teacher: Optional[TeacherOut] = None
    teacher_name: Optional[str] = None

    class Config:
        from_attributes = True


class TimetableSlotInput(BaseModel):
    weekday: WeekdayEnum
    start_time: time
    end_time: time
    subject_name: str
    subject_code: Optional[str] = None
    short_name: Optional[str] = None
    teacher_name: Optional[str] = None
    room: Optional[str] = None
    class_type: str = "L"
    period_number: Optional[int] = None


class TimetableBatchSave(BaseModel):
    slots: List[TimetableSlotInput]
    lock_schedule: bool = True


# ── Schedule (daily view) ─────────────────────────────────────────────────────

class ScheduleEntryOut(BaseModel):
    timetable_entry_id: int
    subject: SubjectOut
    teacher: Optional[TeacherOut] = None
    teacher_name: Optional[str] = None
    start_time: time
    end_time: time
    room: Optional[str] = None
    class_type: str
    period_number: Optional[int] = None
    status: str  # PRESENT | ABSENT | CANCELLED | UNMARKED
    attendance_id: Optional[int] = None
    notes: Optional[str] = None


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
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Profile ───────────────────────────────────────────────────────────────────

class ProfileOut(BaseModel):
    user_id: UUID
    email: str
    schedule_locked: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    schedule_locked: Optional[bool] = None


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
    subject_code: Optional[str] = None
    subject_short_name: str
    present: int
    absent: int
    cancelled: int
    conducted: int
    percentage: float


class TeacherStats(BaseModel):
    teacher_id: Optional[int] = None
    teacher_name: str
    subject_id: int
    subject_name: str
    subject_code: Optional[str] = None
    present: int
    absent: int
    cancelled: int
    conducted: int
    percentage: float
