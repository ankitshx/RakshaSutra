"""
RakhshaSutra v3.0 — SOC Alerts, Incidents & Automation Data Models
Centralized alert pipeline, full incident response workflows, and safe automation rules.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

def generate_alert_id() -> str:
    year = datetime.now(timezone.utc).year
    random_hex = uuid.uuid4().hex[:6].upper()
    return f"RS-ALT-{year}-{random_hex}"

def generate_incident_id() -> str:
    year = datetime.now(timezone.utc).year
    random_hex = uuid.uuid4().hex[:6].upper()
    return f"RS-INC-{year}-{random_hex}"

class SecurityAlert(Base):
    """
    Centralized event pipeline alert with severity, confidence, and deduplication.
    """
    __tablename__ = "security_alerts"

    id = Column(String(64), primary_key=True, default=generate_alert_id, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    asset_id = Column(String(64), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True)
    incident_id = Column(String(64), ForeignKey("security_incidents.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(256), nullable=False)
    alert_type = Column(String(64), nullable=False, index=True)
    # "CERTIFICATE_EXPIRING", "DNS_DRIFT", "MALWARE_IOC_MATCH", "PHISHING_DOMAIN_DETECTED", "VULNERABILITY_CRITICAL", "ANOMALY_TRAFFIC", "HONEYTOKEN_TRIPPED"

    severity = Column(String(16), default="MEDIUM", nullable=False, index=True) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence = Column(Integer, default=85, nullable=False) # 0 - 100
    status = Column(String(32), default="NEW", nullable=False, index=True)
    # Status: "NEW", "ACKNOWLEDGED", "INVESTIGATING", "CONTAINED", "RESOLVED", "FALSE_POSITIVE"

    source = Column(String(64), default="Continuous Monitor", nullable=False)
    description = Column(Text, nullable=False)
    evidence_data = Column(JSON, default=dict)
    recommended_action = Column(Text, nullable=True)

    dedup_key = Column(String(128), nullable=True, index=True)
    occurrence_count = Column(Integer, default=1, nullable=False)

    assigned_to_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    asset = relationship("Asset", back_populates="alerts")
    incident = relationship("SecurityIncident", back_populates="alerts")

class SecurityIncident(Base):
    """
    SOC Incident Management entity.
    """
    __tablename__ = "security_incidents"

    id = Column(String(64), primary_key=True, default=generate_incident_id, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(256), nullable=False)
    classification = Column(String(64), default="Phishing Attempt", nullable=False)
    # "Phishing Attempt", "Account Takeover", "Credential Compromise", "Data Exposure", "Ransomware Threat", "Malware C2", "Unauthorized Access"

    severity = Column(String(16), default="HIGH", nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(32), default="OPEN", nullable=False, index=True)
    # "OPEN", "INVESTIGATING", "CONTAINED", "REMEDIATED", "CLOSED"

    summary = Column(Text, nullable=False)
    affected_assets = Column(JSON, default=list) # List of asset IDs or domain names
    ioc_indicators = Column(JSON, default=list) # List of IP, Domain, Hash IOCs

    containment_checklist = Column(JSON, default=list)
    # [{"step": "Freeze affected UPI ID", "completed": True, "completed_at": "..."}]

    defensive_playbook_id = Column(String(64), nullable=True) # e.g. "financial_fraud_response"
    analyst_notes = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now, nullable=False)
    contained_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    alerts = relationship("SecurityAlert", back_populates="incident")
    timeline_events = relationship("IncidentTimelineEvent", back_populates="incident", cascade="all, delete-orphan")

class IncidentTimelineEvent(Base):
    """
    Chronological activity and evidence log for an incident.
    """
    __tablename__ = "incident_timeline_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(64), ForeignKey("security_incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    event_type = Column(String(64), nullable=False) # "INCIDENT_CREATED", "STATUS_CHANGED", "EVIDENCE_ATTACHED", "PLAYBOOK_EXECUTED", "NOTE_ADDED"
    title = Column(String(256), nullable=False)
    details = Column(Text, nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    incident = relationship("SecurityIncident", back_populates="timeline_events")

class AutomationRule(Base):
    """
    Safe security automation rule with condition triggers and execution history.
    """
    __tablename__ = "automation_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(128), nullable=False)
    description = Column(String(256), nullable=True)

    is_enabled = Column(Boolean, default=True, nullable=False)
    trigger_type = Column(String(64), nullable=False) # "ON_CRITICAL_ALERT", "ON_CERT_EXPIRY", "ON_HONEYTOKEN_TRIP"
    conditions = Column(JSON, default=dict) # {"min_severity": "HIGH", "asset_type": "domain"}
    actions = Column(JSON, default=list) # [{"action": "CREATE_INCIDENT", "severity": "HIGH"}, {"action": "SEND_WEBHOOK"}]

    last_triggered_at = Column(DateTime, nullable=True)
    execution_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
