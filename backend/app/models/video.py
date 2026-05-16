from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class Video(Base):
    __tablename__ = "videos"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    filename    = Column(String(500), nullable=False, unique=True)
    course      = Column(String(50), nullable=False, default="main")  # main, oge, ege, ses
    lesson_idx  = Column(Integer, nullable=True)
    is_active   = Column(Boolean, default=True, nullable=False)
    created_at  = Column(DateTime, server_default=func.now(), nullable=False)
    size_bytes  = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<Video {self.id}: {self.title}>"
