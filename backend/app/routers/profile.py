from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import Profile
from app.schemas import ProfileCreate, ProfileOut
from app.auth import get_current_user, get_current_user_no_profile, CurrentUser

router = APIRouter(prefix="/profile", tags=["profile"])


@router.post("", response_model=ProfileOut, status_code=201)
def create_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    user_info: tuple = Depends(get_current_user_no_profile),
):
    user_id, email = user_info

    if payload.group_number not in (1, 2):
        raise HTTPException(status_code=400, detail="group_number must be 1 or 2")

    existing = db.query(Profile).filter(Profile.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Profile already exists")

    profile = Profile(
        user_id=user_id,
        email=email,
        group_number=payload.group_number,
        created_at=datetime.utcnow(),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("", response_model=ProfileOut)
def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
