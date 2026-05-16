from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 24

    ADMIN_EMAIL: str = ""
    ADMIN_PASSWORD: str = ""

    SMTP_HOST: str = "smtp.spaceweb.ru"
    SMTP_PORT: int = 465
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    SMTP_FROM: str = ""
    APP_URL: str = "https://xn----7sbihsakfp2g2ef.xn--p1ai"

    MEDIA_DIR: str = "/media/videos"
    MAX_VIDEO_SIZE_MB: int = 500

    CORS_ORIGINS: str = "*"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
