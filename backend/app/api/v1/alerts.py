"""
RakhshaSutra v3.0 — Centralized Alert Pipeline API
Ingestion, severity classification, deduplication, triage, and resolution of security alerts.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.alert_and_incident import SecurityAlert, SecurityIncident
from app.models.asset import Asset

router = APIRouter(prefix="/alerts", tags=["Centralized Alert Pipeline"])

class CreateAlertRequest(BaseModel):
    title: str
    alert_type: str = Field(..., description="CERTIFICATE_EXPIRING, DNS_DRIFT, MALWARE_IOC_MATCH, PHISHING_DOMAIN_DETECTED, VULNERABILITY_CRITICAL, ANOMALY_TRAFFIC, HONEYTOKEN_TRIPPED")
    severity: str = Field("MEDIUM", description="CRITICAL, HIGH, MEDIUM, LOW, INFO")
    description: str
    asset_id: Optional[str] = None
    source: str = "Continuous Monitor"
    confidence: int = 85
    recommended_action: Optional[str] = None
    evidence_data: Dict[str, Any] = {}

class UpdateAlertStatusRequest(BaseModel):
    status: str = Field(..., description="NEW, ACKNOWLEDGED, INVESTIGATING, CONTAINED, RESOLVED, FALSE_POSITIVE")
    assigned_to_user_id: Optional[str] = None

@router.get("", response_model=List[Dict[str, Any]])
def list_alerts(
    severity: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    asset_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve security alerts filtered by severity, status, and affected asset."""
    query = db.query(SecurityAlert)

    if severity:
        query = query.filter(SecurityAlert.severity == severity.upper())
    if status_filter:
        query = query.filter(SecurityAlert.status == status_filter.upper())
    if asset_id:
        query = query.filter(SecurityAlert.asset_id == asset_id)
    if search:
        query = query.filter(
            (SecurityAlert.title.ilike(f"%{search}%")) |
            (SecurityAlert.description.ilike(f"%{search}%")) |
            (SecurityAlert.alert_type.ilike(f"%{search}%"))
        )

    alerts = query.order_by(SecurityAlert.created_at.desc()).limit(limit).all()

    return [
        {
            "id": a.id,
            "title": a.title,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "confidence": a.confidence,
            "status": a.status,
            "source": a.source,
            "description": a.description,
            "asset_id": a.asset_id,
            "asset_name": a.asset.name if a.asset else None,
            "incident_id": a.incident_id,
            "recommended_action": a.recommended_action,
            "evidence_data": a.evidence_data or {},
            "occurrence_count": a.occurrence_count,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None
        }
        for a in alerts
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_alert(
    req: CreateAlertRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ingest a new security alert into the event pipeline."""
    # Deduplication check
    dedup_key = f"{req.alert_type}:{req.asset_id}:{req.title}"
    existing = db.query(SecurityAlert).filter(
        SecurityAlert.dedup_key == dedup_key,
        SecurityAlert.status.in_(("NEW", "ACKNOWLEDGED", "INVESTIGATING"))
    ).first()

    if existing:
        existing.occurrence_count += 1
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        return {"message": "Existing alert updated and incremented.", "id": existing.id, "deduplicated": True}

    alert = SecurityAlert(
        title=req.title,
        alert_type=req.alert_type.upper(),
        severity=req.severity.upper(),
        confidence=req.confidence,
        status="NEW",
        source=req.source,
        description=req.description,
        asset_id=req.asset_id,
        recommended_action=req.recommended_action,
        evidence_data=req.evidence_data,
        dedup_key=dedup_key
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    return {"message": "Security alert ingested.", "id": alert.id, "deduplicated": False}

@router.put("/{alert_id}/status")
def update_alert_status(
    alert_id: str,
    req: UpdateAlertStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Acknowledge, investigate, or resolve a security alert."""
    alert = db.query(SecurityAlert).filter(SecurityAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    valid_statuses = ("NEW", "ACKNOWLEDGED", "INVESTIGATING", "CONTAINED", "RESOLVED", "FALSE_POSITIVE")
    if req.status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    alert.status = req.status.upper()
    if req.assigned_to_user_id:
        alert.assigned_to_user_id = req.assigned_to_user_id
    alert.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": f"Alert status updated to '{alert.status}'.", "id": alert.id}

@router.get("/metrics/summary")
def get_alerts_summary_metrics(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve operational summary metrics for the SOC dashboard."""
    all_alerts = db.query(SecurityAlert).all()

    total = len(all_alerts)
    critical_count = len([a for a in all_alerts if a.severity == "CRITICAL"])
    high_count = len([a for a in all_alerts if a.severity == "HIGH"])
    new_unresolved = len([a for a in all_alerts if a.status in ("NEW", "ACKNOWLEDGED")])

    return {
        "total_alerts": total,
        "critical_alerts": critical_count,
        "high_alerts": high_count,
        "new_unresolved": new_unresolved,
        "severities": {
            "critical": critical_count,
            "high": high_count,
            "medium": len([a for a in all_alerts if a.severity == "MEDIUM"]),
            "low": len([a for a in all_alerts if a.severity == "LOW"]),
            "info": len([a for a in all_alerts if a.severity == "INFO"])
        },
        "statuses": {
            "new": len([a for a in all_alerts if a.status == "NEW"]),
            "acknowledged": len([a for a in all_alerts if a.status == "ACKNOWLEDGED"]),
            "investigating": len([a for a in all_alerts if a.status == "INVESTIGATING"]),
            "resolved": len([a for a in all_alerts if a.status == "RESOLVED"]),
            "false_positive": len([a for a in all_alerts if a.status == "FALSE_POSITIVE"])
        }
    }
