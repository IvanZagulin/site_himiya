from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.topic import Topic

router = APIRouter()

@router.get("/topics")
def get_topics(course: str = "oge", db: Session = Depends(get_db)):
    topics = (db.query(Topic)
               .filter(Topic.course == course)
               .order_by(Topic.order_num, Topic.id)
               .all())
    return [{"id": t.id, "lesson_idx": t.lesson_idx, "title": t.title}
            for t in topics]