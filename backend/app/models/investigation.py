import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_investigation_id() -> str:
    """Generate professional, human-readable Investigation ID (e.g. RS-INV-2026-A89F2C)."""
    year = datetime.utcnow().year
    random_hex = uuid.uuid4().hex[:6].upper()
    return f"RS-INV-{year}-{random_hex}"

def generate_passport_id() -> str:
    """Generate privacy-safe Security Passport ID (e.g. RS-PASS-2026-C4B8)."""
    year = datetime.utcnow().year
    random_hex = uuid.uuid4().hex[:4].upper()
    return f"RS-PASS-{year}-{random_hex}"

class Investigation(Base):
    """Core Investigation entity tracking evidence-driven investigations."""
    __tablename__ = "investigations"

    id = Column(String(64), primary_key=True, default=generate_investigation_id, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    
    target = Column(String(2048), nullable=False, index=True)
    target_type = Column(String(32), default="url", nullable=False) # url, domain, ip, message, email
    normalized_target = Column(String(2048), nullable=True)
    
    risk_score = Column(Integer, default=0, nullable=False) # 0 - 100
    risk_level = Column(String(16), default="SAFE", nullable=False) # SAFE, CAUTION, DANGER
    confidence_score = Column(Integer, default=85, nullable=False) # 0 - 100
    confidence_level = Column(String(16), default="HIGH", nullable=False) # LOW, MEDIUM, HIGH
    
    verdict_summary = Column(Text, nullable=True)
    plain_explanation = Column(Text, nullable=True)
    technical_summary = Column(Text, nullable=True)
    recommendations = Column(JSON, default=list)
    
    engine_version = Column(String(32), default="1.0.0-PROD", nullable=False)
    ruleset_version = Column(String(32), default="2026.08", nullable=False)
    status = Column(String(32), default="COMPLETED", nullable=False) # RUNNING, COMPLETED, FAILED
    
    evidence_sources_checked = Column(JSON, default=list) # List of providers/engines consulted
    scoring_breakdown = Column(JSON, default=dict) # Component score breakdown
    raw_telemetry = Column(JSON, default=dict) # DNS, TLS, HTTP, Page intelligence
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    evidence_items = relationship("EvidenceItem", back_populates="investigation", cascade="all, delete-orphan")
    timeline_events = relationship("InvestigationEvent", back_populates="investigation", cascade="all, delete-orphan")
    feedback = relationship("UserFeedback", back_populates="investigation", cascade="all, delete-orphan")


class EvidenceItem(Base):
    """Individual atomic evidence item with clear provenance."""
    __tablename__ = "evidence_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(64), ForeignKey("investigations.id"), nullable=False, index=True)
    
    category = Column(String(64), nullable=False) # DNS, TLS, Domain, HTTP, Threat Intel, Page, Brand
    title = Column(String(256), nullable=False)
    severity = Column(String(16), default="LOW", nullable=False) # INFO, LOW, MEDIUM, HIGH, CRITICAL
    score_impact = Column(Integer, default=0, nullable=False) # Point contribution (+/-)
    
    provenance = Column(String(32), default="DIRECT_OBSERVATION", nullable=False)
    # DIRECT_OBSERVATION, THIRD_PARTY_INTEL, HEURISTIC, AI_EXPLANATION
    
    source_name = Column(String(64), nullable=False) # e.g. "DNS Resolver", "Google Safe Browsing", "TLS Auditor"
    rule_id = Column(String(32), nullable=True) # e.g. "RS-PHISH-001"
    evidence_text = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    raw_data = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="evidence_items")


class InvestigationEvent(Base):
    """Chronological step in the investigation timeline."""
    __tablename__ = "investigation_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(64), ForeignKey("investigations.id"), nullable=False, index=True)
    
    step_name = Column(String(64), nullable=False) # TARGET_NORMALIZED, DNS_RESOLVED, TLS_AUDITED, etc.
    description = Column(String(256), nullable=False)
    status = Column(String(16), default="SUCCESS", nullable=False) # SUCCESS, SKIPPED, FAILED, UNAVAILABLE
    duration_ms = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="timeline_events")


