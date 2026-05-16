from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.quiz import Quiz, Question, QuizAttempt
from app.schemas.quiz import QuizOut, QuizAttemptIn, QuizAttemptOut

router = APIRouter()


@router.get("/quizzes", response_model=List[QuizOut])
def get_quizzes(
    course: Optional[str] = None,
    lesson_idx: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Quiz).filter(Quiz.is_active == True)
    if course:
        q = q.filter(Quiz.course == course)
    if lesson_idx is not None:
        q = q.filter(Quiz.lesson_idx == lesson_idx)
    return q.all()


@router.post("/quiz-results", response_model=QuizAttemptOut)
def submit_quiz(data: QuizAttemptIn, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == data.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Квиз не найден")

    score = 0
    for q in quiz.questions:
        if data.answers.get(q.id) == q.correct:
            score += 1

    attempt = QuizAttempt(
        quiz_id=data.quiz_id,
        score=score,
        total=len(quiz.questions),
        answers={str(k): v for k, v in data.answers.items()},
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt
