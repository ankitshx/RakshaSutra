"""
RakshaSutra User Model
Implements RBAC roles (USER, BUSINESS_ADMIN, ENTERPRISE_ADMIN, SUPER_ADMIN),
daily scan and OSINT quotas, and relationships to subscriptions and API keys.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    
    # RBAC Role: "user", "business_admin", "enterprise_admin", "super_admin", "admin"
    role = Column(String(30), default="user", nullable=False, index=True)
    
    # Subscription Tier: "free", "pro", "business", "enterprise"
    subscription_tier = Column(String(30), default="free", nullable=False, index=True)
    
    # Daily Scan Quotas
    daily_quota = Column(Integer, default=6, nullable=False)       # 6 free scans / day for free tier
    scans_today = Column(Integer, default=0, nullable=False)
    last_scan_date = Column(String(20), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"), nullable=True)
    
    # Daily OSINT Quotas
    osint_quota = Column(Integer, default=1, nullable=False)       # 1 free OSINT / day for free tier
    osint_today = Column(Integer, default=0, nullable=False)
    last_osint_date = Column(String(20), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"), nullable=True)
    
    # Reference metrics
    monthly_quota = Column(Integer, default=180, nullable=False)
    scans_used = Column(Integer, default=0, nullable=False)
    
    is_active = Column(Boolean, default=True)
    api_key = Column(String(64), unique=True, index=True, nullable=True)  # Legacy API key / demo
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scans = relationship("Scan", back_populates="owner", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="user", cascade="all, delete-orphan")
