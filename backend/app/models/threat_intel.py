import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, Boolean, JSON
from app.core.database import Base

class ThreatFeedItem(Base):
    __tablename__ = "threat_feed_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ioc_type = Column(String(30), nullable=False, index=True)  # "domain", "ip", "url", "hash"
    ioc_value = Column(String(512), nullable=False, unique=True, index=True)
    threat_category = Column(String(50), nullable=False, index=True)  # "Phishing", "Malware", "C2", "Scam"
    confidence = Column(Integer, default=90)  # 0 - 100
    source = Column(String(50), nullable=False)  # "URLhaus", "Raksha-Local", "VirusTotal", etc.
    description = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)

class ProviderStatus(Base):
    __tablename__ = "provider_statuses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    status = Column(String(20), default="ACTIVE")  # "ACTIVE", "DEGRADED", "OFFLINE", "FALLBACK_LOCAL"
    latency_ms = Column(Float, default=0.0)
    total_queries = Column(Integer, default=0)
    cache_hits = Column(Integer, default=0)
    last_sync = Column(DateTime, default=datetime.utcnow)
    is_enabled = Column(Boolean, default=True)
