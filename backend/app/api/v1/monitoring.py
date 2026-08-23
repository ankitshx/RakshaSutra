from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from datetime import datetime, timezone
import uuid

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.investigation import MonitoredTarget, MonitoringAlert
from app.scanners.investigation_pipeline import InvestigationPipeline

router = APIRouter(prefix="/monitoring", tags=["Continuous Threat Monitoring"])

@router.post("/targets")
async def add_monitored_target(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add an authorized target domain/URL for continuous automated threat monitoring."""
    raw_target = payload.get("target", "").strip()
    target_type = payload.get("target_type", "domain")
    freq = payload.get("check_frequency_hours", 24)

    if not raw_target:
        raise HTTPException(status_code=400, detail="Target is required.")

    # Run initial baseline investigation
    baseline = await InvestigationPipeline.run_investigation(raw_target, current_user.id)
    
    # Store initial baseline snapshot
    dns_records = baseline.get("raw_telemetry", {}).get("dns", {}).get("records", {})
    tls_info = baseline.get("raw_telemetry", {}).get("tls", {})
    snapshot = {
        "primary_ip": baseline.get("raw_telemetry", {}).get("dns", {}).get("primary_ip"),
        "ips": dns_records.get("A", []),
        "tls_issuer": tls_info.get("issuer"),
        "tls_expires_at": tls_info.get("expires_at"),
        "risk_score": baseline.get("risk_score", 0),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    target = MonitoredTarget(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        target=baseline.get("normalized_target", raw_target),
        target_type=target_type,
        check_frequency_hours=freq,
        is_active=True,
        last_checked_at=datetime.now(timezone.utc),
        last_risk_score=baseline.get("risk_score", 0),
        last_verdict=baseline.get("risk_level", "SAFE"),
        last_state_snapshot=snapshot
    )
    db.add(target)
    db.commit()
    db.refresh(target)

    return {
        "id": target.id,
        "target": target.target,
        "target_type": target.target_type,
        "check_frequency_hours": target.check_frequency_hours,
        "last_risk_score": target.last_risk_score,
        "last_verdict": target.last_verdict,
        "last_state_snapshot": target.last_state_snapshot,
        "is_active": target.is_active,
        "created_at": target.created_at.isoformat()
    }

@router.get("/targets")
async def list_monitored_targets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all targets monitored by current user."""
    targets = db.query(MonitoredTarget).filter(
        MonitoredTarget.user_id == current_user.id
    ).order_by(MonitoredTarget.created_at.desc()).all()

    return [
        {
            "id": t.id,
            "target": t.target,
            "target_type": t.target_type,
            "check_frequency_hours": t.check_frequency_hours,
            "is_active": t.is_active,
            "last_checked_at": t.last_checked_at.isoformat() if t.last_checked_at else None,
            "last_risk_score": t.last_risk_score,
            "last_verdict": t.last_verdict,
            "created_at": t.created_at.isoformat()
        }
        for t in targets
    ]

@router.post("/targets/{target_id}/check-now")
async def check_target_now(
    target_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger an on-demand audit check for a monitored target and compute evidence diffs."""
    target = db.query(MonitoredTarget).filter(
        MonitoredTarget.id == target_id,
        MonitoredTarget.user_id == current_user.id
    ).first()

    if not target:
        raise HTTPException(status_code=404, detail="Monitored target not found.")

    prev_snapshot = target.last_state_snapshot or {}
    
    # Run fresh check
    fresh = await InvestigationPipeline.run_investigation(target.target, current_user.id)
    
    dns_records = fresh.get("raw_telemetry", {}).get("dns", {}).get("records", {})
    tls_info = fresh.get("raw_telemetry", {}).get("tls", {})
    new_snapshot = {
        "primary_ip": fresh.get("raw_telemetry", {}).get("dns", {}).get("primary_ip"),
        "ips": dns_records.get("A", []),
        "tls_issuer": tls_info.get("issuer"),
        "tls_expires_at": tls_info.get("expires_at"),
        "risk_score": fresh.get("risk_score", 0),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    diffs = []
    # 1. IP Change
    if prev_snapshot.get("primary_ip") and new_snapshot.get("primary_ip") != prev_snapshot.get("primary_ip"):
        diffs.append(f"DNS Primary IP altered from {prev_snapshot.get('primary_ip')} to {new_snapshot.get('primary_ip')}")

    # 2. TLS Issuer Change
    if prev_snapshot.get("tls_issuer") and new_snapshot.get("tls_issuer") != prev_snapshot.get("tls_issuer"):
        diffs.append(f"SSL/TLS Certificate Issuer changed from '{prev_snapshot.get('tls_issuer')}' to '{new_snapshot.get('tls_issuer')}'")

    # 3. Risk Escalation
    if fresh.get("risk_score", 0) > (prev_snapshot.get("risk_score", 0) + 20):
        diffs.append(f"Risk Score escalated from {prev_snapshot.get('risk_score', 0)} to {fresh.get('risk_score', 0)}")

    if diffs:
        # Create Alert
        alert = MonitoringAlert(
            id=str(uuid.uuid4()),
            target_id=target.id,
            user_id=current_user.id,
            alert_type="INFRASTRUCTURE_OR_RISK_CHANGE",
            severity="HIGH" if fresh.get("risk_score", 0) >= 70 else "MEDIUM",
            title=f"Security Change Detected on {target.target}",
            description=" • " + "\n • ".join(diffs),
            previous_state=prev_snapshot,
            current_state=new_snapshot,
            diff_summary="; ".join(diffs)
        )
        db.add(alert)

    # Update target state
    target.last_checked_at = datetime.now(timezone.utc)
    target.last_risk_score = fresh.get("risk_score", 0)
    target.last_verdict = fresh.get("risk_level", "SAFE")
    target.last_state_snapshot = new_snapshot
    db.commit()

    return {
        "target_id": target.id,
        "target": target.target,
        "diff_detected": len(diffs) > 0,
        "diffs": diffs,
        "previous_state": prev_snapshot,
        "current_state": new_snapshot,
        "fresh_verdict": fresh.get("risk_level"),
        "fresh_risk_score": fresh.get("risk_score")
    }

@router.get("/alerts")
async def list_monitoring_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all continuous monitoring change alerts."""
    alerts = db.query(MonitoringAlert).filter(
        MonitoringAlert.user_id == current_user.id
    ).order_by(MonitoringAlert.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "target_id": a.target_id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "description": a.description,
            "previous_state": a.previous_state,
            "current_state": a.current_state,
            "diff_summary": a.diff_summary,
            "is_read": a.is_read,
            "created_at": a.created_at.isoformat()
        }
        for a in alerts
    ]

@router.delete("/targets/{target_id}")
async def delete_monitored_target(
    target_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a monitored target."""
    target = db.query(MonitoredTarget).filter(
        MonitoredTarget.id == target_id,
        MonitoredTarget.user_id == current_user.id
    ).first()

    if not target:
        raise HTTPException(status_code=404, detail="Monitored target not found.")

    db.delete(target)
    db.commit()
    return {"status": "SUCCESS", "message": f"Target {target.target} removed from monitoring."}
