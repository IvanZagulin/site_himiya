from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.quiz import LessonDoc
from app.schemas.quiz import DocOut

router = APIRouter()


@router.get("/docs", response_model=List[DocOut])
def get_docs(
    course: Optional[str] = None,
    lesson_idx: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(LessonDoc).filter(LessonDoc.is_active == True)
    if course:
        q = q.filter(LessonDoc.course == course)
    if lesson_idx is not None:
        q = q.filter(LessonDoc.lesson_idx == lesson_idx)
    return q.order_by(LessonDoc.created_at.asc()).all()
