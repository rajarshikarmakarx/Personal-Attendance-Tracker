import enum
from datetime import date, datetime, time
from sqlalchemy import (
    Column, Integer, String, Date, DateTime, Time, Boolean,
    ForeignKey, UniqueConstraint, Index, Enum as SAEnum, Text
)
from sqlalchemy.orm import relationship
from app.database import Base


class WeekdayEnum(str, enum.Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"
    SUNDAY = "SUNDAY"


class AttendanceStatusEnum(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    CANCELLED = "CANCELLED"


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)  # Supabase UUID as string
    name = Column(String(255), nullable=False)
    code = Column(String(50), nullable=True)
    short_name = Column(String(100), nullable=False)
    color = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    timetable_entries = relationship("TimetableEntry", back_populates="subject", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_subject_user_id", "user_id"),
        Index("ix_subject_name", "name"),
    )


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)  # Supabase UUID as string
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    timetable_entries = relationship("TimetableEntry", back_populates="teacher")

    __table_args__ = (
        Index("ix_teacher_user_id", "user_id"),
        Index("ix_teacher_name", "name"),
    )


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)  # Supabase UUID as string
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True)
    teacher_name = Column(String(255), nullable=True)
    weekday = Column(SAEnum(WeekdayEnum, name="weekday_enum", create_type=False), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String(100), nullable=True)
    period_number = Column(Integer, nullable=True)
    class_type = Column(String(10), nullable=False, default="L")  # L, T, LAB
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    subject = relationship("Subject", back_populates="timetable_entries")
    teacher = relationship("Teacher", back_populates="timetable_entries")
    attendance_records = relationship("AttendanceRecord", back_populates="timetable_entry", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_timetable_user_id", "user_id"),
        Index("ix_timetable_weekday", "weekday"),
    )


class Profile(Base):
    """One row per Supabase auth user — stores schedule lock status."""
    __tablename__ = "profiles"

    user_id = Column(String(36), primary_key=True)  # Supabase UUID as string
    email = Column(String(255), nullable=False)
    schedule_locked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), nullable=False)  # Supabase UUID as string
    timetable_entry_id = Column(Integer, ForeignKey("timetable_entries.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(SAEnum(AttendanceStatusEnum, name="attendance_status_enum", create_type=False), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    timetable_entry = relationship("TimetableEntry", back_populates="attendance_records")

    __table_args__ = (
        UniqueConstraint("user_id", "timetable_entry_id", "date", name="uq_user_attendance_entry_date"),
        Index("ix_attendance_date", "date"),
        Index("ix_attendance_entry_id", "timetable_entry_id"),
        Index("ix_attendance_user_id", "user_id"),
    )
