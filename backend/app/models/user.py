import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="user", nullable=False)  # "user", "analyst", "admin"
    subscription_tier = Column(String(30), default="free", nullable=False)  # "free", "pro", "enterprise"
    monthly_quota = Column(Integer, default=50, nullable=False)
    scans_used = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    api_key = Column(String(64), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scans = relationship("Scan", back_populates="owner", cascade="all, delete-orphan")
