from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import json

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.investigation import (
    Investigation,
    EvidenceItem,
    InvestigationEvent,
    UserFeedback,
    generate_investigation_id
)
from app.services.entitlement_service import EntitlementService
from app.scanners.investigation_pipeline import InvestigationPipeline

router = APIRouter(prefix="/investigations", tags=["Threat Investigation Center"])

@router.post("/create")
async def create_investigation(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Start a new evidence-driven investigation on a URL, domain, IP, or message.
    Generates a unique Investigation ID (e.g. RS-INV-2026-XXXXXX) with
    full evidence provenance, timeline trace, and dual-mode metrics.
    """
    target = payload.get("target", "").strip()
    if not target:
        raise HTTPException(status_code=400, detail="Target is required for investigation.")

    # 1. Enforce quota if user is authenticated or guest
    if current_user:
        EntitlementService.enforce_scan_quota(current_user, db)

    # 2. Run multi-vector investigation pipeline
    result = await InvestigationPipeline.run_investigation(
        raw_target=target,
        user_id=current_user.id if current_user else None
    )

    # 3. Persist Investigation record
    inv_id = generate_investigation_id()
    inv_record = Investigation(
        id=inv_id,
        user_id=current_user.id if current_user else None,
        target=result["target"],
        target_type=result["target_type"],
        normalized_target=result["normalized_target"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        confidence_score=result["confidence_score"],
        confidence_level=result["confidence_level"],
        verdict_summary=result["verdict_summary"],
        plain_explanation=result["plain_explanation"],
        recommendations=result["recommendations"],
        engine_version=result["engine_version"],
        ruleset_version=result["ruleset_version"],
        status="COMPLETED",
        evidence_sources_checked=result["evidence_sources_checked"],
        scoring_breakdown=result["scoring_breakdown"],
        raw_telemetry=result["raw_telemetry"]
    )
    db.add(inv_record)
    db.flush()

    # 4. Persist atomic Evidence items
    for item in result.get("findings", []):
        ev = EvidenceItem(
            investigation_id=inv_id,
            category=item.get("category", "General"),
            title=item.get("title", "Evidence Finding"),
            severity=item.get("severity", "LOW"),
            score_impact=item.get("score_impact", 0),
            provenance=item.get("provenance", "DIRECT_OBSERVATION"),
            source_name=item.get("source_name", "Investigation Pipeline"),
            rule_id=item.get("rule_id"),
            evidence_text=item.get("evidence", ""),
            explanation=item.get("explanation", ""),
            raw_data=item
        )
        db.add(ev)

    # 5. Persist Timeline events
    for evt in result.get("timeline", []):
        t_evt = InvestigationEvent(
            investigation_id=inv_id,
            step_name=evt.get("step_name", "STEP"),
            description=evt.get("description", ""),
            status=evt.get("status", "SUCCESS"),
            duration_ms=evt.get("duration_ms", 0.0)
        )
        db.add(t_evt)

    db.commit()

    return {
        "investigation_id": inv_id,
        **result
    }

@router.get("/{investigation_id}")
async def get_investigation_dossier(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    """Retrieve full investigation dossier with evidence, timeline, and relationship graph."""
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation ID not found.")

    evidence = db.query(EvidenceItem).filter(EvidenceItem.investigation_id == investigation_id).all()
    timeline = db.query(InvestigationEvent).filter(InvestigationEvent.investigation_id == investigation_id).all()

    # Reconstruct relationship graph from telemetry
    raw_tel = inv.raw_telemetry or {}
    dns_info = raw_tel.get("dns", {})
    tls_info = raw_tel.get("tls", {})
    intel_info = raw_tel.get("threat_intel", {})

    graph_nodes = [
        {"id": "target", "label": inv.normalized_target or inv.target, "type": "root_target", "risk_level": inv.risk_level}
    ]
    graph_links = []

    if dns_info.get("primary_ip"):
        ip_id = f"ip_{dns_info['primary_ip']}"
        graph_nodes.append({"id": ip_id, "label": dns_info["primary_ip"], "type": "ip_address"})
        graph_links.append({"source": "target", "target": ip_id, "relation": "resolves_to"})

    if tls_info.get("issuer"):
        issuer_id = f"issuer_{tls_info['issuer']}"
        graph_nodes.append({"id": issuer_id, "label": tls_info["issuer"], "type": "tls_issuer"})
        graph_links.append({"source": "target", "target": issuer_id, "relation": "certified_by"})

    for hit in intel_info.get("hits", []):
        hit_id = f"intel_{hit.get('provider_name')}"
        graph_nodes.append({"id": hit_id, "label": hit.get("display_name"), "type": "threat_intel_hit", "risk_level": "DANGER"})
        graph_links.append({"source": "target", "target": hit_id, "relation": "flagged_by"})

    return {
        "investigation_id": inv.id,
        "target": inv.target,
        "target_type": inv.target_type,
        "normalized_target": inv.normalized_target,
        "risk_score": inv.risk_score,
        "risk_level": inv.risk_level,
        "confidence_score": inv.confidence_score,
        "confidence_level": inv.confidence_level,
        "verdict_summary": inv.verdict_summary,
        "plain_explanation": inv.plain_explanation,
        "recommendations": inv.recommendations or [],
        "engine_version": inv.engine_version,
        "ruleset_version": inv.ruleset_version,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
        "evidence_sources_checked": inv.evidence_sources_checked or [],
        "scoring_breakdown": inv.scoring_breakdown or {},
        "raw_telemetry": inv.raw_telemetry or {},
        "findings": [
            {
                "id": e.id,
                "category": e.category,
                "title": e.title,
                "severity": e.severity,
                "score_impact": e.score_impact,
                "provenance": e.provenance,
                "source_name": e.source_name,
                "rule_id": e.rule_id,
                "evidence": e.evidence_text,
                "explanation": e.explanation
            }
            for e in evidence
        ],
        "timeline": [
            {
                "id": t.id,
                "step_name": t.step_name,
                "description": t.description,
                "status": t.status,
                "duration_ms": t.duration_ms,
                "timestamp": t.timestamp.isoformat() if t.timestamp else None
            }
            for t in timeline
        ],
        "relationship_graph": {
            "nodes": graph_nodes,
            "links": graph_links
        }
    }

@router.get("/{investigation_id}/dossier/json")
async def export_dossier_json(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    """Export sanitized, structured JSON threat intelligence dossier."""
    dossier = await get_investigation_dossier(investigation_id, db)
    return Response(
        content=json.dumps(dossier, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={investigation_id}_dossier.json"}
    )

@router.post("/{investigation_id}/feedback")
async def submit_investigation_feedback(
    investigation_id: str,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Capture user feedback on investigation accuracy for future rule validation."""
    rating = payload.get("rating", "CORRECT").upper()
    comments = payload.get("comments", "")
    
    fb = UserFeedback(
        investigation_id=investigation_id,
        user_id=current_user.id if current_user else None,
        rating=rating,
        comments=comments
    )
    db.add(fb)
    db.commit()
    
    return {"status": "SUCCESS", "message": "Feedback recorded. Thank you for contributing to threat intelligence accuracy."}

@router.get("")
async def list_recent_investigations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List recent investigations with pagination and optional risk level filter."""
    query = db.query(Investigation)
    if current_user:
        query = query.filter(Investigation.user_id == current_user.id)
    if risk_level:
        query = query.filter(Investigation.risk_level == risk_level.upper())
        
    total = query.count()
    items = query.order_by(Investigation.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "investigations": [
            {
                "investigation_id": inv.id,
                "target": inv.target,
                "target_type": inv.target_type,
                "risk_score": inv.risk_score,
                "risk_level": inv.risk_level,
                "confidence_score": inv.confidence_score,
                "verdict_summary": inv.verdict_summary,
                "created_at": inv.created_at.isoformat() if inv.created_at else None
            }
            for inv in items
        ]
    }
