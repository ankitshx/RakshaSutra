import time
import hashlib
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.logging import generate_request_id, logger
from app.core.ssrf import SSRFSecurityException
from app.models.user import User
from app.models.scan import Scan, ThreatIndicator
from app.models.security_event import SecurityEvent
from app.schemas.scan import UrlScanRequest, ScanResponse, ScanHistoryItem, ThreatIndicatorOut, TechnicalDetailsOut
from app.scanners.url_scanner import inspect_url_comprehensive
from app.threat_intel.registry import threat_intel_registry
from app.scanners.risk_engine import synthesize_risk_report
from app.api.v1.auth import get_current_user_optional, get_current_user, enforce_api_quota

router = APIRouter(prefix="/scans", tags=["URL Scanner & Reports"])

@router.post("/url", response_model=ScanResponse)
async def scan_url(
    req: UrlScanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Execute comprehensive multi-vector URL threat analysis with SSRF safety,
    brand impersonation heuristics, TLD evaluation, and threat intel feeds.
    """
    # Enforce API rate limits and quota bounds
    enforce_api_quota(current_user, db)

    start_time = time.time()
    req_id = generate_request_id()

    try:
        # 1. Comprehensive Local & Network Inspection (SSRF-protected)
        inspection = await inspect_url_comprehensive(req.url)
    except SSRFSecurityException as ssrf_err:
        # Log security audit event for SSRF block
        sec_event = SecurityEvent(
            event_type="SSRF_ATTEMPT",
            severity="HIGH",
            request_path="/api/v1/scans/url",
            request_id=req_id,
            details={"target_url": req.url, "error": str(ssrf_err)}
        )
        db.add(sec_event)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": f"Target blocked by SSRF Security Policy: {str(ssrf_err)}",
                "request_id": req_id
            }
        )
    except Exception as e:
        logger.error(f"Scan execution failure on {req.url}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Unable to complete URL analysis. Please check URL syntax.",
                "request_id": req_id
            }
        )

    # 2. Threat Intelligence Provider Lookups (Parallel query)
    domain_to_check = inspection["registered_domain"]
    target_ip = inspection["resolved_ips"][0] if inspection["resolved_ips"] else ""

    threat_intel_result = await threat_intel_registry.query_all(domain_to_check, "domain")
    if target_ip and not threat_intel_result["has_threat_intel_hit"]:
        ip_intel = await threat_intel_registry.query_all(target_ip, "ip")
        if ip_intel["has_threat_intel_hit"]:
            threat_intel_result = ip_intel

    # 3. Explainable Risk Decision Synthesis
    risk_report = synthesize_risk_report(
        target=inspection["normalized_url"],
        structure_score=inspection["structure_score"],
        domain_score=inspection["domain_score"],
        impersonation_score=inspection["impersonation_score"],
        threat_intel_result=threat_intel_result,
        redirect_score=inspection["redirect_score"],
        indicators=inspection["findings"],
        impersonation_info=inspection["impersonation_info"]
    )

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    target_hash = hashlib.sha256(inspection["normalized_url"].encode()).hexdigest()

    # 4. Persist Scan Record
    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="url",
        target=inspection["normalized_url"],
        target_display=inspection["hostname"] or inspection["normalized_url"],
        target_hash=target_hash,
        risk_score=risk_report["risk_score"],
        risk_level=risk_report["risk_level"],
        summary=risk_report["summary"],
        recommendation=risk_report["recommendation"],
        execution_time_ms=elapsed_ms,
        indicators_count=len(risk_report["indicators"]),
        raw_results={
            "normalized_url": inspection["normalized_url"],
            "domain": inspection["registered_domain"],
            "subdomain": inspection["subdomain"],
            "tld": inspection["tld"],
            "ip_addresses": inspection["resolved_ips"],
            "redirect_chain": inspection["redirect_chain"],
            "https_enabled": inspection["normalized_url"].startswith("https://"),
            "status_code": inspection["status_code"],
            "brand_impersonated": inspection["impersonation_info"].get("target_brand"),
            "levenshtein_distance": inspection["impersonation_info"].get("distance"),
            "tld_reputation_tier": inspection["tld_tier"],
            "threat_intel_hits": risk_report["threat_intel_hits"],
            "dns_records": inspection["dns_records"]
        }
    )
    db.add(scan)
    db.flush()

    for ind in risk_report["indicators"]:
        indicator_model = ThreatIndicator(
            scan_id=scan.id,
            category=ind["category"],
            severity=ind["severity"],
            title=ind["title"],
            evidence=ind["evidence"],
            explanation=ind["explanation"],
            score_impact=ind.get("score_impact", 0)
        )
        db.add(indicator_model)

    db.commit()
    db.refresh(scan)

    technical = TechnicalDetailsOut(
        normalized_url=inspection["normalized_url"],
        domain=inspection["registered_domain"],
        subdomain=inspection["subdomain"],
        tld=inspection["tld"],
        ip_addresses=inspection["resolved_ips"],
        redirect_chain=inspection["redirect_chain"],
        https_enabled=inspection["normalized_url"].startswith("https://"),
        status_code=inspection["status_code"],
        brand_impersonated=inspection["impersonation_info"].get("target_brand"),
        levenshtein_distance=inspection["impersonation_info"].get("distance"),
        tld_reputation_tier=inspection["tld_tier"],
        threat_intel_hits=risk_report["threat_intel_hits"],
        dns_records=inspection["dns_records"],
        rdap_info={"status": "Active", "tld": inspection["tld"]}
    )

    indicators_out = [
        ThreatIndicatorOut(
            category=i["category"],
            severity=i["severity"],
            title=i["title"],
            evidence=i["evidence"],
            explanation=i["explanation"],
            score_impact=i.get("score_impact", 0)
        ) for i in risk_report["indicators"]
    ]

    return ScanResponse(
        scan_id=scan.id,
        scan_type="url",
        target=scan.target,
        target_display=scan.target_display or scan.target,
        risk_score=scan.risk_score,
        risk_level=scan.risk_level,
        summary=scan.summary,
        recommendation=scan.recommendation,
        indicators=indicators_out,
        technical_details=technical,
        execution_time_ms=elapsed_ms,
        request_id=req_id,
        created_at=scan.created_at
    )

@router.get("", response_model=List[ScanHistoryItem])
def get_scan_history(
    skip: int = 0,
    limit: int = 50,
    scan_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve authenticated user scan history."""
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    if scan_type:
        query = query.filter(Scan.scan_type == scan_type)
    if risk_level:
        query = query.filter(Scan.risk_level == risk_level.upper())
    
    scans = query.order_by(Scan.created_at.desc()).offset(skip).limit(limit).all()
    return scans

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(
    scan_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieve full detailed security report for a specific scan ID."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Security report not found."
        )

    # Privacy check: If scan is associated with a user, ensure ownership or admin role
    if scan.user_id and current_user and current_user.role != "admin" and scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this report."
        )

    raw = scan.raw_results or {}
    technical = TechnicalDetailsOut(
        normalized_url=raw.get("normalized_url", scan.target),
        domain=raw.get("domain", scan.target_display or ""),
        subdomain=raw.get("subdomain"),
        tld=raw.get("tld", ""),
        ip_addresses=raw.get("ip_addresses", []),
        redirect_chain=raw.get("redirect_chain", []),
        https_enabled=raw.get("https_enabled", True),
        status_code=raw.get("status_code"),
        brand_impersonated=raw.get("brand_impersonated"),
        levenshtein_distance=raw.get("levenshtein_distance"),
        tld_reputation_tier=raw.get("tld_reputation_tier", "Standard"),
        threat_intel_hits=raw.get("threat_intel_hits", []),
        dns_records=raw.get("dns_records", {}),
        rdap_info=raw.get("rdap_info", {})
    )

    indicators_out = [
        ThreatIndicatorOut(
            category=ind.category,
            severity=ind.severity,
            title=ind.title,
            evidence=ind.evidence,
            explanation=ind.explanation,
            score_impact=ind.score_impact
        ) for ind in scan.indicators
    ]

    return ScanResponse(
        scan_id=scan.id,
        scan_type=scan.scan_type,
        target=scan.target,
        target_display=scan.target_display or scan.target,
        risk_score=scan.risk_score,
        risk_level=scan.risk_level,
        summary=scan.summary or "",
        recommendation=scan.recommendation or "",
        indicators=indicators_out,
        technical_details=technical,
        execution_time_ms=scan.execution_time_ms or 0.0,
        request_id=f"RS-{scan.id[:8].upper()}",
        created_at=scan.created_at
    )

@router.delete("/{scan_id}", status_code=status.HTTP_200_OK)
def delete_scan_record(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a scan report from user history."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found."
        )

    if scan.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to delete this record."
        )

    db.delete(scan)
    db.commit()
    return {"message": "Scan report permanently removed from history.", "scan_id": scan_id}
