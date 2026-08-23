from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.threat_intel.registry import threat_intel_registry
from app.threat_intel.local_db import KNOWN_MALICIOUS_DOMAINS
from app.schemas.threat_intel import ProviderStatusOut, IOCSearchRequest, IOCSearchResponse, ThreatFeedItemOut
from datetime import datetime, timezone

router = APIRouter(prefix="/threat-intelligence", tags=["Threat Intelligence Center"])

@router.get("/health")
def get_threat_intel_health():
    """
    Retrieve real-time health and operational status for all external and internal intelligence engines.
    Distinguishes OPERATIONAL, DEGRADED, UNAVAILABLE, RATE_LIMITED, and NOT_CONFIGURED.
    """
    statuses = threat_intel_registry.get_all_provider_statuses()
    total = len(statuses)
    operational = sum(1 for s in statuses if s.get("status") == "OPERATIONAL")
    degraded = sum(1 for s in statuses if s.get("status") in ["DEGRADED", "RATE_LIMITED"])
    unavailable = sum(1 for s in statuses if s.get("status") in ["UNAVAILABLE", "NOT_CONFIGURED"])

    return {
        "overall_status": "OPERATIONAL" if operational >= 3 else ("DEGRADED" if operational >= 1 else "UNAVAILABLE"),
        "total_providers": total,
        "operational_count": operational,
        "degraded_count": degraded,
        "unavailable_count": unavailable,
        "providers": statuses,
        "checked_at": datetime.now(timezone.utc).isoformat()
    }

@router.get("/providers")
def get_providers():
    """Retrieve status, latency, and query metrics of all threat intelligence providers."""
    return threat_intel_registry.get_all_provider_statuses()

@router.post("/search", response_model=IOCSearchResponse)
async def search_ioc(req: IOCSearchRequest):
    """Search global threat telemetry and verified databases for a domain, IP, or URL IOC."""
    q = req.query.strip().lower()
    ioc_type = "ip" if any(c.isdigit() for c in q) and "." in q and not any(c.isalpha() for c in q) else "domain"
    
    result = await threat_intel_registry.query_all(q, ioc_type)

    matches = []
    for hit in result.get("hits", []):
        matches.append(ThreatFeedItemOut(
            id=f"ioc-{abs(hash(q)) % 100000}",
            ioc_type=ioc_type,
            ioc_value=q,
            threat_category=hit.get("threat_category", "Malicious Indicator"),
            confidence=hit.get("confidence", 90),
            source=hit.get("display_name", "RakshaSutra Threat Telemetry"),
            description=hit.get("evidence"),
            tags=hit.get("tags", []),
            first_seen=datetime.now(timezone.utc)
        ))

    if matches:
        summary = f"Identified {len(matches)} active threat records matching IOC '{q}'."
    else:
        summary = f"No active malicious reports or blacklist matches found for '{q}' in indexed repositories."

    return IOCSearchResponse(
        query=q,
        found=len(matches) > 0,
        ioc_type=ioc_type,
        matches=matches,
        risk_summary=summary,
        providers_checked=result.get("providers_checked", [])
    )

@router.get("/feed", response_model=List[ThreatFeedItemOut])
def get_live_threat_feed(limit: int = 20):
    """Retrieve latest active threat IOC signatures tracked by RakshaSutra."""
    feed = []
    for idx, (dom, meta) in enumerate(list(KNOWN_MALICIOUS_DOMAINS.items())[:limit]):
        feed.append(ThreatFeedItemOut(
            id=f"ioc-feed-{idx+1}",
            ioc_type="domain",
            ioc_value=dom,
            threat_category=meta.get("category", "PHISHING"),
            confidence=meta.get("confidence", 95),
            source=meta.get("source", "Verified Security Feeds"),
            description=meta.get("description", "High-confidence deceptive domain"),
            tags=meta.get("tags", ["verified-threat", "phishing"]),
            first_seen=datetime.now(timezone.utc)
        ))
    return feed
