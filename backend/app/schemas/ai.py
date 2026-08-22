from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str

class AiChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    context_scan_id: Optional[str] = None
    history: List[ChatMessage] = []

class IncidentPlaybookOut(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    immediate_steps: List[str]
    secondary_steps: List[str]
    reporting_authorities: List[Dict[str, str]]

class AiChatResponse(BaseModel):
    response: str
    suggested_questions: List[str] = []
    related_playbook: Optional[IncidentPlaybookOut] = None
    references: List[str] = []
