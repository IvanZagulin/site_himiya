from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter()


class ProfileUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName:  Optional[str] = None
    dob:       Optional[str] = None
    grade:     Optional[str] = None
    studyType: Optional[str] = None
    subscription: Optional[str] = None
    photoUrl: Optional[str] = None


class ProfileOut(BaseModel):
    firstName:    Optional[str] = None
    lastName:     Optional[str] = None
    dob:          Optional[str] = None
    grade:        str = '11 класс'
    studyType:    str = 'school'
    subscription: str = 'none'
    invitedCount: int = 0
    photoUrl:     Optional[str] = None


def _to_out(user: User) -> ProfileOut:
    return ProfileOut(
        firstName=user.first_name,
        lastName=user.last_name,
        dob=user.dob,
        grade=user.grade or '11 класс',
        studyType=user.study_type or 'school',
        subscription=user.subscription or 'none',
        invitedCount=user.invited_count or 0,
        photoUrl=user.photo_url,
    )


@router.get("/", response_model=ProfileOut)
def get_profile(user: User = Depends(get_current_user)):
    return _to_out(user)


@router.put("/", response_model=ProfileOut)
def update_profile(
    data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.firstName   is not None: user.first_name   = data.firstName
    if data.lastName    is not None: user.last_name    = data.lastName
    if data.dob         is not None: user.dob          = data.dob
    if data.grade       is not None: user.grade        = data.grade
    if data.studyType in {'school', 'student'}:
        user.study_type = data.studyType
    if data.photoUrl    is not None: user.photo_url    = data.photoUrl
    if data.subscription is not None:
        allowed = {'none', 'light', 'pro'}
        if data.subscription in allowed:
            user.subscription = data.subscription
    db.commit()
    db.refresh(user)
    return _to_out(user)
