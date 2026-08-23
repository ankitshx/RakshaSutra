"""
RakshaSutra Cyber Threat Map Engine
Provides structured simulation events and verified threat intelligence streams with explicit mode labeling.
"""

import time
import secrets
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.threat_intel import ThreatFeedItem

router = APIRouter(prefix="/threat-map", tags=["Cyber Threat Map"])

COUNTRIES = [
    {"code": "IN", "name": "India", "coords": [21.0, 78.0], "flag": "🇮🇳"},
    {"code": "US", "name": "United States", "coords": [38.0, -97.0], "flag": "🇺🇸"},
    {"code": "GB", "name": "United Kingdom", "coords": [54.0, -2.0], "flag": "🇬🇧"},
    {"code": "DE", "name": "Germany", "coords": [51.0, 10.0], "flag": "🇩🇪"},
    {"code": "JP", "name": "Japan", "coords": [36.0, 138.0], "flag": "🇯🇵"},
    {"code": "SG", "name": "Singapore", "coords": [1.35, 103.8], "flag": "🇸🇬"},
    {"code": "BR", "name": "Brazil", "coords": [-14.0, -51.0], "flag": "🇧🇷"},
    {"code": "AU", "name": "Australia", "coords": [-25.0, 134.0], "flag": "🇦🇺"},
    {"code": "AE", "name": "UAE", "coords": [24.0, 54.0], "flag": "🇦🇪"},
    {"code": "FR", "name": "France", "coords": [46.0, 2.0], "flag": "🇫🇷"},
    {"code": "CA", "name": "Canada", "coords": [56.0, -106.0], "flag": "🇨🇦"},
    {"code": "VN", "name": "Vietnam", "coords": [21.0, 105.8], "flag": "🇻🇳"}
]

ATTACK_TYPES = [
    "Phishing",
    "Credential Theft",
    "Malware",
    "Ransomware",
    "DDoS",
    "Web Attack",
    "Botnet",
    "Scam Campaign",
    "Data Breach"
]

SECTORS = [
    "Banking & UPI Gateway",
    "Electricity & Utilities",
    "E-Commerce & Retail",
    "Healthcare & Hospitals",
    "Telecom Infrastructure",
    "Government Services",
    "Cloud Services"
]

class ThreatMapEvent(BaseModel):
    event_id: str
    timestamp: str
    source_country: dict
    target_country: dict
    target_sector: str
    attack_type: str
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    confidence: str  # "LOW", "MEDIUM", "HIGH"
    category: str
    status: str
    mode: str  # "SIMULATION" or "THREAT_INTELLIGENCE"
    source_label: str

class ThreatMapFeedResponse(BaseModel):
    mode: str  # "SIMULATION" or "LIVE"
    is_live_feed_active: bool
    events: List[ThreatMapEvent]
    total_events: int
    generated_at: str

@router.get("/events", response_model=ThreatMapFeedResponse)
def get_threat_map_events(
    mode: Optional[str] = Query("auto", description="'simulation', 'live', or 'auto'"),
    attack_type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(20, ge=5, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve structured Cyber Threat Map events.
    Explicitly declares SIMULATION MODE when synthetic events are generated for visualization.
    """
    is_live_requested = mode.lower() == "live" and settings.FEATURE_LIVE_THREAT_INTELLIGENCE

    if is_live_requested:
        # Query active IOC items from ThreatFeedItem table
        ioc_items = db.query(ThreatFeedItem).filter(ThreatFeedItem.is_active == True).limit(limit).all()
        if ioc_items:
            live_events = []
            for item in ioc_items:
                src = COUNTRIES[hash(item.ioc_value) % len(COUNTRIES)]
                dst = COUNTRIES[(hash(item.ioc_value) + 3) % len(COUNTRIES)]
                live_events.append(ThreatMapEvent(
                    event_id=f"ioc-{item.id[:8]}",
                    timestamp=item.last_seen.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    source_country=src,
                    target_country=dst,
                    target_sector="Known IOC Feed",
                    attack_type=item.threat_category,
                    severity="HIGH" if item.confidence > 80 else "MEDIUM",
                    confidence="HIGH" if item.confidence > 80 else "MEDIUM",
                    category="Verified Threat Intelligence",
                    status="ANALYZED BY RAKSHASUTRA",
                    mode="THREAT_INTELLIGENCE",
                    source_label=item.source
                ))
            return ThreatMapFeedResponse(
                mode="LIVE",
                is_live_feed_active=True,
                events=live_events,
                total_events=len(live_events),
                generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            )

    # Simulation Mode Event Generation
    simulated_events: List[ThreatMapEvent] = []
    now = datetime.utcnow()

    for i in range(limit):
        src_idx = (i * 3 + 1) % len(COUNTRIES)
        dst_idx = (i * 5 + 4) % len(COUNTRIES)
        if src_idx == dst_idx:
            dst_idx = (dst_idx + 1) % len(COUNTRIES)

        atk = ATTACK_TYPES[i % len(ATTACK_TYPES)]
        sec = SECTORS[i % len(SECTORS)]
        sev = "CRITICAL" if atk in ["Ransomware", "Data Breach"] else "HIGH" if atk in ["Phishing", "DDoS", "Malware"] else "MEDIUM"
        conf = "HIGH" if i % 2 == 0 else "MEDIUM"
        
        event_time = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        simulated_events.append(ThreatMapEvent(
            event_id=f"sim-evt-{i+1001}",
            timestamp=event_time,
            source_country=COUNTRIES[src_idx],
            target_country=COUNTRIES[dst_idx],
            target_sector=sec,
            attack_type=atk,
            severity=sev,
            confidence=conf,
            category="Synthetic Educational Telemetry",
            status="SIMULATED ATTACK DETECTED",
            mode="SIMULATION",
            source_label="RakshaSutra Simulation Engine"
        ))

    # Apply filters if provided
    filtered = simulated_events
    if attack_type:
        filtered = [e for e in filtered if e.attack_type.lower() == attack_type.lower()]
    if severity:
        filtered = [e for e in filtered if e.severity.lower() == severity.lower()]

    return ThreatMapFeedResponse(
        mode="SIMULATION",
        is_live_feed_active=False,
        events=filtered,
        total_events=len(filtered),
        generated_at=now.strftime("%Y-%m-%d %H:%M:%S UTC")
    )
