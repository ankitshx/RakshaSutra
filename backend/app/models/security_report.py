"""
RakhshaSutra v3.0 — Security Reports & Notification Models
Structured executive reports, forensic dossier generation, and in-app notification center.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

def generate_report_id() -> str:
    year = datetime.now(timezone.utc).year
    random_hex = uuid.uuid4().hex[:6].upper()
    return f"RS-REP-{year}-{random_hex}"

class SecurityReport(Base):
    """
    Generated Security Report (Executive, Assessment, Phishing, ASM, Vulnerability, Incident).
    """
    __tablename__ = "security_reports"

    id = Column(String(64), primary_key=True, default=generate_report_id, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    created_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(256), nullable=False)
    report_type = Column(String(64), nullable=False)
    # "EXECUTIVE_SUMMARY", "SECURITY_ASSESSMENT", "PHISHING_DOSSIER", "ATTACK_SURFACE", "VULNERABILITY_AUDIT", "INCIDENT_POSTMORTEM"

    summary = Column(Text, nullable=False)
    target_scope = Column(String(256), nullable=True)
    overall_posture_score = Column(Integer, default=85)

    findings_summary = Column(JSON, default=dict) # {"critical": 0, "high": 2, "medium": 5, "low": 10}
    content_markdown = Column(Text, nullable=False)
    metadata_json = Column(JSON, default=dict)

    created_at = Column(DateTime, default=utc_now, nullable=False)

class Notification(Base):
    """
    In-app security notification.
    """
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(16), default="INFO", nullable=False) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    category = Column(String(64), default="SYSTEM", nullable=False) # "ALERT", "INCIDENT", "SCAN", "MONITORING", "BILLING", "SYSTEM"

    action_url = Column(String(256), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
