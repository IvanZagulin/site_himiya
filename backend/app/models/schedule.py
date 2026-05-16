from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class ScheduleEvent(Base):
    __tablename__ = "schedule_events"

    id = Column(Integer, primary_key=True, index=True)
    course = Column(String(50), nullable=False, index=True)
    lesson_idx = Column(Integer, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    weekday = Column(Integer, nullable=False)  # 0 = Monday
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
