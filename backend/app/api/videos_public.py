from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.video import Video
from app.schemas.video import VideoResponse

router = APIRouter()


@router.get("/videos", response_model=List[VideoResponse])
def get_videos(course: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Video).filter(Video.is_active == True)
    if course:
        q = q.filter(Video.course == course)
    return q.order_by(Video.lesson_idx.asc(), Video.created_at.asc()).all()
