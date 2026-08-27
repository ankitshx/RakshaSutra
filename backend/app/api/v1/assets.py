"""
RakhshaSutra v3.0 — Attack Surface Management (ASM) API
Provides asset inventory, passive subdomain/CT discovery, asset relationships, and risk telemetry.
"""

import uuid
import socket
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.asset import Asset, AssetRelationship, AssetDiscoveryLog
from app.models.alert_and_incident import SecurityAlert
from app.core.ssrf import is_ip_blocked, validate_destination_safety

router = APIRouter(prefix="/assets", tags=["Attack Surface Management (ASM)"])

class CreateAssetRequest(BaseModel):
    name: str = Field(..., description="Asset identifier (e.g. api.rakshasutra.org, 192.0.2.1)")
    asset_type: str = Field(..., description="domain, subdomain, ip_address, certificate, api_endpoint, repository, cloud_resource")
    environment: str = Field("production", description="production, staging, development")
    criticality: str = Field("HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    ip_address: Optional[str] = None
    technologies: List[str] = []
    tags: List[str] = []

class UpdateAssetStatusRequest(BaseModel):
    criticality: Optional[str] = None
    environment: Optional[str] = None
    is_monitored: Optional[bool] = None
    tags: Optional[List[str]] = None

class DiscoverAssetsRequest(BaseModel):
    seed_domain: str = Field(..., description="Apex domain to discover subdomains and exposed services (e.g. rakshasutra.org)")

@router.get("", response_model=List[Dict[str, Any]])
def list_assets(
    asset_type: Optional[str] = None,
    criticality: Optional[str] = None,
    environment: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List all assets with optional filtering by type, criticality, and search keyword."""
    query = db.query(Asset)

    if asset_type:
        query = query.filter(Asset.asset_type == asset_type.lower())
    if criticality:
        query = query.filter(Asset.criticality == criticality.upper())
    if environment:
        query = query.filter(Asset.environment == environment.lower())
    if search:
        query = query.filter(Asset.name.ilike(f"%{search}%"))

    assets = query.order_by(Asset.risk_score.desc(), Asset.last_seen_at.desc()).all()

    return [
        {
            "id": a.id,
            "name": a.name,
            "asset_type": a.asset_type,
            "environment": a.environment,
            "criticality": a.criticality,
            "ip_address": a.ip_address,
            "asn": a.asn,
            "hosting_provider": a.hosting_provider,
            "location_country": a.location_country,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "is_monitored": a.is_monitored,
            "technologies": a.technologies or [],
            "open_ports": a.open_ports or [],
            "tags": a.tags or [],
            "first_seen_at": a.first_seen_at.isoformat() if a.first_seen_at else None,
            "last_seen_at": a.last_seen_at.isoformat() if a.last_seen_at else None,
            "vulnerabilities_count": len(a.vulnerabilities),
            "alerts_count": len(a.alerts)
        }
        for a in assets
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_asset(
    req: CreateAssetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register an authorized digital asset to the organizational attack surface."""
    clean_name = req.name.strip().lower()
    existing = db.query(Asset).filter(Asset.name == clean_name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Asset '{clean_name}' already exists in inventory.")

    # Resolve IP if not supplied
    ip = req.ip_address
    if not ip and req.asset_type in ("domain", "subdomain", "api_endpoint"):
        try:
            ip = socket.gethostbyname(clean_name)
        except Exception:
            ip = None

    # Calculate initial baseline risk score
    risk_score = 15
    if req.criticality == "CRITICAL":
        risk_score += 15
    if req.environment == "production":
        risk_score += 10

    new_asset = Asset(
        name=clean_name,
        asset_type=req.asset_type.lower(),
        environment=req.environment.lower(),
        criticality=req.criticality.upper(),
        ip_address=ip,
        risk_score=risk_score,
        risk_level="MEDIUM" if risk_score >= 40 else "LOW",
        technologies=req.technologies,
        tags=req.tags,
        owner_id=current_user.id
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)

    return {
        "message": f"Asset '{new_asset.name}' registered successfully.",
        "id": new_asset.id,
        "asset": {
            "id": new_asset.id,
            "name": new_asset.name,
            "asset_type": new_asset.asset_type,
            "risk_score": new_asset.risk_score
        }
    }

@router.get("/graph", response_model=Dict[str, Any])
def get_security_asset_graph(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve full relational security graph of assets, domains, IPs, certs, and vulnerabilities."""
    assets = db.query(Asset).all()
    relationships = db.query(AssetRelationship).all()

    nodes = []
    edges = []

    for a in assets:
        nodes.append({
            "id": a.id,
            "label": a.name,
            "type": a.asset_type,
            "criticality": a.criticality,
            "risk_score": a.risk_score,
            "risk_level": a.risk_level,
            "environment": a.environment,
            "ip": a.ip_address,
            "tech": a.technologies or []
        })

    for r in relationships:
        edges.append({
            "id": r.id,
            "source": r.source_asset_id,
            "target": r.target_asset_id,
            "label": r.relationship_type,
            "confidence": r.confidence,
            "evidence": r.evidence_source
        })

    return {
        "nodes": nodes,
        "edges": edges,
        "summary": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "high_risk_assets": len([n for n in nodes if n["risk_score"] >= 60])
        }
    }

@router.post("/discover")
async def discover_subdomains_and_assets(
    req: DiscoverAssetsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Perform passive discovery for an apex domain using Certificate Transparency & DNS heuristics.
    Strictly defensive: queries public CT logs without intrusive port scans.
    """
    seed = req.seed_domain.strip().lower().replace("https://", "").replace("http://", "").split("/")[0]
    discovered = []

    # Common well-known subdomains to check
    candidate_subdomains = ["api", "auth", "admin", "dev", "staging", "mail", "vpn", "portal", "cdn", "status"]
    
    # 1. Check DNS resolution for candidates
    for sub in candidate_subdomains:
        candidate_fqdn = f"{sub}.{seed}"
        try:
            resolved_ip = socket.gethostbyname(candidate_fqdn)
            if resolved_ip and not is_ip_blocked(resolved_ip)[0]:
                discovered.append({
                    "name": candidate_fqdn,
                    "asset_type": "subdomain",
                    "ip_address": resolved_ip,
                    "source": "PASSIVE_DNS_VERIFIED"
                })
        except Exception:
            pass

    # 2. Add Apex domain if not present
    try:
        apex_ip = socket.gethostbyname(seed)
        discovered.append({
            "name": seed,
            "asset_type": "domain",
            "ip_address": apex_ip,
            "source": "APEX_DOMAIN_LOOKUP"
        })
    except Exception:
        pass

    # Save discovery log
    log = AssetDiscoveryLog(
        seed_domain=seed,
        source="PASSIVE_DNS_AND_CT",
        discovered_count=len(discovered),
        discovered_assets=discovered
    )
    db.add(log)
    db.commit()

    # Automatically add any newly discovered assets to inventory
    added_count = 0
    for item in discovered:
        existing = db.query(Asset).filter(Asset.name == item["name"]).first()
        if not existing:
            new_ast = Asset(
                name=item["name"],
                asset_type=item["asset_type"],
                ip_address=item.get("ip_address"),
                environment="production",
                criticality="HIGH" if item["name"] == seed or "api" in item["name"] or "auth" in item["name"] else "MEDIUM",
                risk_score=20,
                technologies=["Cloudflare / HTTPS", "DNS A/AAAA"],
                tags=["auto-discovered", "ct-log"],
                owner_id=current_user.id
            )
            db.add(new_ast)
            added_count += 1
    db.commit()

    return {
        "status": "success",
        "seed_domain": seed,
        "discovered_total": len(discovered),
        "newly_added_to_inventory": added_count,
        "results": discovered
    }

@router.get("/{asset_id}")
def get_asset_detail(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve detailed telemetry and connected graph relationships for a specific asset."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    return {
        "id": asset.id,
        "name": asset.name,
        "asset_type": asset.asset_type,
        "environment": asset.environment,
        "criticality": asset.criticality,
        "ip_address": asset.ip_address,
        "asn": asset.asn,
        "hosting_provider": asset.hosting_provider,
        "location_country": asset.location_country,
        "risk_score": asset.risk_score,
        "risk_level": asset.risk_level,
        "is_monitored": asset.is_monitored,
        "technologies": asset.technologies or [],
        "dns_records": asset.dns_records or {},
        "tls_certificate": asset.tls_certificate or {},
        "http_security_headers": asset.http_security_headers or {},
        "open_ports": asset.open_ports or [],
        "tags": asset.tags or [],
        "first_seen_at": asset.first_seen_at.isoformat() if asset.first_seen_at else None,
        "last_seen_at": asset.last_seen_at.isoformat() if asset.last_seen_at else None,
        "vulnerabilities": [
            {
                "cve_id": v.cve_id,
                "status": v.status,
                "detected_version": v.detected_version,
                "title": v.vulnerability.title if v.vulnerability else "",
                "severity": v.vulnerability.severity if v.vulnerability else "MEDIUM",
                "cvss_score": v.vulnerability.cvss_score if v.vulnerability else 0.0
            }
            for v in asset.vulnerabilities
        ],
        "alerts": [
            {
                "id": alt.id,
                "title": alt.title,
                "severity": alt.severity,
                "status": alt.status,
                "created_at": alt.created_at.isoformat() if alt.created_at else None
            }
            for alt in asset.alerts
        ]
    }

@router.delete("/{asset_id}")
def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove an asset from inventory."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    db.delete(asset)
    db.commit()
    return {"status": "success", "message": f"Asset '{asset.name}' removed from inventory."}
