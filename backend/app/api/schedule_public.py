from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schedule import ScheduleEvent

router = APIRouter()


def schedule_event_out(ev: ScheduleEvent):
    return {
        "id": ev.id,
        "course": ev.course,
        "lesson_idx": ev.lesson_idx,
        "title": ev.title,
        "topic": ev.topic,
        "weekday": ev.weekday,
        "start_time": ev.start_time,
        "end_time": ev.end_time,
        "is_active": ev.is_active,
    }


@router.get("/schedule")
def get_schedule(course: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(ScheduleEvent).filter(ScheduleEvent.is_active == True)
    if course:
        q = q.filter(ScheduleEvent.course == course)
    events = q.order_by(ScheduleEvent.weekday, ScheduleEvent.start_time, ScheduleEvent.id).all()
    return [schedule_event_out(ev) for ev in events]
