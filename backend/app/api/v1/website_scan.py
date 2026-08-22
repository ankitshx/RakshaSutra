import time
import hashlib
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.logging import generate_request_id, logger
from app.core.ssrf import SSRFSecurityException
from app.models.user import User
from app.models.scan import Scan, ThreatIndicator
from app.schemas.website import WebsiteScanRequest, WebsiteScanResponse, SecurityHeaderAudit, TLSDetails
from app.schemas.scan import ThreatIndicatorOut
from app.scanners.website_analyzer import inspect_website_security
from app.api.v1.auth import get_current_user_optional, enforce_api_quota

router = APIRouter(prefix="/scans", tags=["Website Security Analyzer"])

@router.post("/website", response_model=WebsiteScanResponse)
async def scan_website_security(
    req: WebsiteScanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Perform non-intrusive public inspection of website TLS certificate,
    HTTP security headers (CSP, HSTS, X-Frame-Options), and cookie posture.
    """
    enforce_api_quota(current_user, db)
    start_time = time.time()
    req_id = generate_request_id()

    try:
        result = await inspect_website_security(req.url)
    except SSRFSecurityException as ssrf_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": f"Website target blocked by SSRF Policy: {str(ssrf_err)}", "request_id": req_id}
        )
    except Exception as e:
        logger.error(f"Website analysis failure on {req.url}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Unable to inspect website properties.", "request_id": req_id}
        )

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    target_hash = hashlib.sha256(result["target_url"].encode()).hexdigest()

    # Persist Scan Record
    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="website",
        target=result["target_url"],
        target_display=result["target_url"].replace("https://", "").replace("http://", "").split("/")[0],
        target_hash=target_hash,
        risk_score=100 - result["hygiene_score"],  # Risk is inverse of hygiene
        risk_level=result["risk_level"],
        summary=result["summary"],
        recommendation=result["recommendation"],
        execution_time_ms=elapsed_ms,
        indicators_count=len(result["indicators"]),
        raw_results={
            "hygiene_score": result["hygiene_score"],
            "hygiene_rating": result["hygiene_rating"],
            "tls_details": result["tls_details"],
            "headers_audit": result["headers_audit"],
            "cookie_security": result["cookie_security"]
        }
    )
    db.add(scan)
    db.flush()

    for ind in result["indicators"]:
        ind_model = ThreatIndicator(
            scan_id=scan.id,
            category=ind["category"],
            severity=ind["severity"],
            title=ind["title"],
            evidence=ind["evidence"],
            explanation=ind["explanation"],
            score_impact=ind.get("score_impact", 0)
        )
        db.add(ind_model)

    db.commit()
    db.refresh(scan)

    headers_out = [
        SecurityHeaderAudit(
            name=h["name"],
            present=h["present"],
            value=h["value"],
            rating=h["rating"],
            importance=h["importance"],
            recommendation=h["recommendation"]
        ) for h in result["headers_audit"]
    ]

    indicators_out = [
        ThreatIndicatorOut(
            category=i["category"],
            severity=i["severity"],
            title=i["title"],
            evidence=i["evidence"],
            explanation=i["explanation"],
            score_impact=i.get("score_impact", 0)
        ) for i in result["indicators"]
    ]

    tls_out = TLSDetails(
        enabled=result["tls_details"]["enabled"],
        version=result["tls_details"].get("version"),
        issuer=result["tls_details"].get("issuer"),
        valid_until=result["tls_details"].get("valid_until"),
        days_remaining=result["tls_details"].get("days_remaining"),
        hsts_active=result["tls_details"].get("hsts_active", False)
    )

    return WebsiteScanResponse(
        scan_id=scan.id,
        target_url=result["target_url"],
        final_url=result["final_url"],
        status_code=result["status_code"],
        hygiene_score=result["hygiene_score"],
        hygiene_rating=result["hygiene_rating"],
        risk_level=result["risk_level"],
        summary=result["summary"],
        recommendation=result["recommendation"],
        tls_details=tls_out,
        headers_audit=headers_out,
        cookie_security=result["cookie_security"],
        indicators=indicators_out,
        execution_time_ms=elapsed_ms,
        request_id=req_id,
        created_at=scan.created_at
    )