class MonitoredTarget(Base):
    """Target under continuous security monitoring."""
    __tablename__ = "monitored_targets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    target = Column(String(2048), nullable=False)
    target_type = Column(String(32), default="domain", nullable=False) # domain, url, ip
    check_frequency_hours = Column(Integer, default=24, nullable=False) # 6, 12, 24
    
    is_active = Column(Boolean, default=True, nullable=False)
    last_checked_at = Column(DateTime, nullable=True)
    last_risk_score = Column(Integer, default=0)
    last_verdict = Column(String(16), default="SAFE")
    
    last_state_snapshot = Column(JSON, default=dict) # DNS IPs, SSL cert hash, headers
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    alerts = relationship("MonitoringAlert", back_populates="target", cascade="all, delete-orphan")


class MonitoringAlert(Base):
    """Alert triggered by state diff on monitored target."""
    __tablename__ = "monitoring_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    target_id = Column(String(36), ForeignKey("monitored_targets.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    alert_type = Column(String(64), nullable=False) # CERT_CHANGED, DNS_IP_CHANGED, THREAT_FLAGGED, REPUTATION_DROP
    severity = Column(String(16), default="MEDIUM", nullable=False) # LOW, MEDIUM, HIGH
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    
    previous_state = Column(JSON, default=dict)
    current_state = Column(JSON, default=dict)
    diff_summary = Column(Text, nullable=True)
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    target = relationship("MonitoredTarget", back_populates="alerts")


class SecurityScoreCard(Base):
    """Personal Security Score & Security Passport."""
    __tablename__ = "security_scorecards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    passport_id = Column(String(32), default=generate_passport_id, unique=True, index=True)
    overall_score = Column(Integer, default=85, nullable=False) # 0 - 100
    
    account_security_score = Column(Integer, default=90)
    password_exposure_score = Column(Integer, default=85)
    browser_protection_score = Column(Integer, default=80)
    threat_history_score = Column(Integer, default=90)
    privacy_controls_score = Column(Integer, default=80)
    
    recommendations = Column(JSON, default=list)
    last_assessed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class WebhookEndpoint(Base):
    """Developer outgoing webhook subscription."""
    __tablename__ = "webhook_endpoints"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    url = Column(String(2048), nullable=False)
    secret_key = Column(String(128), nullable=False)
    is_active = Column(Boolean, default=True)
    
    subscribed_events = Column(JSON, default=lambda: ["investigation.completed", "threat.detected", "monitoring.alert"])
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    deliveries = relationship("WebhookDelivery", back_populates="endpoint", cascade="all, delete-orphan")


class WebhookDelivery(Base):
    """Audit log of outgoing webhook deliveries with HMAC signature."""
    __tablename__ = "webhook_deliveries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    endpoint_id = Column(String(36), ForeignKey("webhook_endpoints.id"), nullable=False, index=True)
    
    event_type = Column(String(64), nullable=False)
    payload = Column(JSON, nullable=False)
    status_code = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    signature_header = Column(String(128), nullable=False)
    duration_ms = Column(Float, default=0.0)
    
    success = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    endpoint = relationship("WebhookEndpoint", back_populates="deliveries")


class UserFeedback(Base):
    """Feedback on investigation results for model/rule improvement."""
    __tablename__ = "user_feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(64), ForeignKey("investigations.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    rating = Column(String(32), nullable=False) # CORRECT, FALSE_POSITIVE, MISSING_INFO, UNSURE
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="feedback")


class AuthorizationRecord(Base):
    """Audit record of explicit user authorization for active security checks."""
    __tablename__ = "authorization_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    target = Column(String(2048), nullable=False)
    scope = Column(String(64), default="PASSIVE_AND_ACTIVE_SAFE", nullable=False)
    confirmed_ownership = Column(Boolean, default=True, nullable=False)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(512), nullable=True)
    authorized_at = Column(DateTime, default=datetime.utcnow, nullable=False)
