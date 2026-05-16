from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"
    id          = Column(Integer, primary_key=True)
    title       = Column(String(255), nullable=False)
    course      = Column(String(50), nullable=False)
    lesson_idx  = Column(Integer, nullable=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, server_default=func.now())
    questions   = relationship("Question", back_populates="quiz",
                               cascade="all, delete-orphan", order_by="Question.order")


class Question(Base):
    __tablename__ = "questions"
    id       = Column(Integer, primary_key=True)
    quiz_id  = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    text     = Column(Text, nullable=False)
    options  = Column(JSON, nullable=False)   # ["A", "B", "C", "D"]
    correct  = Column(Integer, nullable=False) # 0-based index
    order    = Column(Integer, default=0)
    quiz     = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id         = Column(Integer, primary_key=True)
    quiz_id    = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    score      = Column(Integer, nullable=False)
    total      = Column(Integer, nullable=False)
    answers    = Column(JSON, nullable=False)  # {question_id: selected_idx}
    created_at = Column(DateTime, server_default=func.now())


class LessonDoc(Base):
    __tablename__ = "lesson_docs"
    id          = Column(Integer, primary_key=True)
    title       = Column(String(255), nullable=False)
    filename    = Column(String(500), nullable=False, unique=True)
    course      = Column(String(50), nullable=False, default="main")
    lesson_idx  = Column(Integer, nullable=True)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, server_default=func.now())
    size_bytes  = Column(Integer, nullable=True)
