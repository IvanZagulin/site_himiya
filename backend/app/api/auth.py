import secrets
import string
import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, BackgroundTasks, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest, VerifyEmailRequest, ResendCodeRequest,
    LoginRequest, ForgotPasswordRequest, ResetPasswordRequest,
    TokenResponse, MessageResponse, UserMeResponse,
)
from app.services.email_service import send_verification_code, send_reset_code

router = APIRouter()
security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
logger = logging.getLogger(__name__)

_COOKIE = "access_token"
_MAX_AGE = settings.JWT_EXPIRE_HOURS * 3600
MAX_ATTEMPTS = 5


def _hash(plain: str) -> str:
    return pwd_context.hash(plain)


def _verify(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _code() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(6))


def _make_token(user: User) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": user.email, "user_id": user.id, "is_admin": user.is_admin,
         "token_version": user.token_version or 1, "exp": exp},
        settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM,
    )


def _set_cookie(response: Response, token: str):
    response.set_cookie(_COOKIE, token, max_age=_MAX_AGE, httponly=True, secure=True, samesite="lax", path="/")


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials if credentials else None
    if not token:
        token = request.cookies.get(_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Не авторизован")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: int = payload.get("user_id")
        token_version: int = payload.get("token_version", 1)
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    if (user.token_version or 1) != token_version:
        raise HTTPException(status_code=401, detail="Сессия устарела")
    return user


def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Нет доступа")
    return user


@router.post("/register", response_model=MessageResponse)
def register(data: RegisterRequest, bg: BackgroundTasks, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
    code = _code()
    exp = datetime.now(timezone.utc) + timedelta(minutes=15)
    user = User(
        email=data.email,
        password_hash=_hash(data.password),
        verification_code=code,
        verification_code_expires_at=exp,
    )
    db.add(user)
    db.commit()
    bg.add_task(send_verification_code, data.email, code)
    return {"message": "Код подтверждения отправлен на email"}


@router.post("/verify", response_model=TokenResponse)
def verify(data: VerifyEmailRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.is_verified:
        raise HTTPException(status_code=400, detail="Неверный запрос")
    if user.verification_attempts >= MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Превышено число попыток")
    if not user.verification_code or user.verification_code != data.code:
        user.verification_attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Неверный код")
    if datetime.now(timezone.utc) > user.verification_code_expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="Код истёк")
    user.is_verified = True
    user.verification_code = None
    user.verification_code_expires_at = None
    user.verification_attempts = 0
    db.commit()
    db.refresh(user)
    token = _make_token(user)
    _set_cookie(response, token)
    return TokenResponse(access_token=token, expires_in=_MAX_AGE)


@router.post("/resend-code", response_model=MessageResponse)
def resend_code(data: ResendCodeRequest, bg: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.is_verified:
        raise HTTPException(status_code=400, detail="Неверный запрос")
    code = _code()
    user.verification_code = code
    user.verification_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    user.verification_attempts = 0
    db.commit()
    bg.add_task(send_verification_code, data.email, code)
    return {"message": "Новый код отправлен"}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not _verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Аккаунт заблокирован")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email не подтверждён")
    token = _make_token(user)
    _set_cookie(response, token)
    return TokenResponse(access_token=token, expires_in=_MAX_AGE)


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(_COOKIE, path="/")
    return {"message": "Выход выполнен"}


@router.get("/me", response_model=UserMeResponse)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest, bg: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user and user.is_verified:
        code = _code()
        user.reset_code = code
        user.reset_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        user.reset_attempts = 0
        db.commit()
        bg.add_task(send_reset_code, data.email, code)
    return {"message": "Если email зарегистрирован — код отправлен"}


@router.post("/reset-password", response_model=TokenResponse)
def reset_password(data: ResetPasswordRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Неверный запрос")
    if user.reset_attempts >= MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Превышено число попыток")
    if not user.reset_code or user.reset_code != data.code:
        user.reset_attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Неверный код")
    if datetime.now(timezone.utc) > user.reset_code_expires_at.replace(tzinfo=timezone.utc):
        raise HTTPException(status_code=400, detail="Код истёк")
    user.password_hash = _hash(data.new_password)
    user.reset_code = None
    user.reset_code_expires_at = None
    user.reset_attempts = 0
    user.token_version = (user.token_version or 1) + 1
    db.commit()
    db.refresh(user)
    token = _make_token(user)
    _set_cookie(response, token)
    return TokenResponse(access_token=token, expires_in=_MAX_AGE)
