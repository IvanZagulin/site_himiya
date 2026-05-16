import os
import shutil
import subprocess
import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.video import Video
from app.models.schedule import ScheduleEvent
from app.models.quiz import Quiz, Question, QuizAttempt, LessonDoc
from app.schemas.video import VideoResponse, VideoUpdate
from app.schemas.quiz import QuizCreate, QuizOut, QuestionIn, QuestionOut, DocOut
from app.api.auth import get_admin_user
from app.api.schedule_public import schedule_event_out

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_VIDEO = {"video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"}
FASTSTART_EXTS = {".mp4", ".m4v", ".mov"}
VIDEO_QUALITIES = (
    ("720p", 720, "2800k", "5600k", "24"),
    ("480p", 480, "1200k", "2400k", "26"),
)
ALLOWED_DOC   = {"application/pdf"}
MAX_VIDEO     = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
MAX_DOC       = 100 * 1024 * 1024  # 100 MB for PDFs

DOCS_DIR = "/media/docs"
TOPIC_COURSES = {"oge", "ege", "ses", "main"}
WEEKDAYS = set(range(7))


def _optimize_video_for_streaming(path: str) -> int:
    """Move MP4 metadata to the front so browser seeking stays responsive."""
    ext = os.path.splitext(path)[1].lower()
    if ext not in FASTSTART_EXTS:
        return os.path.getsize(path)

    tmp_path = path + ".faststart"
    try:
        result = subprocess.run(
            [
                "ffmpeg", "-y", "-i", path,
                "-map", "0",
                "-c", "copy",
                "-movflags", "+faststart",
                "-f", "mp4",
                tmp_path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=3600,
            check=False,
        )
        if result.returncode != 0:
            logger.warning("ffmpeg faststart failed for %s: %s", path, result.stderr[-2000:])
            return os.path.getsize(path)

        if os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 0:
            os.replace(tmp_path, path)
    except FileNotFoundError:
        logger.warning("ffmpeg is not installed; uploaded video was saved without faststart optimization")
    except Exception:
        logger.exception("Could not optimize uploaded video for streaming: %s", path)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return os.path.getsize(path)


def _quality_path(path: str, quality: str) -> str:
    root, _ = os.path.splitext(path)
    return f"{root}_{quality}.mp4"


def _hls_dir(path: str) -> str:
    root, _ = os.path.splitext(path)
    return f"{root}_hls"


def _generate_video_qualities(path: str) -> None:
    ext = os.path.splitext(path)[1].lower()
    if ext not in FASTSTART_EXTS:
        return

    for quality, height, maxrate, bufsize, crf in VIDEO_QUALITIES:
        out_path = _quality_path(path, quality)
        tmp_path = out_path + ".tmp"
        try:
            result = subprocess.run(
                [
                    "ffmpeg", "-y", "-i", path,
                    "-map", "0:v:0",
                    "-map", "0:a?",
                    "-vf", f"scale=-2:{height}",
                    "-c:v", "libx264",
                    "-preset", "veryfast",
                    "-crf", crf,
                    "-maxrate", maxrate,
                    "-bufsize", bufsize,
                    "-c:a", "aac",
                    "-b:a", "128k",
                    "-movflags", "+faststart",
                    "-f", "mp4",
                    tmp_path,
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=3600,
                check=False,
            )
            if result.returncode != 0:
                logger.warning("ffmpeg %s variant failed for %s: %s", quality, path, result.stderr[-2000:])
                continue
            if os.path.exists(tmp_path) and os.path.getsize(tmp_path) > 0:
                os.replace(tmp_path, out_path)
        except FileNotFoundError:
            logger.warning("ffmpeg is not installed; video quality variants were not generated")
            return
        except Exception:
            logger.exception("Could not generate %s variant for %s", quality, path)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


def _generate_hls(path: str) -> None:
    ext = os.path.splitext(path)[1].lower()
    if ext not in FASTSTART_EXTS:
        return

    hls_dir = _hls_dir(path)
    os.makedirs(hls_dir, exist_ok=True)
    variants = []

    for quality, height, maxrate, bufsize, crf in VIDEO_QUALITIES:
        playlist = os.path.join(hls_dir, f"{quality}.m3u8")
        segment_pattern = os.path.join(hls_dir, f"{quality}_%03d.ts")
        try:
            result = subprocess.run(
                [
                    "ffmpeg", "-y", "-i", path,
                    "-map", "0:v:0",
                    "-map", "0:a?",
                    "-vf", f"scale=-2:{height}",
                    "-c:v", "libx264",
                    "-preset", "veryfast",
                    "-crf", crf,
                    "-maxrate", maxrate,
                    "-bufsize", bufsize,
                    "-c:a", "aac",
                    "-b:a", "128k",
                    "-hls_time", "4",
                    "-hls_playlist_type", "vod",
                    "-hls_segment_filename", segment_pattern,
                    playlist,
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=3600,
                check=False,
            )
            if result.returncode != 0:
                logger.warning("ffmpeg %s HLS failed for %s: %s", quality, path, result.stderr[-2000:])
                continue
            if os.path.exists(playlist):
                variants.append((quality, height, maxrate))
        except FileNotFoundError:
            logger.warning("ffmpeg is not installed; HLS variants were not generated")
            return
        except Exception:
            logger.exception("Could not generate %s HLS for %s", quality, path)

    if variants:
        master = os.path.join(hls_dir, "master.m3u8")
        with open(master, "w", encoding="utf-8") as f:
            f.write("#EXTM3U\n#EXT-X-VERSION:3\n")
            for quality, height, maxrate in variants:
                bandwidth = int(maxrate.rstrip("k")) * 1000
                f.write(f"#EXT-X-STREAM-INF:BANDWIDTH={bandwidth},RESOLUTION={height * 16 // 9}x{height}\n")
                f.write(f"{quality}.m3u8\n")


def _prepare_uploaded_video(path: str) -> None:
    _optimize_video_for_streaming(path)
    _generate_video_qualities(path)
    _generate_hls(path)


# ─── Videos ────────────────────────────────────────────────────────────────

@router.get("/videos", response_model=List[VideoResponse])
def list_videos(
    course: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    q = db.query(Video)
    if course:
        q = q.filter(Video.course == course)
    return q.order_by(Video.created_at.desc()).all()


@router.post("/videos", response_model=VideoResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    course: str = Form("main"),
    description: str = Form(""),
    lesson_idx: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if file.content_type not in ALLOWED_VIDEO:
        raise HTTPException(400, f"Неподдерживаемый тип: {file.content_type}")
    content = await file.read()
    if len(content) > MAX_VIDEO:
        raise HTTPException(413, f"Файл слишком большой. Максимум {settings.MAX_VIDEO_SIZE_MB} МБ")
    ext = os.path.splitext(file.filename or "video.mp4")[1] or ".mp4"
    filename = uuid.uuid4().hex + ext
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    path = os.path.join(settings.MEDIA_DIR, filename)
    with open(path, "wb") as f:
        f.write(content)
    size_bytes = os.path.getsize(path)
    video = Video(title=title, description=description or None,
                  filename=filename, course=course,
                  lesson_idx=lesson_idx, size_bytes=size_bytes)
    db.add(video); db.commit(); db.refresh(video)
    background_tasks.add_task(_prepare_uploaded_video, path)
    return video


@router.patch("/videos/{video_id}", response_model=VideoResponse)
def update_video(video_id: int, data: VideoUpdate,
                 db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video: raise HTTPException(404, "Видео не найдено")
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(video, field, val)
    db.commit(); db.refresh(video)
    return video


@router.delete("/videos/{video_id}")
def delete_video(video_id: int,
                 db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video: raise HTTPException(404, "Видео не найдено")
    path = os.path.join(settings.MEDIA_DIR, video.filename)
    if os.path.exists(path): os.remove(path)
    for quality, *_ in VIDEO_QUALITIES:
        variant = _quality_path(path, quality)
        if os.path.exists(variant): os.remove(variant)
    hls_dir = _hls_dir(path)
    if os.path.exists(hls_dir): shutil.rmtree(hls_dir)
    db.delete(video); db.commit()
    return {"message": "Удалено"}




ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/videos/{video_id}/thumbnail")
async def upload_thumbnail(
    video_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if file.content_type not in ALLOWED_IMAGE:
        raise HTTPException(400, "Только изображения (jpeg, png, webp, gif)")
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(413, "Файл слишком большой. Максимум 10 МБ")
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(404, "Видео не найдено")
    ext = os.path.splitext(file.filename or "thumb.jpg")[1].lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
        ext = ".jpg"
    filename = "thumb_" + uuid.uuid4().hex + ext
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    with open(os.path.join(settings.MEDIA_DIR, filename), "wb") as f:
        f.write(content)
    # Remove old thumbnail if exists
    if video.thumbnail:
        old_path = os.path.join(settings.MEDIA_DIR, video.thumbnail)
        if os.path.exists(old_path):
            os.remove(old_path)
    video.thumbnail = filename
    db.commit()
    return {"thumbnail": filename}


# ─── Documents ─────────────────────────────────────────────────────────────

@router.get("/docs", response_model=List[DocOut])
def list_docs(course: Optional[str] = None,
              db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    q = db.query(LessonDoc)
    if course: q = q.filter(LessonDoc.course == course)
    return q.order_by(LessonDoc.created_at.desc()).all()


@router.post("/docs", response_model=DocOut)
async def upload_doc(
    title: str = Form(...),
    course: str = Form("main"),
    lesson_idx: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if file.content_type not in ALLOWED_DOC:
        raise HTTPException(400, "Только PDF файлы")
    content = await file.read()
    if len(content) > MAX_DOC:
        raise HTTPException(413, "Файл слишком большой. Максимум 100 МБ")
    filename = uuid.uuid4().hex + ".pdf"
    os.makedirs(DOCS_DIR, exist_ok=True)
    with open(os.path.join(DOCS_DIR, filename), "wb") as f:
        f.write(content)
    doc = LessonDoc(title=title, filename=filename, course=course,
                    lesson_idx=lesson_idx, size_bytes=len(content))
    db.add(doc); db.commit(); db.refresh(doc)
    return doc


@router.delete("/docs/{doc_id}")
def delete_doc(doc_id: int,
               db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    doc = db.query(LessonDoc).filter(LessonDoc.id == doc_id).first()
    if not doc: raise HTTPException(404, "Документ не найден")
    path = os.path.join(DOCS_DIR, doc.filename)
    if os.path.exists(path): os.remove(path)
    db.delete(doc); db.commit()
    return {"message": "Удалено"}


# ─── Quizzes ───────────────────────────────────────────────────────────────

@router.get("/quizzes", response_model=List[QuizOut])
def list_quizzes(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(Quiz).order_by(Quiz.created_at.desc()).all()


@router.post("/quizzes", response_model=QuizOut)
def create_quiz(data: QuizCreate,
                db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    quiz = Quiz(**data.model_dump())
    db.add(quiz); db.commit(); db.refresh(quiz)
    return quiz


@router.delete("/quizzes/{quiz_id}")
def delete_quiz(quiz_id: int,
                db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz: raise HTTPException(404, "Квиз не найден")
    db.delete(quiz); db.commit()
    return {"message": "Удалено"}


@router.post("/quizzes/{quiz_id}/questions", response_model=QuestionOut)
def add_question(quiz_id: int, data: QuestionIn,
                 db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz: raise HTTPException(404, "Квиз не найден")
    q = Question(quiz_id=quiz_id, **data.model_dump())
    db.add(q); db.commit(); db.refresh(q)
    return q


@router.delete("/quizzes/{quiz_id}/questions/{question_id}")
def delete_question(quiz_id: int, question_id: int,
                    db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    q = db.query(Question).filter(
        Question.id == question_id, Question.quiz_id == quiz_id).first()
    if not q: raise HTTPException(404, "Вопрос не найден")
    db.delete(q); db.commit()
    return {"message": "Удалено"}


# ─── Statistics ────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    total_users    = db.query(func.count(User.id)).scalar()
    verified_users = db.query(func.count(User.id)).filter(User.is_verified == True).scalar()
    total_attempts = db.query(func.count(QuizAttempt.id)).scalar()
    total_videos   = db.query(func.count(Video.id)).scalar()
    total_docs     = db.query(func.count(LessonDoc.id)).scalar()

    quiz_stats = (
        db.query(
            Quiz.id, Quiz.title, Quiz.course, Quiz.lesson_idx,
            func.count(QuizAttempt.id).label("attempts"),
            func.avg(QuizAttempt.score * 100.0 / QuizAttempt.total).label("avg_pct"),
        )
        .outerjoin(QuizAttempt, QuizAttempt.quiz_id == Quiz.id)
        .group_by(Quiz.id)
        .all()
    )

    return {
        "total_users": total_users,
        "verified_users": verified_users,
        "total_attempts": total_attempts,
        "total_videos": total_videos,
        "total_docs": total_docs,
        "quizzes": [
            {"id": r.id, "title": r.title, "course": r.course,
             "lesson_idx": r.lesson_idx, "attempts": r.attempts,
             "avg_pct": round(r.avg_pct or 0, 1)}
            for r in quiz_stats
        ],
    }


# ─── Users ─────────────────────────────────────────────────────────────────

@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{"id": u.id, "email": u.email, "is_admin": u.is_admin,
             "is_active": u.is_active, "is_verified": u.is_verified,
             "created_at": u.created_at.isoformat()} for u in users]


@router.patch("/users/{user_id}")
def update_user(user_id: int,
                is_active: Optional[bool] = Query(None),
                is_admin: Optional[bool] = Query(None),
                db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "Пользователь не найден")
    if is_active is not None: user.is_active = is_active
    if is_admin  is not None: user.is_admin  = is_admin
    db.commit()
    return {"message": "Обновлено"}

from app.models.topic import Topic

# ─── Topics ──────────────────────────────────────────────────────────────────

@router.get("/topics")
def list_topics(
    course: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    q = db.query(Topic)
    if course:
        q = q.filter(Topic.course == course)
    return [{"id": t.id, "course": t.course, "lesson_idx": t.lesson_idx,
             "title": t.title, "order_num": t.order_num}
            for t in q.order_by(Topic.order_num, Topic.id).all()]

@router.post("/topics", status_code=201)
def create_topic(
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    from pydantic import BaseModel as BM
    course = data.get("course","oge")
    title  = data.get("title","").strip()
    if not title:
        raise HTTPException(400, "Пустое название")
    max_order = db.query(func.max(Topic.order_num)).filter(Topic.course == course).scalar() or 0
    max_idx   = db.query(func.max(Topic.lesson_idx)).filter(Topic.course == course).scalar() or 0
    t = Topic(course=course, title=title,
              lesson_idx=max_idx + 1, order_num=max_order + 1)
    db.add(t); db.commit(); db.refresh(t)
    return {"id": t.id, "course": t.course, "lesson_idx": t.lesson_idx,
            "title": t.title, "order_num": t.order_num}

@router.patch("/topics/{topic_id}")
def update_topic(
    topic_id: int,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    t = db.query(Topic).filter(Topic.id == topic_id).first()
    if not t:
        raise HTTPException(404, "Не найдено")
    updates = {}
    if "title" in data and data["title"].strip():
        updates["title"] = data["title"].strip()
    if "order_num" in data:
        updates["order_num"] = int(data["order_num"])
    if "course" in data:
        new_course = str(data["course"]).strip().lower()
        if new_course not in TOPIC_COURSES:
            raise HTTPException(400, "Неизвестный раздел")
        if new_course != t.course:
            from sqlalchemy import func as _f
            max_idx = db.query(_f.max(Topic.lesson_idx)).filter(Topic.course == new_course).scalar() or 0
            max_ord = db.query(_f.max(Topic.order_num)).filter(Topic.course == new_course).scalar() or 0
            updates.update({
                "course": new_course,
                "lesson_idx": max_idx + 1,
                "order_num": max_ord + 1,
            })
    if updates:
        db.query(Topic).filter(Topic.id == topic_id).update(updates, synchronize_session=False)
        db.commit()
    t = db.query(Topic).filter(Topic.id == topic_id).first()
    return {"id": t.id, "course": t.course, "lesson_idx": t.lesson_idx,
            "title": t.title, "order_num": t.order_num}

@router.delete("/topics/{topic_id}", status_code=204)
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    t = db.query(Topic).filter(Topic.id == topic_id).first()
    if not t:
        raise HTTPException(404, "Не найдено")
    db.delete(t); db.commit()

@router.post("/topics/reorder")
def reorder_topics(
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    # data = {"order": [id1, id2, id3, ...]}
    for pos, tid in enumerate(data.get("order", [])):
        db.query(Topic).filter(Topic.id == tid).update({"order_num": pos})
    db.commit()
    return {"ok": True}


# ─── Schedule ───────────────────────────────────────────────────────────────

def _normalize_time(value: str) -> str:
    value = str(value or "").strip()
    parts = value.split(":")
    if len(parts) != 2:
        raise HTTPException(400, "Время должно быть в формате HH:MM")
    try:
        h, m = int(parts[0]), int(parts[1])
    except ValueError:
        raise HTTPException(400, "Время должно быть в формате HH:MM")
    if not (0 <= h <= 23 and 0 <= m <= 59):
        raise HTTPException(400, "Некорректное время")
    return f"{h:02d}:{m:02d}"


@router.get("/schedule")
def list_schedule(
    course: Optional[str] = None,
    lesson_idx: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    q = db.query(ScheduleEvent)
    if course:
        q = q.filter(ScheduleEvent.course == course)
    if lesson_idx is not None:
        q = q.filter(ScheduleEvent.lesson_idx == lesson_idx)
    events = q.order_by(ScheduleEvent.weekday, ScheduleEvent.start_time, ScheduleEvent.id).all()
    return [schedule_event_out(ev) for ev in events]


@router.post("/schedule", status_code=201)
def create_schedule_event(
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    course = str(data.get("course", "oge")).strip().lower()
    if course not in TOPIC_COURSES:
        raise HTTPException(400, "Неизвестный раздел")
    lesson_idx = int(data.get("lesson_idx") or 0)
    if lesson_idx <= 0:
        raise HTTPException(400, "Укажите урок")
    try:
        weekday = int(data.get("weekday"))
    except (TypeError, ValueError):
        raise HTTPException(400, "Некорректный день недели")
    if weekday not in WEEKDAYS:
        raise HTTPException(400, "Некорректный день недели")
    start_time = _normalize_time(data.get("start_time"))
    end_time = _normalize_time(data.get("end_time"))
    if end_time <= start_time:
        raise HTTPException(400, "Конец занятия должен быть позже начала")

    topic = db.query(Topic).filter(Topic.course == course, Topic.lesson_idx == lesson_idx).first()
    default_topic = topic.title if topic else f"Урок {lesson_idx}"
    title = str(data.get("title") or f"{course.upper()} · занятие {lesson_idx}").strip()
    topic_title = str(data.get("topic") or default_topic).strip()

    ev = ScheduleEvent(
        course=course,
        lesson_idx=lesson_idx,
        title=title,
        topic=topic_title,
        weekday=weekday,
        start_time=start_time,
        end_time=end_time,
        is_active=data.get("is_active", True) is not False,
    )
    db.add(ev); db.commit(); db.refresh(ev)
    return schedule_event_out(ev)


@router.delete("/schedule/{event_id}", status_code=204)
def delete_schedule_event(
    event_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    ev = db.query(ScheduleEvent).filter(ScheduleEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Не найдено")
    db.delete(ev); db.commit()

@router.patch("/schedule/{event_id}")
def update_schedule_event(
    event_id: int,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    ev = db.query(ScheduleEvent).filter(ScheduleEvent.id == event_id).first()
    if not ev:
        raise HTTPException(404, "Не найдено")
    updates = {}
    if "weekday" in data:
        wd = int(data["weekday"])
        if wd not in WEEKDAYS:
            raise HTTPException(400, "Некорректный день недели")
        updates["weekday"] = wd
    if "start_time" in data:
        updates["start_time"] = _normalize_time(data["start_time"])
    if "end_time" in data:
        updates["end_time"] = _normalize_time(data["end_time"])
    if "title" in data and str(data["title"]).strip():
        updates["title"] = str(data["title"]).strip()
    if "topic" in data and str(data["topic"]).strip():
        updates["topic"] = str(data["topic"]).strip()
    if "is_active" in data:
        updates["is_active"] = bool(data["is_active"])
    if updates:
        st = updates.get("start_time", ev.start_time)
        et = updates.get("end_time", ev.end_time)
        if et <= st:
            raise HTTPException(400, "Конец занятия должен быть позже начала")
        db.query(ScheduleEvent).filter(ScheduleEvent.id == event_id).update(updates, synchronize_session=False)
        db.commit()
    ev = db.query(ScheduleEvent).filter(ScheduleEvent.id == event_id).first()
    return schedule_event_out(ev)

