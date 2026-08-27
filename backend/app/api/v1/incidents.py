"""
RakhshaSutra v3.0 — SOC Incident Management API
Full incident lifecycle, timeline logs, containment checklists, analyst notes, and playbook execution.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.alert_and_incident import SecurityIncident, IncidentTimelineEvent, SecurityAlert

router = APIRouter(prefix="/incidents", tags=["SOC Incident Management"])

class CreateIncidentRequest(BaseModel):
    title: str
    classification: str = Field("Phishing Attempt", description="Phishing Attempt, Account Takeover, Credential Compromise, Data Exposure, Ransomware Threat, Malware C2")
    severity: str = Field("HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    summary: str
    affected_assets: List[str] = []
    ioc_indicators: List[str] = []
    defensive_playbook_id: Optional[str] = None

class AddAnalystNoteRequest(BaseModel):
    note: str

class UpdateIncidentStatusRequest(BaseModel):
    status: str = Field(..., description="OPEN, INVESTIGATING, CONTAINED, REMEDIATED, CLOSED")
    lessons_learned: Optional[str] = None

class UpdateChecklistRequest(BaseModel):
    step_index: int
    completed: bool

@router.get("", response_model=List[Dict[str, Any]])
def list_incidents(
    severity: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List all active and historical SOC security incidents."""
    query = db.query(SecurityIncident)

    if severity:
        query = query.filter(SecurityIncident.severity == severity.upper())
    if status_filter:
        query = query.filter(SecurityIncident.status == status_filter.upper())
    if search:
        query = query.filter(
            (SecurityIncident.title.ilike(f"%{search}%")) |
            (SecurityIncident.summary.ilike(f"%{search}%")) |
            (SecurityIncident.classification.ilike(f"%{search}%"))
        )

    incidents = query.order_by(SecurityIncident.created_at.desc()).all()

    return [
        {
            "id": inc.id,
            "title": inc.title,
            "classification": inc.classification,
            "severity": inc.severity,
            "status": inc.status,
            "summary": inc.summary,
            "affected_assets": inc.affected_assets or [],
            "ioc_indicators": inc.ioc_indicators or [],
            "defensive_playbook_id": inc.defensive_playbook_id,
            "alerts_count": len(inc.alerts),
            "timeline_events_count": len(inc.timeline_events),
            "created_at": inc.created_at.isoformat() if inc.created_at else None,
            "contained_at": inc.contained_at.isoformat() if inc.contained_at else None,
            "closed_at": inc.closed_at.isoformat() if inc.closed_at else None
        }
        for inc in incidents
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_incident(
    req: CreateIncidentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Declare a new security incident with initial containment checklist."""
    # Default containment checklist based on classification
    default_checklist = [
        {"step": "Isolate affected hosts or network endpoints", "completed": False},
        {"step": "Revoke active session tokens and API keys", "completed": False},
        {"step": "Capture forensic evidence snapshot & SHA-256 digest", "completed": False},
        {"step": "Block malicious IOC indicators on edge firewall / WAF", "completed": False},
        {"step": "Notify impacted users and execute credential rotation", "completed": False}
    ]

    incident = SecurityIncident(
        title=req.title,
        classification=req.classification,
        severity=req.severity.upper(),
        status="OPEN",
        summary=req.summary,
        affected_assets=req.affected_assets,
        ioc_indicators=req.ioc_indicators,
        containment_checklist=default_checklist,
        defensive_playbook_id=req.defensive_playbook_id,
        owner_id=current_user.id
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Log timeline event
    event = IncidentTimelineEvent(
        incident_id=incident.id,
        user_id=current_user.id,
        event_type="INCIDENT_DECLARED",
        title="Incident Declared",
        details=f"Incident declared by {current_user.email} with severity {incident.severity}."
    )
    db.add(event)
    db.commit()

    return {"message": f"Incident {incident.id} created successfully.", "id": incident.id}

@router.get("/{incident_id}")
def get_incident_detail(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve full incident dossier including timeline events, containment checklist, and analyst notes."""
    inc = db.query(SecurityIncident).filter(SecurityIncident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    return {
        "id": inc.id,
        "title": inc.title,
        "classification": inc.classification,
        "severity": inc.severity,
        "status": inc.status,
        "summary": inc.summary,
        "affected_assets": inc.affected_assets or [],
        "ioc_indicators": inc.ioc_indicators or [],
        "containment_checklist": inc.containment_checklist or [],
        "defensive_playbook_id": inc.defensive_playbook_id,
        "analyst_notes": inc.analyst_notes,
        "lessons_learned": inc.lessons_learned,
        "created_at": inc.created_at.isoformat() if inc.created_at else None,
        "contained_at": inc.contained_at.isoformat() if inc.contained_at else None,
        "closed_at": inc.closed_at.isoformat() if inc.closed_at else None,
        "timeline": [
            {
                "id": ev.id,
                "event_type": ev.event_type,
                "title": ev.title,
                "details": ev.details,
                "created_at": ev.created_at.isoformat() if ev.created_at else None
            }
            for ev in inc.timeline_events
        ],
        "alerts": [
            {
                "id": alt.id,
                "title": alt.title,
                "severity": alt.severity,
                "status": alt.status
            }
            for alt in inc.alerts
        ]
    }

@router.post("/{incident_id}/notes")
def add_analyst_note(
    incident_id: str,
    req: AddAnalystNoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Append technical analyst notes to the incident investigation log."""
    inc = db.query(SecurityIncident).filter(SecurityIncident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    new_entry = f"[{timestamp_str} - {current_user.email}]:\n{req.note}\n\n"

    inc.analyst_notes = (inc.analyst_notes or "") + new_entry

    event = IncidentTimelineEvent(
        incident_id=inc.id,
        user_id=current_user.id,
        event_type="NOTE_ADDED",
        title="Analyst Note Added",
        details=req.note[:200]
    )
    db.add(event)
    db.commit()

    return {"message": "Analyst note appended.", "id": inc.id}

@router.put("/{incident_id}/status")
def update_incident_status(
    incident_id: str,
    req: UpdateIncidentStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update incident containment and resolution status."""
    inc = db.query(SecurityIncident).filter(SecurityIncident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    valid_statuses = ("OPEN", "INVESTIGATING", "CONTAINED", "REMEDIATED", "CLOSED")
    if req.status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    old_status = inc.status
    inc.status = req.status.upper()

    if inc.status == "CONTAINED" and not inc.contained_at:
        inc.contained_at = datetime.now(timezone.utc)
    elif inc.status == "CLOSED":
        inc.closed_at = datetime.now(timezone.utc)
        if req.lessons_learned:
            inc.lessons_learned = req.lessons_learned

    event = IncidentTimelineEvent(
        incident_id=inc.id,
        user_id=current_user.id,
        event_type="STATUS_CHANGED",
        title=f"Status Changed: {old_status} -> {inc.status}",
        details=f"Status transitioned by {current_user.email}."
    )
    db.add(event)
    db.commit()

    return {"message": f"Incident status updated to '{inc.status}'.", "id": inc.id}
