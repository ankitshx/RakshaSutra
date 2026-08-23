"""
RakshaSutra API Gateway & Usage Models
Enforces hashed API keys, per-key rate limits, and authoritative account-level quotas.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(String(36), nullable=True, index=True)
    
    name = Column(String(100), nullable=False)
    key_prefix = Column(String(16), nullable=False, index=True)  # First 8-12 chars (e.g. "rs_live_a1b2")
    key_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA-256 hash of full key
    
    status = Column(String(20), default="active", index=True)  # "active", "revoked", "expired"
    rate_limit_per_min = Column(Integer, default=10)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="api_keys")
    usage_records = relationship("APIUsage", back_populates="api_key", cascade="all, delete-orphan")

class APIUsage(Base):
    __tablename__ = "api_usage"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    api_key_id = Column(String(36), ForeignKey("api_keys.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(String(36), nullable=True, index=True)
    
    endpoint = Column(String(255), nullable=False, index=True)
    method = Column(String(10), default="POST")
    status_code = Column(Integer, nullable=False)
    processing_time_ms = Column(Float, default=0.0)
    credits_consumed = Column(Integer, default=1)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    api_key = relationship("APIKey", back_populates="usage_records")

class APIQuota(Base):
    __tablename__ = "api_quotas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    organization_id = Column(String(36), nullable=True, index=True)
    
    monthly_limit = Column(Integer, default=1000)  # Business tier default: 1,000 req/mo
    requests_this_month = Column(Integer, default=0)
    current_month = Column(String(7), default=lambda: datetime.utcnow().strftime("%Y-%m"))  # "YYYY-MM"
    
    last_request_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
