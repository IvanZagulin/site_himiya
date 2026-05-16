from sqlalchemy import Column, Integer, String
from app.database import Base

class Topic(Base):
    __tablename__ = "topics"
    id        = Column(Integer, primary_key=True, index=True)
    course    = Column(String(10), nullable=False, index=True)
    lesson_idx= Column(Integer, nullable=False)
    title     = Column(String(255), nullable=False)
    order_num = Column(Integer, default=0, nullable=False)