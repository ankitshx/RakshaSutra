from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.threat_intel.registry import threat_intel_registry
from app.threat_intel.local_db import KNOWN_MALICIOUS_DOMAINS
from app.schemas.threat_intel import ProviderStatusOut, IOCSearchRequest, IOCSearchResponse, ThreatFeedItemOut
from datetime import datetime

router = APIRouter(prefix="/threat-intelligence", tags=["Threat Intelligence Center"])

@router.get("/providers", response_model=List[ProviderStatusOut])
def get_providers():
    """Retrieve status, latency, and query metrics of all threat intelligence providers."""
    return threat_intel_registry.get_all_provider_statuses()

@router.post("/search", response_model=IOCSearchResponse)
async def search_ioc(req: IOCSearchRequest):
    """
    Search global threat telemetry and blacklists for a domain, IP, or URL IOC.
    """
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
            description=hit.get("details"),
            tags=hit.get("tags", []),
            first_seen=datetime.utcnow()
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
            id=f"feed-{idx+1}",
            ioc_type="domain",
            ioc_value=dom,
            threat_category=meta["category"],
            confidence=meta["confidence"],
            source="RakshaSutra Global Telemetry",
            description=meta["desc"],
            tags=["Active Threat", meta["category"]],
            first_seen=datetime.utcnow()
        ))
    return feed
