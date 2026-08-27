"""
RakhshaSutra v3.0 — Vulnerability Intelligence Center API
Provides authoritative CVE search, CVSS/EPSS severity calculations, and asset vulnerability remediation tracking.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.vulnerability import Vulnerability, AssetVulnerability
from app.models.asset import Asset

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerability Intelligence Center"])

class CreateVulnerabilityRequest(BaseModel):
    id: str = Field(..., description="CVE ID (e.g. CVE-2024-3094)")
    title: str
    description: str
    cvss_score: float = 7.5
    severity: str = "HIGH"
    epss_score: float = 0.05
    affected_component: str
    affected_versions: str
    fixed_versions: Optional[str] = None
    exploit_available: bool = False
    remediation_guidance: Optional[str] = None
    references: List[str] = []

class MapAssetVulnerabilityRequest(BaseModel):
    asset_id: str
    cve_id: str
    detected_version: Optional[str] = None
    remediation_notes: Optional[str] = None

class UpdateVulnerabilityStatusRequest(BaseModel):
    status: str = Field(..., description="OPEN, INVESTIGATING, MITIGATED, RESOLVED, ACCEPTED_RISK")
    remediation_notes: Optional[str] = None

@router.get("", response_model=List[Dict[str, Any]])
def list_vulnerabilities(
    severity: Optional[str] = None,
    component: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Search and list known CVE vulnerabilities in the platform threat database."""
    query = db.query(Vulnerability)

    if severity:
        query = query.filter(Vulnerability.severity == severity.upper())
    if component:
        query = query.filter(Vulnerability.affected_component.ilike(f"%{component}%"))
    if search:
        query = query.filter(
            (Vulnerability.id.ilike(f"%{search}%")) |
            (Vulnerability.title.ilike(f"%{search}%")) |
            (Vulnerability.affected_component.ilike(f"%{search}%"))
        )

    vulns = query.order_by(Vulnerability.cvss_score.desc()).all()

    return [
        {
            "id": v.id,
            "title": v.title,
            "description": v.description,
            "cvss_score": v.cvss_score,
            "cvss_version": v.cvss_version,
            "severity": v.severity,
            "epss_score": v.epss_score,
            "affected_component": v.affected_component,
            "affected_versions": v.affected_versions,
            "fixed_versions": v.fixed_versions,
            "exploit_available": v.exploit_available,
            "cwe_id": v.cwe_id,
            "remediation_guidance": v.remediation_guidance,
            "references": v.references or [],
            "affected_assets_count": len(v.asset_mappings),
            "published_at": v.published_at.isoformat() if v.published_at else None
        }
        for v in vulns
    ]

@router.get("/{cve_id}")
def get_vulnerability_detail(
    cve_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve detailed technical specifications, exploitability metrics, and affected assets for a CVE."""
    vuln = db.query(Vulnerability).filter(Vulnerability.id == cve_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail=f"Vulnerability '{cve_id}' not found in registry.")

    return {
        "id": vuln.id,
        "title": vuln.title,
        "description": vuln.description,
        "cvss_score": vuln.cvss_score,
        "cvss_version": vuln.cvss_version,
        "severity": vuln.severity,
        "epss_score": vuln.epss_score,
        "affected_component": vuln.affected_component,
        "affected_versions": vuln.affected_versions,
        "fixed_versions": vuln.fixed_versions,
        "exploit_available": vuln.exploit_available,
        "cwe_id": vuln.cwe_id,
        "remediation_guidance": vuln.remediation_guidance,
        "references": vuln.references or [],
        "affected_assets": [
            {
                "asset_id": m.asset_id,
                "asset_name": m.asset.name if m.asset else "",
                "status": m.status,
                "detected_version": m.detected_version,
                "first_detected_at": m.first_detected_at.isoformat() if m.first_detected_at else None
            }
            for m in vuln.asset_mappings
        ]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_vulnerability(
    req: CreateVulnerabilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new authoritative CVE definition to the vulnerability intelligence registry."""
    existing = db.query(Vulnerability).filter(Vulnerability.id == req.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vulnerability ID already exists.")

    vuln = Vulnerability(
        id=req.id.strip().upper(),
        title=req.title,
        description=req.description,
        cvss_score=req.cvss_score,
        severity=req.severity.upper(),
        epss_score=req.epss_score,
        affected_component=req.affected_component,
        affected_versions=req.affected_versions,
        fixed_versions=req.fixed_versions,
        exploit_available=req.exploit_available,
        remediation_guidance=req.remediation_guidance,
        references=req.references
    )
    db.add(vuln)
    db.commit()
    db.refresh(vuln)
    return {"message": f"Vulnerability {vuln.id} added successfully.", "id": vuln.id}

@router.post("/map-asset")
def map_vulnerability_to_asset(
    req: MapAssetVulnerabilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Attach a detected CVE vulnerability finding to a registered asset."""
    asset = db.query(Asset).filter(Asset.id == req.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    vuln = db.query(Vulnerability).filter(Vulnerability.id == req.cve_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability CVE not found.")

    existing_map = db.query(AssetVulnerability).filter(
        AssetVulnerability.asset_id == req.asset_id,
        AssetVulnerability.cve_id == req.cve_id
    ).first()
    if existing_map:
        return {"message": "Vulnerability already mapped to asset.", "id": existing_map.id}

    mapping = AssetVulnerability(
        asset_id=req.asset_id,
        cve_id=req.cve_id,
        detected_version=req.detected_version,
        remediation_notes=req.remediation_notes,
        status="OPEN"
    )
    db.add(mapping)
    # Escalate asset risk score based on CVSS
    asset.risk_score = min(100, asset.risk_score + int(vuln.cvss_score * 3))
    asset.risk_level = "CRITICAL" if asset.risk_score >= 70 else ("HIGH" if asset.risk_score >= 50 else "MEDIUM")
    db.commit()

    return {"message": f"Vulnerability {vuln.id} mapped to asset {asset.name}.", "id": mapping.id}

@router.put("/asset-mappings/{mapping_id}/status")
def update_remediation_status(
    mapping_id: str,
    req: UpdateVulnerabilityStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update remediation status of an asset vulnerability (e.g. Mitigated, Resolved, Accepted Risk)."""
    mapping = db.query(AssetVulnerability).filter(AssetVulnerability.id == mapping_id).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Vulnerability mapping not found.")

    valid_statuses = ("OPEN", "INVESTIGATING", "MITIGATED", "RESOLVED", "ACCEPTED_RISK")
    if req.status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    mapping.status = req.status.upper()
    if req.remediation_notes:
        mapping.remediation_notes = req.remediation_notes
    if req.status.upper() in ("RESOLVED", "MITIGATED"):
        mapping.resolved_at = datetime.now(timezone.utc)
        # De-escalate asset risk
        if mapping.asset and mapping.vulnerability:
            mapping.asset.risk_score = max(10, mapping.asset.risk_score - int(mapping.vulnerability.cvss_score * 3))
    db.commit()

    return {"message": f"Remediation status updated to '{mapping.status}'.", "id": mapping.id}
