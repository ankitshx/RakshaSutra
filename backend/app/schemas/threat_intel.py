from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Threat Intel schemas
class ProviderStatusOut(BaseModel):
    name: str
    display_name: str
    status: str  # ACTIVE, FALLBACK_LOCAL, OFFLINE
    latency_ms: float
    total_queries: int
    cache_hits: int
    last_sync: datetime
    is_enabled: bool

class ThreatFeedItemOut(BaseModel):
    id: str
    ioc_type: str
    ioc_value: str
    threat_category: str
    confidence: int
    source: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []
    first_seen: datetime

class IOCSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=255)

class IOCSearchResponse(BaseModel):
    query: str
    found: bool
    ioc_type: Optional[str] = None
    matches: List[ThreatFeedItemOut] = []
    risk_summary: str
    providers_checked: List[str] = []

# Dashboard schemas
class ThreatCategoryCount(BaseModel):
    category: str
    count: int

class RiskDistributionCount(BaseModel):
    level: str
    count: int
    percentage: float
    color: str

class RecentActivityItem(BaseModel):
    id: str
    type: str
    target: str
    risk_score: int
    risk_level: str
    timestamp: datetime
    summary: str

class DashboardStatsOut(BaseModel):
    total_scans: int
    threats_detected: int
    suspicious_targets: int
    safe_analyses: int
    avg_analysis_time_ms: float
    active_providers_count: int
    risk_distribution: List[RiskDistributionCount]
    threat_categories: List[ThreatCategoryCount]
    recent_activity: List[RecentActivityItem]

# AI Assistant schemas
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
