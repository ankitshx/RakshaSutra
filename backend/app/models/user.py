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
    subscription_tier = Column(String(30), default="free", nullable=False)
    daily_quota = Column(Integer, default=6, nullable=False)       # 6 free uses per day
    scans_today = Column(Integer, default=0, nullable=False)       # Daily scan counter
    last_scan_date = Column(String(20), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"), nullable=True)
    monthly_quota = Column(Integer, default=180, nullable=False)   # Monthly reference quota
    scans_used = Column(Integer, default=0, nullable=False)        # Total lifetime uses count
    is_active = Column(Boolean, default=True)
    api_key = Column(String(64), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scans = relationship("Scan", back_populates="owner", cascade="all, delete-orphan")
