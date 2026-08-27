from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str

class AiChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    context_scan_id: Optional[str] = None
    mode: str = Field("guardian", description="guardian (plain language) or analyst (technical, evidence-heavy)")
    history: List[ChatMessage] = []

class IncidentPlaybookOut(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    immediate_steps: List[str]
    secondary_steps: List[str]
    reporting_authorities: List[Dict[str, str]]

class EvidenceCitation(BaseModel):
    id: str
    source: str
    category: str
    observation: str
    confidence: int

class AiChatResponse(BaseModel):
    response: str
    mode: str = "guardian"
    suggested_questions: List[str] = []
    related_playbook: Optional[IncidentPlaybookOut] = None
    references: List[str] = []
    evidence_citations: List[Dict[str, Any]] = []
