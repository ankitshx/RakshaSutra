import time
import hashlib
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.logging import generate_request_id, logger
from app.models.user import User
from app.models.scan import Scan, ThreatIndicator
from app.schemas.message import MessageScanRequest, MessageScanResponse, DetectedTechnique
from app.schemas.scan import ThreatIndicatorOut
from app.scanners.message_analyzer import analyze_message_content
from app.api.v1.auth import get_current_user_optional

router = APIRouter(prefix="/scans", tags=["Message & Phishing Analyzer"])

@router.post("/message", response_model=MessageScanResponse)
async def scan_message(
    req: MessageScanRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Analyze SMS, Email, WhatsApp, Telegram, or social media text for
    urgency tactics, OTP/credential harvesting, financial/UPI bait, and embedded URLs.
    """
    start_time = time.time()
    req_id = generate_request_id()

    try:
        result = await analyze_message_content(
            content=req.content,
            channel=req.channel,
            sender=req.sender
        )
    except Exception as e:
        logger.error(f"Error analyzing message content: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Failed to analyze message content.", "request_id": req_id}
        )

    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    display_snippet = req.content[:80] + "..." if len(req.content) > 80 else req.content
    content_hash = hashlib.sha256(req.content.encode()).hexdigest()

    # Privacy-conscious persistence (We store summary/hash, not raw credentials)
    scan = Scan(
        user_id=current_user.id if current_user else None,
        scan_type="message",
        target=display_snippet,
        target_display=f"[{req.channel.upper()}] {display_snippet[:50]}",
        target_hash=content_hash,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        summary=result["summary"],
        recommendation=result["recommendation"],
        execution_time_ms=elapsed_ms,
        indicators_count=len(result["indicators"]),
        raw_results={
            "channel": req.channel,
            "sender": req.sender,
            "detected_techniques": result["detected_techniques"],
            "extracted_urls": result["extracted_urls"],
            "embedded_url_analyses": result["embedded_url_analyses"]
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

    techniques_out = [
        DetectedTechnique(
            category=t["category"],
            name=t["name"],
            confidence=t["confidence"],
            matched_phrase=t["matched_phrase"],
            description=t["description"]
        ) for t in result["detected_techniques"]
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

    return MessageScanResponse(
        scan_id=scan.id,
        channel=req.channel,
        sender=req.sender,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        summary=result["summary"],
        recommendation=result["recommendation"],
        detected_techniques=techniques_out,
        indicators=indicators_out,
        extracted_urls=result["extracted_urls"],
        embedded_url_analyses=result["embedded_url_analyses"],
        execution_time_ms=elapsed_ms,
        request_id=req_id,
        created_at=scan.created_at
    )
