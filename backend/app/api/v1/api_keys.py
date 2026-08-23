"""
RakshaSutra API Key Management & Gateway Endpoints
Enforces hashed keys, per-key rate limits, and authoritative account-level quotas for Business and Enterprise tiers.
"""

import time
import hashlib
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Header, status, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import generate_secure_api_key, hash_api_key
from app.models.user import User
from app.models.api_gateway import APIKey, APIUsage, APIQuota
from app.models.audit_log import AuditLog
from app.api.v1.auth import get_current_user
from app.services.entitlement_service import EntitlementService

router = APIRouter(prefix="/api-keys", tags=["Developer API Gateway"])

# Schemas
class CreateAPIKeyRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Descriptive label (e.g. 'Production SIEM Pipeline')")
    expires_in_days: Optional[int] = Field(90, ge=1, le=365)

class APIKeyOut(BaseModel):
    id: str
    name: str
    key_prefix: str
    status: str
    rate_limit_per_min: int
    created_at: str
    last_used_at: Optional[str] = None
    expires_at: Optional[str] = None

class CreateAPIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    raw_api_key: str  # ONLY RETURNED ONCE
    rate_limit_per_min: int
    monthly_account_quota: int
    created_at: str
    expires_at: Optional[str] = None
    notice: str = "Please copy and save this secret API key securely. It will never be displayed again."

@router.get("", response_model=List[APIKeyOut])
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all active and revoked API keys owned by the user or organization."""
    if not EntitlementService.can_use_api(current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API Key access is available exclusively for Business and Enterprise plans. Upgrade to generate API keys."
        )

    keys = db.query(APIKey).filter(APIKey.user_id == current_user.id).order_by(APIKey.created_at.desc()).all()
    
    return [
        APIKeyOut(
            id=k.id,
            name=k.name,
            key_prefix=k.key_prefix,
            status=k.status,
            rate_limit_per_min=k.rate_limit_per_min,
            created_at=k.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
            last_used_at=k.last_used_at.strftime("%Y-%m-%d %H:%M:%S UTC") if k.last_used_at else None,
            expires_at=k.expires_at.strftime("%Y-%m-%d %H:%M:%S UTC") if k.expires_at else None
        )
        for k in keys
    ]

@router.post("", response_model=CreateAPIKeyResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(
    request: CreateAPIKeyRequest,
    req: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a cryptographic API key.
    The raw API key is returned exactly once. Only its prefix and SHA-256 hash are stored.
    """
    if not EntitlementService.can_use_api(current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API Key access is available exclusively for Business and Enterprise plans. Upgrade to generate API keys."
        )

    # Maximum 5 active keys per account
    active_keys_count = db.query(APIKey).filter(APIKey.user_id == current_user.id, APIKey.status == "active").count()
    if active_keys_count >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum limit of 5 active API keys reached. Please revoke an unused key before creating a new one."
        )

    tier = getattr(current_user, "subscription_tier", "business").lower()
    raw_key, prefix, key_hash = generate_secure_api_key(tier=tier)

    rate_limit = 10 if tier == "business" else 60
    expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days) if request.expires_in_days else None

    api_key_record = APIKey(
        user_id=current_user.id,
        name=request.name.strip(),
        key_prefix=prefix,
        key_hash=key_hash,
        status="active",
        rate_limit_per_min=rate_limit,
        expires_at=expires_at
    )
    db.add(api_key_record)
    
    # Initialize or fetch account-level quota
    quota = db.query(APIQuota).filter(APIQuota.user_id == current_user.id).first()
    if not quota:
        monthly_limit = 1000 if tier == "business" else 50000
        quota = APIQuota(
            user_id=current_user.id,
            monthly_limit=monthly_limit,
            requests_this_month=0
        )
        db.add(quota)
    
    db.commit()
    db.refresh(api_key_record)

    # Log audit event
    audit = AuditLog(
        actor_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        action="API_KEY_CREATED",
        target_type="api_key",
        target_id=api_key_record.id,
        details={"name": request.name, "prefix": prefix},
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(audit)
    db.commit()

    return CreateAPIKeyResponse(
        id=api_key_record.id,
        name=api_key_record.name,
        key_prefix=prefix,
        raw_api_key=raw_key,
        rate_limit_per_min=rate_limit,
        monthly_account_quota=quota.monthly_limit,
        created_at=api_key_record.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        expires_at=expires_at.strftime("%Y-%m-%d %H:%M:%S UTC") if expires_at else None
    )

@router.delete("/{key_id}")
def revoke_api_key(
    key_id: str,
    req: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke an API key immediately."""
    api_key_record = db.query(APIKey).filter(APIKey.id == key_id, APIKey.user_id == current_user.id).first()
    if not api_key_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found.")

    api_key_record.status = "revoked"
    db.commit()

    # Log audit event
    audit = AuditLog(
        actor_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        action="API_KEY_REVOKED",
        target_type="api_key",
        target_id=key_id,
        details={"prefix": api_key_record.key_prefix},
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "API key has been revoked and can no longer be used."}

@router.get("/usage/summary")
def get_api_usage_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get account-level API usage and monthly quota statistics."""
    tier = getattr(current_user, "subscription_tier", "free").lower()
    quota = db.query(APIQuota).filter(APIQuota.user_id == current_user.id).first()
    
    current_month_str = datetime.utcnow().strftime("%Y-%m")
    requests_used = quota.requests_this_month if (quota and quota.current_month == current_month_str) else 0
    monthly_limit = quota.monthly_limit if quota else (1000 if tier == "business" else 50000 if tier == "enterprise" else 0)

    active_keys = db.query(APIKey).filter(APIKey.user_id == current_user.id, APIKey.status == "active").count()

    return {
        "tier": tier,
        "is_api_enabled": EntitlementService.can_use_api(current_user, db),
        "monthly_limit": monthly_limit,
        "requests_used_this_month": requests_used,
        "requests_remaining": max(0, monthly_limit - requests_used),
        "active_keys_count": active_keys,
        "rate_limit_per_minute": 10 if tier == "business" else 60,
        "current_billing_month": current_month_str
    }
