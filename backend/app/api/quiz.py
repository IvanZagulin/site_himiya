from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.quiz import Quiz, Question, QuizAttempt, LessonView
from app.schemas.quiz import QuizOut, QuizAttemptIn, QuizAttemptOut
from app.api.auth import get_current_user
from app.models.user import User

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
def submit_quiz(
    data: QuizAttemptIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    quiz = db.query(Quiz).filter(Quiz.id == data.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Квиз не найден")

    score = 0
    for q in quiz.questions:
        if data.answers.get(q.id) == q.correct:
            score += 1

    attempt = QuizAttempt(
        quiz_id=data.quiz_id,
        user_id=user.id,
        score=score,
        total=len(quiz.questions),
        answers={str(k): v for k, v in data.answers.items()},
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.post("/lesson-view")
def mark_lesson_view(
    payload: dict,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    course = str(payload.get("course") or "").strip()
    lesson_idx = int(payload.get("lesson_idx") or 0)
    if not course or lesson_idx <= 0:
        raise HTTPException(status_code=400, detail="Invalid lesson")

    exists = (
        db.query(LessonView)
        .filter(
            LessonView.user_id == user.id,
            LessonView.course == course,
            LessonView.lesson_idx == lesson_idx,
        )
        .first()
    )
    if not exists:
        db.add(LessonView(user_id=user.id, course=course, lesson_idx=lesson_idx))
        db.commit()
    return {"message": "ok"}


@router.get("/my-progress")
def my_progress(
    course: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    viewed_lessons_q = db.query(func.count(func.distinct(LessonView.lesson_idx))).filter(
        LessonView.user_id == user.id
    )
    if course:
        viewed_lessons_q = viewed_lessons_q.filter(LessonView.course == course)
    viewed_lessons = viewed_lessons_q.scalar() or 0

    attempts_q = (
        db.query(QuizAttempt)
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .filter(QuizAttempt.user_id == user.id)
    )
    if course:
        attempts_q = attempts_q.filter(Quiz.course == course)
    attempts = attempts_q.order_by(QuizAttempt.created_at.desc()).all()

    completed_tests = len(attempts)
    avg_pct = 0
    best_pct = 0
    if attempts:
        percentages = [
            round((attempt.score * 100.0 / attempt.total), 1)
            for attempt in attempts
            if attempt.total
        ]
        if percentages:
            avg_pct = round(sum(percentages) / len(percentages), 1)
            best_pct = round(max(percentages), 1)

    return {
        "course": course,
        "viewed_lessons": viewed_lessons,
        "completed_homework": 0,
        "completed_tests": completed_tests,
        "avg_test_pct": avg_pct,
        "best_test_pct": best_pct,
        "recent_tests": [
            {
                "id": attempt.id,
                "quiz_id": attempt.quiz_id,
                "score": attempt.score,
                "total": attempt.total,
                "pct": round((attempt.score * 100.0 / attempt.total), 1) if attempt.total else 0,
                "created_at": attempt.created_at.isoformat() if attempt.created_at else None,
            }
            for attempt in attempts[:8]
        ],
    }
