"""
RakhshaSutra v3.0 — Attack Surface Management (ASM) & Asset Data Models
Tracks authorized organizational digital assets, passive discovery, technologies, and relational topology.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

def generate_asset_id() -> str:
    year = datetime.now(timezone.utc).year
    random_hex = uuid.uuid4().hex[:6].upper()
    return f"RS-AST-{year}-{random_hex}"

class Asset(Base):
    """
    Core Attack Surface Asset entity.
    Tracks domains, subdomains, IPs, certificates, APIs, repos, and cloud assets.
    """
    __tablename__ = "assets"

    id = Column(String(64), primary_key=True, default=generate_asset_id, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    name = Column(String(255), nullable=False, index=True)
    asset_type = Column(String(32), nullable=False, index=True)
    # asset_type: "domain", "subdomain", "ip_address", "certificate", "api_endpoint", "repository", "cloud_resource", "exposed_service"

    environment = Column(String(32), default="production", nullable=False) # production, staging, development
    criticality = Column(String(16), default="HIGH", nullable=False) # CRITICAL, HIGH, MEDIUM, LOW

    ip_address = Column(String(64), nullable=True, index=True)
    asn = Column(String(64), nullable=True)
    hosting_provider = Column(String(128), nullable=True)
    location_country = Column(String(64), nullable=True)

    risk_score = Column(Integer, default=15, nullable=False) # 0 - 100
    risk_level = Column(String(16), default="LOW", nullable=False) # SAFE, LOW, MEDIUM, HIGH, CRITICAL

    is_monitored = Column(Boolean, default=True, nullable=False)
    monitoring_frequency_hours = Column(Integer, default=24, nullable=False)
    last_monitored_at = Column(DateTime, nullable=True)

    technologies = Column(JSON, default=list) # e.g. ["Nginx 1.24", "React 19", "Python FastAPI", "Cloudflare"]
    dns_records = Column(JSON, default=dict)
    tls_certificate = Column(JSON, default=dict) # issuer, valid_from, valid_to, days_left, sans
    http_security_headers = Column(JSON, default=dict)
    open_ports = Column(JSON, default=list)
    tags = Column(JSON, default=list)

    first_seen_at = Column(DateTime, default=utc_now, nullable=False)
    last_seen_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    vulnerabilities = relationship("AssetVulnerability", back_populates="asset", cascade="all, delete-orphan")
    alerts = relationship("SecurityAlert", back_populates="asset", cascade="all, delete-orphan")
    outgoing_relationships = relationship("AssetRelationship", foreign_keys="[AssetRelationship.source_asset_id]", back_populates="source_asset", cascade="all, delete-orphan")
    incoming_relationships = relationship("AssetRelationship", foreign_keys="[AssetRelationship.target_asset_id]", back_populates="target_asset", cascade="all, delete-orphan")

class AssetRelationship(Base):
    """
    Evidence-backed graph relationship between two assets.
    """
    __tablename__ = "asset_relationships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_asset_id = Column(String(64), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    target_asset_id = Column(String(64), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)

    relationship_type = Column(String(64), nullable=False)
    # "resolves_to", "hosted_by", "issued_by", "subdomain_of", "depends_on", "communicates_with", "impersonates"

    confidence = Column(Integer, default=90, nullable=False) # 0 - 100
    evidence_source = Column(String(64), default="DNS_RESOLUTION", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    source_asset = relationship("Asset", foreign_keys=[source_asset_id], back_populates="outgoing_relationships")
    target_asset = relationship("Asset", foreign_keys=[target_asset_id], back_populates="incoming_relationships")

class AssetDiscoveryLog(Base):
    """Log of passive discovery operations (e.g. Certificate Transparency, DNS enumeration)."""
    __tablename__ = "asset_discovery_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    seed_domain = Column(String(255), nullable=False)
    source = Column(String(64), nullable=False) # "CERTIFICATE_TRANSPARENCY", "PASSIVE_DNS", "MANUAL_INPUT"
    discovered_count = Column(Integer, default=0, nullable=False)
    discovered_assets = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now, nullable=False)
