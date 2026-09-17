from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Profile
from app.schemas import ProfileOut, ProfileUpdate
from app.auth import get_current_user, CurrentUser

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileOut)
def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.user_id).first()
    if not profile:
        profile = Profile(
            user_id=current_user.user_id,
            email=current_user.email,
            schedule_locked=False,
            created_at=datetime.utcnow(),
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.patch("", response_model=ProfileOut)
def update_profile(
    payload: ProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.user_id).first()
    if not profile:
        profile = Profile(
            user_id=current_user.user_id,
            email=current_user.email,
            schedule_locked=payload.schedule_locked if payload.schedule_locked is not None else False,
            created_at=datetime.utcnow(),
        )
        db.add(profile)
    else:
        if payload.schedule_locked is not None:
            profile.schedule_locked = payload.schedule_locked

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/lock", response_model=ProfileOut)
def lock_schedule(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.user_id).first()
    if not profile:
        profile = Profile(
            user_id=current_user.user_id,
            email=current_user.email,
            schedule_locked=True,
            created_at=datetime.utcnow(),
        )
        db.add(profile)
    else:
        profile.schedule_locked = True

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/unlock", response_model=ProfileOut)
def unlock_schedule(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.user_id).first()
    if not profile:
        profile = Profile(
            user_id=current_user.user_id,
            email=current_user.email,
            schedule_locked=False,
            created_at=datetime.utcnow(),
        )
        db.add(profile)
    else:
        profile.schedule_locked = False

    db.commit()
    db.refresh(profile)
    return profile
