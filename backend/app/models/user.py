from sqlalchemy import Column, Integer, String, Boolean, DateTime, SmallInteger, Text
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active     = Column(Boolean, default=True, nullable=False)
    is_admin      = Column(Boolean, default=False, nullable=False)
    is_verified   = Column(Boolean, default=False, nullable=False)
    created_at    = Column(DateTime, server_default=func.now(), nullable=False)

    verification_code            = Column(String(6), nullable=True)
    verification_code_expires_at = Column(DateTime, nullable=True)
    verification_attempts        = Column(Integer, default=0, nullable=False)

    reset_code            = Column(String(6), nullable=True)
    reset_code_expires_at = Column(DateTime, nullable=True)
    reset_attempts        = Column(Integer, default=0, nullable=False)

    token_version = Column(SmallInteger, default=1, nullable=False)

    # Profile fields
    first_name    = Column(String(100), nullable=True)
    last_name     = Column(String(100), nullable=True)
    dob           = Column(String(20),  nullable=True)
    grade         = Column(String(50),  nullable=True, default='11 класс')
    subscription  = Column(String(20),  nullable=True, default='none')
    invited_count = Column(Integer, default=0, nullable=False)
    photo_url     = Column(Text, nullable=True)

    def __repr__(self):
        return f"<User {self.id}: {self.email}>"
