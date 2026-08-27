"""
RakhshaSutra v3.0 — Universal Security Search Engine (Ctrl + K)
Provides instant global search across domains, IPs, URLs, hashes, CVEs, assets, incidents, alerts, and investigations.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_optional_current_user
from app.models.user import User
from app.models.asset import Asset
from app.models.vulnerability import Vulnerability
from app.models.alert_and_incident import SecurityAlert, SecurityIncident
from app.models.investigation import Investigation
from app.models.threat_intel import ThreatFeedItem

router = APIRouter(prefix="/search", tags=["Universal Security Search"])

@router.get("", response_model=Dict[str, Any])
def universal_security_search(
    q: str = Query(..., min_length=1, description="Search term across all security records"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Search across all security entities with intelligent categorizations and deep links.
    """
    query_str = q.strip()
    like_pattern = f"%{query_str}%"

    results = {
        "query": query_str,
        "total_matches": 0,
        "categories": {
            "assets": [],
            "vulnerabilities": [],
            "alerts": [],
            "incidents": [],
            "investigations": [],
            "threat_intel_iocs": []
        }
    }

    # 1. Search Assets
    assets = db.query(Asset).filter(
        (Asset.name.ilike(like_pattern)) |
        (Asset.ip_address.ilike(like_pattern))
    ).limit(8).all()
    for a in assets:
        results["categories"]["assets"].append({
            "id": a.id,
            "title": a.name,
            "subtitle": f"Asset ({a.asset_type.upper()}) • Risk: {a.risk_score} • {a.environment}",
            "type": "asset",
            "link_tab": "attack-surface",
            "entity_id": a.id,
            "badge": a.criticality
        })

    # 2. Search Vulnerabilities (CVE)
    vulns = db.query(Vulnerability).filter(
        (Vulnerability.id.ilike(like_pattern)) |
        (Vulnerability.title.ilike(like_pattern)) |
        (Vulnerability.affected_component.ilike(like_pattern))
    ).limit(8).all()
    for v in vulns:
        results["categories"]["vulnerabilities"].append({
            "id": v.id,
            "title": v.id,
            "subtitle": f"{v.title} • CVSS {v.cvss_score} ({v.severity})",
            "type": "vulnerability",
            "link_tab": "vulnerabilities",
            "entity_id": v.id,
            "badge": v.severity
        })

    # 3. Search Alerts
    alerts = db.query(SecurityAlert).filter(
        (SecurityAlert.title.ilike(like_pattern)) |
        (SecurityAlert.alert_type.ilike(like_pattern))
    ).limit(8).all()
    for al in alerts:
        results["categories"]["alerts"].append({
            "id": al.id,
            "title": al.title,
            "subtitle": f"Alert • {al.alert_type} • Status: {al.status}",
            "type": "alert",
            "link_tab": "alerts",
            "entity_id": al.id,
            "badge": al.severity
        })

    # 4. Search Incidents
    incidents = db.query(SecurityIncident).filter(
        (SecurityIncident.title.ilike(like_pattern)) |
        (SecurityIncident.classification.ilike(like_pattern))
    ).limit(8).all()
    for inc in incidents:
        results["categories"]["incidents"].append({
            "id": inc.id,
            "title": inc.title,
            "subtitle": f"Incident • {inc.classification} • Status: {inc.status}",
            "type": "incident",
            "link_tab": "incidents",
            "entity_id": inc.id,
            "badge": inc.severity
        })

    # 5. Search Investigations
    invs = db.query(Investigation).filter(
        (Investigation.target.ilike(like_pattern)) |
        (Investigation.id.ilike(like_pattern))
    ).limit(8).all()
    for inv in invs:
        results["categories"]["investigations"].append({
            "id": inv.id,
            "title": inv.target,
            "subtitle": f"Investigation {inv.id} • Verdict: {inv.risk_level} (Score {inv.risk_score})",
            "type": "investigation",
            "link_tab": "investigation-center",
            "entity_id": inv.id,
            "badge": inv.risk_level
        })

    # 6. Search Threat Intel IOCs
    iocs = db.query(ThreatFeedItem).filter(
        (ThreatFeedItem.ioc_value.ilike(like_pattern)) |
        (ThreatFeedItem.threat_category.ilike(like_pattern))
    ).limit(8).all()
    for ioc in iocs:
        results["categories"]["threat_intel_iocs"].append({
            "id": ioc.id,
            "title": ioc.ioc_value,
            "subtitle": f"IOC Signature • {ioc.threat_category} ({ioc.ioc_type}) • Conf: {ioc.confidence}%",
            "type": "ioc",
            "link_tab": "threat-intel",
            "entity_id": ioc.id,
            "badge": ioc.threat_category
        })

    total = sum(len(items) for items in results["categories"].values())
    results["total_matches"] = total

    return results
