from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import TimetableEntry, Subject, Teacher, Profile, WeekdayEnum
from app.schemas import TimetableEntryOut, TimetableBatchSave
from app.auth import get_current_user, CurrentUser

router = APIRouter(prefix="/timetable", tags=["timetable"])


@router.get("", response_model=List[TimetableEntryOut])
def list_timetable(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    entries = (
        db.query(TimetableEntry)
        .options(joinedload(TimetableEntry.subject), joinedload(TimetableEntry.teacher))
        .filter(TimetableEntry.user_id == current_user.user_id)
        .order_by(TimetableEntry.weekday, TimetableEntry.start_time)
        .all()
    )
    return entries


@router.get("/{weekday}", response_model=List[TimetableEntryOut])
def get_timetable_for_weekday(
    weekday: str,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    weekday_upper = weekday.upper()
    try:
        weekday_enum = WeekdayEnum(weekday_upper)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid weekday: {weekday}")

    entries = (
        db.query(TimetableEntry)
        .options(joinedload(TimetableEntry.subject), joinedload(TimetableEntry.teacher))
        .filter(
            TimetableEntry.user_id == current_user.user_id,
            TimetableEntry.weekday == weekday_enum,
        )
        .order_by(TimetableEntry.start_time)
        .all()
    )
    return entries


@router.post("/batch", response_model=List[TimetableEntryOut])
def save_batch_timetable(
    payload: TimetableBatchSave,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    user_id = current_user.user_id

    # 1. Fetch existing subjects and teachers for this user
    existing_subjects = {
        s.name.lower().strip(): s
        for s in db.query(Subject).filter(Subject.user_id == user_id).all()
    }
    existing_teachers = {
        t.name.lower().strip(): t
        for t in db.query(Teacher).filter(Teacher.user_id == user_id).all()
    }

    # 2. Clear old timetable entries for this user
    db.query(TimetableEntry).filter(TimetableEntry.user_id == user_id).delete(synchronize_session=False)

    new_entries = []
    for slot in payload.slots:
        subj_name = slot.subject_name.strip()
        subj_key = subj_name.lower()

        # Get or create subject
        if subj_key in existing_subjects:
            subject = existing_subjects[subj_key]
        else:
            short_name = slot.short_name or (subj_name[:12] if len(subj_name) > 12 else subj_name)
            subject = Subject(
                user_id=user_id,
                name=subj_name,
                code=slot.subject_code or None,
                short_name=short_name,
            )
            db.add(subject)
            db.flush()
            existing_subjects[subj_key] = subject

        # Get or create teacher if teacher_name provided
        teacher = None
        teacher_name = slot.teacher_name.strip() if slot.teacher_name else None
        if teacher_name:
            t_key = teacher_name.lower()
            if t_key in existing_teachers:
                teacher = existing_teachers[t_key]
            else:
                teacher = Teacher(user_id=user_id, name=teacher_name)
                db.add(teacher)
                db.flush()
                existing_teachers[t_key] = teacher

        entry = TimetableEntry(
            user_id=user_id,
            subject_id=subject.id,
            teacher_id=teacher.id if teacher else None,
            teacher_name=teacher_name,
            weekday=slot.weekday,
            start_time=slot.start_time,
            end_time=slot.end_time,
            room=slot.room,
            period_number=slot.period_number,
            class_type=slot.class_type or "L",
        )
        db.add(entry)
        new_entries.append(entry)

    # 3. Update profile schedule_locked status
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile:
        profile.schedule_locked = payload.lock_schedule
    else:
        profile = Profile(
            user_id=user_id,
            email=current_user.email,
            schedule_locked=payload.lock_schedule,
        )
        db.add(profile)

    db.commit()

    # Query back with joined relationships
    saved_entries = (
        db.query(TimetableEntry)
        .options(joinedload(TimetableEntry.subject), joinedload(TimetableEntry.teacher))
        .filter(TimetableEntry.user_id == user_id)
        .order_by(TimetableEntry.weekday, TimetableEntry.start_time)
        .all()
    )
    return saved_entries


@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_user_schedule(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    user_id = current_user.user_id
    db.query(TimetableEntry).filter(TimetableEntry.user_id == user_id).delete(synchronize_session=False)
    db.query(Subject).filter(Subject.user_id == user_id).delete(synchronize_session=False)
    db.query(Teacher).filter(Teacher.user_id == user_id).delete(synchronize_session=False)

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile:
        profile.schedule_locked = False

    db.commit()


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    entry = (
        db.query(TimetableEntry)
        .filter(TimetableEntry.id == entry_id, TimetableEntry.user_id == current_user.user_id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    db.delete(entry)
    db.commit()
