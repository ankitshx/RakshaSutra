from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.scan import Scan
from app.schemas.ai import AiChatRequest, AiChatResponse, IncidentPlaybookOut
from app.services.ai_assistant import generate_ai_security_response, INCIDENT_PLAYBOOKS

router = APIRouter(prefix="/ai", tags=["Raksha AI Security Copilot"])

@router.post("/chat", response_model=AiChatResponse)
def chat_with_raksha_ai(
    req: AiChatRequest,
    db: Session = Depends(get_db)
):
    """
    Interact with Raksha AI: Ask security questions, request incident response playbooks,
    or ask for plain-language breakdowns of previous scans.
    """
    context_scan = None
    if req.context_scan_id:
        context_scan = db.query(Scan).filter(Scan.id == req.context_scan_id).first()

    history_dicts = [{"role": m.role, "content": m.content} for m in req.history]

    result = generate_ai_security_response(
        query=req.message,
        context_scan=context_scan,
        history=history_dicts
    )

    return AiChatResponse(
        response=result["response"],
        suggested_questions=result.get("suggested_questions", []),
        related_playbook=result.get("related_playbook"),
        references=result.get("references", [])
    )

@router.get("/playbooks", response_model=List[IncidentPlaybookOut])
def get_all_playbooks():
    """Retrieve all standard guided incident response playbooks."""
    return list(INCIDENT_PLAYBOOKS.values())

@router.get("/playbooks/{playbook_id}", response_model=IncidentPlaybookOut)
def get_playbook(playbook_id: str):
    """Retrieve a specific incident playbook."""
    for pb in INCIDENT_PLAYBOOKS.values():
        if pb.id == playbook_id:
            return pb
    raise HTTPException(status_code=404, detail="Incident playbook not found.")
