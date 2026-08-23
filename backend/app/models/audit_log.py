"""
RakshaSutra Security & Administration Audit Log Model
Records immutable audit trails of all critical administrative, security, and authentication events.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Text
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id = Column(String(36), nullable=True, index=True)
    actor_email = Column(String(255), nullable=True, index=True)
    actor_role = Column(String(30), nullable=True)
    
    action = Column(String(100), nullable=False, index=True)  # e.g. "USER_LOGIN", "ADMIN_UPDATE_PLAN", "API_KEY_REVOKED"
    target_type = Column(String(50), nullable=True)  # "user", "plan", "api_key", "system_config"
    target_id = Column(String(100), nullable=True)
    
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
