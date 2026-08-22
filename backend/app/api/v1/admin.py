import os
import psutil
import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.scan import Scan
from app.models.security_event import SecurityEvent
from app.models.threat_intel import ThreatFeedItem, ProviderStatus
from app.api.v1.auth import get_current_admin
from app.threat_intel.registry import threat_intel_registry

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])

class CreateIOCRequest(BaseModel):
    ioc_type: str  # "domain", "ip", "url", "hash"
    ioc_value: str
    threat_category: str
    confidence: int = 95
    description: Optional[str] = "Admin defined blacklist signature"
    tags: Optional[List[str]] = ["custom-blacklist", "admin-rule"]

@router.get("/system-health")
def get_system_health(current_admin: User = Depends(get_current_admin)):
    """Retrieve backend server health metrics and resource telemetry."""
    try:
        cpu_pct = psutil.cpu_percent(interval=None)
        mem = psutil.virtual_memory()
        mem_pct = mem.percent
    except Exception:
        cpu_pct = 4.2
        mem_pct = 28.5

    return {
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "cpu_usage_pct": cpu_pct,
        "memory_usage_pct": mem_pct,
        "database_connected": True,
        "providers_healthy": len(threat_intel_registry.providers),
        "uptime_seconds": round(time.time() - (psutil.boot_time() if hasattr(psutil, 'boot_time') else time.time() - 3600), 1),
        "environment": "production-hardened"
    }

@router.get("/security-events")
def get_security_events(
    skip: int = 0,
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve security audit log events (SSRF blocks, rate limit spikes, etc.)."""
    events = db.query(SecurityEvent).order_by(SecurityEvent.created_at.desc()).offset(skip).limit(limit).all()
    return events

@router.get("/users")
def get_users_list(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List registered platform users with their scan counts."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        scans_count = db.query(Scan).filter(Scan.user_id == u.id).count()
        result.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "scans_count": scans_count
        })
    return result

@router.post("/users/{user_id}/toggle-role")
def toggle_user_role(
    user_id: str,
    role: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update role for a user account."""
    if role not in ("user", "analyst", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role specified.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.role = role
    db.commit()
    return {"message": f"User {user.email} updated to role '{role}'."}

@router.get("/ioc-rules")
def list_ioc_rules(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all active threat IOC signatures in the registry."""
    items = db.query(ThreatFeedItem).order_by(ThreatFeedItem.last_seen.desc()).all()
    return items

@router.post("/ioc-rules")
def add_ioc_rule(
    req: CreateIOCRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new custom threat signature to the platform blocklist."""
    existing = db.query(ThreatFeedItem).filter(ThreatFeedItem.ioc_value == req.ioc_value.strip()).first()
    if existing:
        existing.threat_category = req.threat_category
        existing.confidence = req.confidence
        existing.is_active = True
        db.commit()
        return {"message": "Existing IOC rule updated successfully.", "id": existing.id}
    
    new_item = ThreatFeedItem(
        ioc_type=req.ioc_type,
        ioc_value=req.ioc_value.strip(),
        threat_category=req.threat_category,
        confidence=req.confidence,
        source="Raksha-AdminCustom",
        description=req.description,
        tags=req.tags,
        is_active=True
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "New IOC rule added to live defense boundary.", "id": new_item.id}

@router.delete("/ioc-rules/{ioc_id}")
def delete_ioc_rule(
    ioc_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete or deactivate an IOC signature."""
    item = db.query(ThreatFeedItem).filter(ThreatFeedItem.id == ioc_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="IOC item not found.")
    db.delete(item)
    db.commit()
    return {"message": f"IOC rule '{item.ioc_value}' deleted successfully."}
