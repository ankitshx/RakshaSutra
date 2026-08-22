from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class ThreatIndicatorOut(BaseModel):
    category: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"
    title: str
    evidence: str
    explanation: str
    score_impact: int = 0

class UrlScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048, description="The suspicious URL to inspect")

class TechnicalDetailsOut(BaseModel):
    normalized_url: str
    domain: str
    subdomain: Optional[str] = None
    tld: str
    ip_addresses: List[str] = []
    redirect_chain: List[Dict[str, Any]] = []
    https_enabled: bool = False
    status_code: Optional[int] = None
    brand_impersonated: Optional[str] = None
    levenshtein_distance: Optional[int] = None
    tld_reputation_tier: str = "Standard"
    threat_intel_hits: List[Dict[str, Any]] = []
    dns_records: Dict[str, Any] = {}
    rdap_info: Dict[str, Any] = {}

class ScanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scan_id: str
    scan_type: str
    target: str
    target_display: str
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str  # "LOW", "MODERATE", "SUSPICIOUS", "HIGH"
    summary: str
    recommendation: str
    indicators: List[ThreatIndicatorOut] = []
    technical_details: TechnicalDetailsOut
    execution_time_ms: float
    request_id: str
    created_at: datetime

class ScanHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scan_type: str
    target_display: str
    risk_score: int
    risk_level: str
    summary: str
    indicators_count: int
    created_at: datetime
    execution_time_ms: float
