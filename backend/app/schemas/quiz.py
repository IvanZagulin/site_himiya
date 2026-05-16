from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


class QuestionIn(BaseModel):
    text: str
    options: List[str]
    correct: int
    order: int = 0


class QuestionOut(BaseModel):
    id: int
    text: str
    options: List[str]
    correct: int
    order: int
    class Config: from_attributes = True


class QuizCreate(BaseModel):
    title: str
    course: str
    lesson_idx: Optional[int] = None


class QuizOut(BaseModel):
    id: int
    title: str
    course: str
    lesson_idx: Optional[int]
    is_active: bool
    created_at: datetime
    questions: List[QuestionOut] = []
    class Config: from_attributes = True


class QuizAttemptIn(BaseModel):
    quiz_id: int
    answers: Dict[int, int]   # question_id -> selected_idx


class QuizAttemptOut(BaseModel):
    id: int
    quiz_id: int
    score: int
    total: int
    created_at: datetime
    class Config: from_attributes = True


class DocOut(BaseModel):
    id: int
    title: str
    filename: str
    course: str
    lesson_idx: Optional[int]
    is_active: bool
    created_at: datetime
    size_bytes: Optional[int]
    class Config: from_attributes = True
