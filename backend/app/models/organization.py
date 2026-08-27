"""
RakhshaSutra v3.0 — Organization, Multi-Tenancy & Granular RBAC 2.0
Implements multi-tenant boundary isolation, seats, team roles, and granular permissions.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Set
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

# Standard Role-to-Permissions Mapping for RBAC 2.0
ROLE_PERMISSIONS = {
    "owner": {
        "scan:create", "scan:view", "scan:delete",
        "asset:manage", "asset:view",
        "incident:create", "incident:update", "incident:close",
        "alert:triage", "alert:manage",
        "vulnerability:manage", "vulnerability:view",
        "automation:manage", "reports:generate",
        "api_key:create", "api_key:revoke", "webhook:manage",
        "billing:manage", "org:manage", "org:invite", "audit:view"
    },
    "admin": {
        "scan:create", "scan:view",
        "asset:manage", "asset:view",
        "incident:create", "incident:update", "incident:close",
        "alert:triage", "alert:manage",
        "vulnerability:manage", "vulnerability:view",
        "automation:manage", "reports:generate",
        "api_key:create", "api_key:revoke", "webhook:manage",
        "org:invite", "audit:view"
    },
    "analyst": {
        "scan:create", "scan:view",
        "asset:view",
        "incident:create", "incident:update",
        "alert:triage",
        "vulnerability:view", "vulnerability:manage",
        "reports:generate",
        "audit:view"
    },
    "developer": {
        "scan:create", "scan:view",
        "asset:view",
        "api_key:create", "api_key:revoke", "webhook:manage",
        "vulnerability:view",
        "reports:generate"
    },
    "viewer": {
        "scan:view",
        "asset:view",
        "alert:view",
        "incident:view",
        "vulnerability:view",
        "reports:view"
    }
}

def get_permissions_for_role(role: str) -> List[str]:
    return list(ROLE_PERMISSIONS.get(role.lower(), ROLE_PERMISSIONS["viewer"]))

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(150), nullable=False)
    domain = Column(String(255), unique=True, nullable=True, index=True)
    tier = Column(String(30), default="business")  # "business", "enterprise"
    max_seats = Column(Integer, default=5)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    members = relationship("TeamMember", back_populates="organization", cascade="all, delete-orphan")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    role = Column(String(30), default="analyst")  # "owner", "admin", "analyst", "developer", "viewer"
    custom_permissions = Column(JSON, default=list)

    invited_at = Column(DateTime, default=utc_now)
    joined_at = Column(DateTime, default=utc_now)

    organization = relationship("Organization", back_populates="members")
