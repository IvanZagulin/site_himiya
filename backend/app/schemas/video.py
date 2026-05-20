from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VideoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    filename: str
    course: str
    faculty: Optional[str] = None
    lesson_idx: Optional[int]
    is_active: bool
    thumbnail: Optional[str] = None
    created_at: datetime
    size_bytes: Optional[int]

    class Config:
        from_attributes = True


class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course: Optional[str] = None
    faculty: Optional[str] = None
    lesson_idx: Optional[int] = None
    is_active: Optional[bool] = None
