import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    scan_type = Column(String(30), nullable=False, index=True)  # "url", "message", "website"
    target = Column(Text, nullable=False)
    target_display = Column(String(255), nullable=True)
    target_hash = Column(String(64), index=True, nullable=True)
    
    # Risk Assessment
    risk_score = Column(Integer, nullable=False, default=0)
    risk_level = Column(String(20), nullable=False, default="LOW")  # LOW, MODERATE, SUSPICIOUS, HIGH
    summary = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    
    # Technical & Detailed metadata
    execution_time_ms = Column(Float, default=0.0)
    indicators_count = Column(Integer, default=0)
    
    # Full JSON payloads
    raw_results = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    owner = relationship("User", back_populates="scans")
    indicators = relationship("ThreatIndicator", back_populates="scan", cascade="all, delete-orphan")

class ThreatIndicator(Base):
    __tablename__ = "threat_indicators"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = Column(String(50), nullable=False)  # "Typosquatting", "URL Structure", "Urgency Bait", etc.
    severity = Column(String(20), nullable=False)  # "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"
    title = Column(String(255), nullable=False)
    evidence = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    score_impact = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="indicators")
