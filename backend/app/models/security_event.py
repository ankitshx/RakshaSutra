import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from app.core.database import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String(50), nullable=False, index=True)  # "SSRF_ATTEMPT", "RATE_LIMIT", "SUSPICIOUS_SCAN", "AUTH_FAILURE"
    severity = Column(String(20), nullable=False, default="INFO")  # "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"
    source_ip = Column(String(45), nullable=True, index=True)
    request_path = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True)
    request_id = Column(String(32), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AwarenessArticle(Base):
    __tablename__ = "awareness_articles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # "Phishing", "UPI Fraud", "Passwords", "MFA", "Social Engineering"
    difficulty = Column(String(20), default="Beginner")
    read_time_minutes = Column(Integer, default=5)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    key_takeaways = Column(JSON, nullable=True)
    quiz_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
