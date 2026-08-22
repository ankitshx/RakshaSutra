from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.scan import ThreatIndicatorOut, TechnicalDetailsOut

class DetectedTechnique(BaseModel):
    category: str
    name: str
    confidence: int  # 0-100
    matched_phrase: str
    description: str

class MessageScanRequest(BaseModel):
    channel: str = Field("generic", description="email, sms, whatsapp, social, telegram, generic")
    content: str = Field(..., min_length=5, max_length=10000, description="The message content to analyze")
    sender: Optional[str] = Field(None, max_length=255, description="Sender email, phone number, or handle")

class MessageScanResponse(BaseModel):
    scan_id: str
    channel: str
    sender: Optional[str] = None
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str
    summary: str
    recommendation: str
    detected_techniques: List[DetectedTechnique] = []
    indicators: List[ThreatIndicatorOut] = []
    extracted_urls: List[str] = []
    embedded_url_analyses: List[Dict[str, Any]] = []
    execution_time_ms: float
    request_id: str
    created_at: datetime
