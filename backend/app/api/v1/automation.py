"""
RakhshaSutra v3.0 — Security Automation Engine API
Configures safe automated workflows (e.g. Critical alert -> auto-create incident + webhook).
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.alert_and_incident import AutomationRule

router = APIRouter(prefix="/automation", tags=["Security Automation Rules"])

class CreateRuleRequest(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str = Field(..., description="ON_CRITICAL_ALERT, ON_CERT_EXPIRY, ON_HONEYTOKEN_TRIP")
    conditions: Dict[str, Any] = {}
    actions: List[Dict[str, Any]] = []

class ToggleRuleRequest(BaseModel):
    is_enabled: bool

@router.get("", response_model=List[Dict[str, Any]])
def list_automation_rules(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List all configured security automation rules."""
    rules = db.query(AutomationRule).order_by(AutomationRule.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "is_enabled": r.is_enabled,
            "trigger_type": r.trigger_type,
            "conditions": r.conditions or {},
            "actions": r.actions or [],
            "execution_count": r.execution_count,
            "last_triggered_at": r.last_triggered_at.isoformat() if r.last_triggered_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in rules
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_automation_rule(
    req: CreateRuleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new automation rule with triggers and defensive action sequences."""
    rule = AutomationRule(
        name=req.name,
        description=req.description,
        trigger_type=req.trigger_type.upper(),
        conditions=req.conditions,
        actions=req.actions,
        is_enabled=True
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return {"message": "Automation rule created successfully.", "id": rule.id}

@router.put("/{rule_id}/toggle")
def toggle_automation_rule(
    rule_id: str,
    req: ToggleRuleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enable or disable an automation rule."""
    rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found.")
    rule.is_enabled = req.is_enabled
    db.commit()
    return {"message": f"Rule is now {'enabled' if rule.is_enabled else 'disabled'}.", "id": rule.id}

@router.delete("/{rule_id}")
def delete_automation_rule(
    rule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an automation rule."""
    rule = db.query(AutomationRule).filter(AutomationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found.")
    db.delete(rule)
    db.commit()
    return {"status": "success", "message": "Automation rule deleted."}
