from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.scan import ThreatIndicatorOut

class SecurityHeaderAudit(BaseModel):
    name: str
    present: bool
    value: Optional[str] = None
    rating: str  # "PASS", "WARN", "FAIL"
    importance: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    recommendation: str

class TLSDetails(BaseModel):
    enabled: bool
    version: Optional[str] = None
    issuer: Optional[str] = None
    valid_until: Optional[str] = None
    days_remaining: Optional[int] = None
    hsts_active: bool = False

class WebsiteScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)

class WebsiteScanResponse(BaseModel):
    scan_id: str
    target_url: str
    final_url: str
    status_code: Optional[int] = None
    hygiene_score: int = Field(..., ge=0, le=100)
    hygiene_rating: str  # "A+", "A", "B", "C", "D", "F"
    risk_level: str  # LOW, MODERATE, SUSPICIOUS, HIGH
    summary: str
    recommendation: str
    tls_details: TLSDetails
    headers_audit: List[SecurityHeaderAudit] = []
    cookie_security: Dict[str, Any] = {}
    indicators: List[ThreatIndicatorOut] = []
    execution_time_ms: float
    request_id: str
    created_at: datetime
