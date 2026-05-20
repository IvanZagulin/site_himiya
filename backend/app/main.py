import logging
import mimetypes
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, SessionLocal
from app.models.user import User
from app.models.video import Video
from app.models.topic import Topic
from app.models.quiz import Quiz, Question, QuizAttempt, LessonDoc
from app.models.schedule import ScheduleEvent
from app.database import Base
from app.api import auth, admin, videos_public
from app.api import quiz as quiz_api
from app.api import docs_public
from app.api import topics_public
from app.api import schedule_public
from app.api.profile import router as profile_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)
mimetypes.add_type("application/vnd.apple.mpegurl", ".m3u8")
mimetypes.add_type("video/mp2t", ".ts")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def _create_tables():
    Base.metadata.create_all(bind=engine)


def _ensure_user_profile_columns():
    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS dob VARCHAR(20)",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS grade VARCHAR(50) DEFAULT '11 класс'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS study_type VARCHAR(20) DEFAULT 'school'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription VARCHAR(20) DEFAULT 'none'",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT",
    ]
    if engine.dialect.name == "postgresql":
        with engine.begin() as conn:
            for statement in statements:
                conn.execute(text(statement))
        return

    columns = {c["name"] for c in inspect(engine).get_columns("users")}
    with engine.begin() as conn:
        for statement in statements:
            name = statement.split(" IF NOT EXISTS ")[1].split()[0]
            if name not in columns:
                conn.execute(text(statement.replace(" IF NOT EXISTS", "")))


def _ensure_admin():
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        return
    db: Session = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                password_hash=pwd_context.hash(settings.ADMIN_PASSWORD),
                is_admin=True,
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            db.commit()
            logger.info(f"Создан admin: {settings.ADMIN_EMAIL}")
        elif not admin_user.is_admin:
            admin_user.is_admin = True
            db.commit()
    finally:
        db.close()




def _ensure_topics():
    db = SessionLocal()
    defaults = {
        "oge": [
            (1, "Строение атома"),
        ],
        "ege": [
            (1, "Строение атома и электронные конфигурации"),
        ],
        "ses": [
            (1, "Растворы. Способы выражения концентрации"),
        ],
    }
    try:
        for course, items in defaults.items():
            if not db.query(Topic).filter(Topic.course == course).first():
                for pos, (idx, title) in enumerate(items):
                    db.add(Topic(course=course, lesson_idx=idx, title=title, order_num=pos))
        db.commit()
    finally:
        db.close()
@asynccontextmanager
async def lifespan(app: FastAPI):
    _create_tables()
    _ensure_user_profile_columns()
    _ensure_admin()
    _ensure_topics()
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    yield


app = FastAPI(title="Лёгкая химия API", lifespan=lifespan)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(videos_public.router, prefix="/api", tags=["videos"])
app.include_router(quiz_api.router, prefix="/api", tags=["quiz"])
app.include_router(topics_public.router, prefix="/api", tags=["topics"])
app.include_router(schedule_public.router, prefix="/api", tags=["schedule"])
app.include_router(docs_public.router, prefix="/api", tags=["docs"])
app.include_router(profile_router, prefix="/api/profile", tags=["profile"])

# Serve uploaded files as static files
app.mount("/media", StaticFiles(directory="/media"), name="media")


@app.get("/api/health")
def health():
    return {"status": "ok"}
