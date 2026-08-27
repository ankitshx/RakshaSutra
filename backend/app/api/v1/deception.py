"""
RakshaSutra Enterprise Honeytoken & Active Deception Engine
Enterprise-Only Feature: Generates decoy canary tokens (AWS, DB, Web, Canary PDFs)
with silent telemetry capture for intrusion tripwires.
"""

import uuid
import secrets
from datetime import datetime, timezone
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.audit_log import AuditLog
from app.services.entitlement_service import EntitlementService

router = APIRouter(prefix="/deception", tags=["Enterprise Honeytokens & Deception"])

class HoneytokenCreateRequest(BaseModel):
    token_type: str = Field("web_canary", description="'web_canary', 'decoy_aws_key', 'fake_db_credential', or 'canary_document'")
    memo: str = Field(..., max_length=150, description="Where this trap is placed (e.g. 'Production .env file', 'Fake CEO Desktop folder')")
    alert_email: Optional[str] = None

class IntrusionAlert(BaseModel):
    id: str
    token_id: str
    token_type: str
    memo: str
    intruder_ip: str
    intruder_user_agent: str
    intruder_referer: Optional[str]
    geo_location: str
    triggered_at: str
    severity: str

class HoneytokenOut(BaseModel):
    id: str
    token_type: str
    memo: str
    canary_url: str
    decoy_payload: Dict[str, str]
    created_at: str
    is_tripped: bool
    trip_count: int
    last_tripped_at: Optional[str] = None
    last_intruder_ip: Optional[str] = None
    intrusions: List[IntrusionAlert] = []

# In-Memory Deception Store
ACTIVE_HONEYTOKENS: Dict[str, dict] = {}
INTRUSION_LOGS: List[dict] = []

def require_enterprise_entitlement(current_user: User = Depends(get_current_user)):
    """Enforce Enterprise-tier entitlement for Honeytokens."""
    if not settings.FEATURE_ENTERPRISE_HONEYTOKENS:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enterprise Honeytoken feature is currently disabled.")
    if not EntitlementService.can_use_honeytokens(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Honeytokens and Active Deception are available exclusively on the Enterprise tier. Upgrade to access."
        )
    return current_user

@router.post("/tokens/create", response_model=HoneytokenOut)
def create_honeytoken(
    request: HoneytokenCreateRequest,
    req: Request,
    user: User = Depends(require_enterprise_entitlement),
    db: Session = Depends(get_db)
):
    """
    Generate an Enterprise Honeytoken / Canary Trap.
    """
    token_id = str(uuid.uuid4())[:12]
    host = req.headers.get("host", "127.0.0.1:8000")
    scheme = "https" if "https" in req.headers.get("x-forwarded-proto", "") else "http"
    canary_url = f"{scheme}://{host}/api/v1/deception/ping/{token_id}"

    # Generate synthetic decoy payloads
    if request.token_type == "decoy_aws_key":
        decoy = {
            "AWS_ACCESS_KEY_ID": f"AKIA{secrets.token_hex(8).upper()}",
            "AWS_SECRET_ACCESS_KEY": secrets.token_urlsafe(30),
            "CANARY_PINGBACK_ENDPOINT": canary_url,
            "USAGE_NOTE": "Place this dummy AWS key in a git repo or fake config file to detect unauthorized exfiltration."
        }
    elif request.token_type == "fake_db_credential":
        decoy = {
            "DATABASE_URL": f"postgres://db_admin_root:{secrets.token_urlsafe(12)}@db-core-internal.net:5432/finance_prod",
            "AUTH_TRACKER_URL": canary_url,
            "USAGE_NOTE": "Decoy database connection string with silent connection probe webhook."
        }
    elif request.token_type == "canary_document":
        decoy = {
            "DOCUMENT_TYPE": "Confidential_Salary_Grid_2026.docx",
            "EMBEDDED_CANARY_BEACON": canary_url,
            "USAGE_NOTE": "Contains embedded 1x1 image tracker that fires when opened in Word or PDF readers."
        }
    else:
        decoy = {
            "CANARY_TRACKING_URL": canary_url,
            "TRIGGER_ACTION": "HTTP GET / Image load"
        }

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    token_record = {
        "id": token_id,
        "token_type": request.token_type,
        "memo": request.memo,
        "canary_url": canary_url,
        "decoy_payload": decoy,
        "created_at": now_str,
        "is_tripped": False,
        "trip_count": 0,
        "last_tripped_at": None,
        "last_intruder_ip": None,
        "intrusions": []
    }

    ACTIVE_HONEYTOKENS[token_id] = token_record

    # Log audit event
    audit = AuditLog(
        actor_id=user.id,
        actor_email=user.email,
        actor_role=user.role,
        action="HONEYTOKEN_CREATED",
        target_type="honeytoken",
        target_id=token_id,
        details={"type": request.token_type, "memo": request.memo},
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(audit)
    db.commit()

    return HoneytokenOut(**token_record)

@router.get("/tokens/list", response_model=List[HoneytokenOut])
def list_honeytokens(user: User = Depends(require_enterprise_entitlement)):
    """List all deployed Enterprise honeytokens."""
    return [HoneytokenOut(**t) for t in ACTIVE_HONEYTOKENS.values()]

@router.get("/ping/{token_id}")
def trip_honeytoken_webhook(
    token_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Public Canary Webhook: Silently records intruder telemetry when tripped
    and returns a 1x1 transparent GIF.
    """
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "Unknown Client")
    referer = request.headers.get("referer", None)
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    if token_id in ACTIVE_HONEYTOKENS:
        token = ACTIVE_HONEYTOKENS[token_id]
        token["is_tripped"] = True
        token["trip_count"] += 1
        token["last_tripped_at"] = now_str
        token["last_intruder_ip"] = client_ip

        intrusion = {
            "id": f"int-{secrets.token_hex(4)}",
            "token_id": token_id,
            "token_type": token["token_type"],
            "memo": token["memo"],
            "intruder_ip": client_ip,
            "intruder_user_agent": user_agent,
            "intruder_referer": referer,
            "geo_location": "External Network Probe",
            "triggered_at": now_str,
            "severity": "CRITICAL"
        }
        token["intrusions"].insert(0, intrusion)
        INTRUSION_LOGS.insert(0, intrusion)

    # 1x1 Transparent GIF Byte stream
    transparent_gif_bytes = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
    return Response(content=transparent_gif_bytes, media_type="image/gif")
