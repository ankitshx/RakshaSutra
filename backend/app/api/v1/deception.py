import uuid
import secrets
from datetime import datetime
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.auth import get_current_user_optional, enforce_api_quota
from app.models.user import User

router = APIRouter(prefix="/deception", tags=["Honeytoken & Active Deception"])

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

# In-Memory Deception Trap Store (Easily persisted to Postgres in production)
ACTIVE_HONEYTOKENS: Dict[str, dict] = {}
INTRUSION_LOGS: List[dict] = []

@router.post("/tokens/create", response_model=HoneytokenOut)
def create_honeytoken(
    request: HoneytokenCreateRequest,
    req: Request,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Generate a deceptive Honeytoken / Canary Trap.
    If an attacker or malicious actor accesses this token, an instant intrusion alert is logged.
    """
    enforce_api_quota(user, db)

    token_id = f"canary_{secrets.token_hex(8)}"
    host_base = str(req.base_url).rstrip("/")
    canary_url = f"{host_base}/api/v1/deception/ping/{token_id}"

    token_type = request.token_type.lower()
    decoy_payload: Dict[str, str] = {}

    if token_type == "decoy_aws_key":
        decoy_payload = {
            "AWS_ACCESS_KEY_ID": f"AKIA{secrets.token_hex(8).upper()}",
            "AWS_SECRET_ACCESS_KEY": f"{secrets.token_urlsafe(32)}",
            "AWS_DEFAULT_REGION": "ap-south-1",
            "TRIPWIRE_HOOK": canary_url,
            "INSTRUCTIONS": "Plant this inside a decoy .env or AWS credentials file. Any automated bot that tries to validate it triggers an instant alert."
        }
    elif token_type == "fake_db_credential":
        decoy_payload = {
            "DB_HOST": f"db-backup-internal-{secrets.token_hex(4)}.rakshasutra.org",
            "DB_USER": "admin_backup",
            "DB_PASSWORD": f"P@ssw0rd_{secrets.token_hex(6)}!",
            "CONNECTION_STRING": f"postgresql://admin_backup:{secrets.token_hex(6)}@db-internal.rakshasutra.org:5432/core_finances",
            "TRIPWIRE_URL": canary_url,
            "INSTRUCTIONS": "Place this in dummy database migration scripts or config files to detect insider data theft."
        }
    elif token_type == "canary_document":
        decoy_payload = {
            "DOCUMENT_NAME": f"Confidential_Financial_Ledger_2026_{secrets.token_hex(3)}.pdf",
            "TRACKING_BEACON": canary_url,
            "INSTRUCTIONS": "Embed this tracking beacon in a sensitive PDF or Word doc. When opened by an unauthorized party, it pings the server."
        }
    else: # web_canary default
        decoy_payload = {
            "TRACKING_LINK": canary_url,
            "INSTRUCTIONS": "Send this link to a suspected scammer or place it in a sensitive internal directory. The moment it is clicked, their IP and fingerprint are captured."
        }

    token_record = {
        "id": token_id,
        "token_type": token_type,
        "memo": request.memo,
        "canary_url": canary_url,
        "decoy_payload": decoy_payload,
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "is_tripped": False,
        "trip_count": 0,
        "last_tripped_at": None,
        "last_intruder_ip": None,
        "intrusions": []
    }

    ACTIVE_HONEYTOKENS[token_id] = token_record

    return HoneytokenOut(**token_record)

@router.get("/ping/{token_id}")
def trigger_honeytoken_ping(token_id: str, request: Request):
    """
    Silent Canary Tripwire Endpoint.
    Captures intruder IP, User-Agent, Referer, and logs a CRITICAL intrusion alert.
    Returns a 1x1 transparent GIF to prevent attacker suspicion.
    """
    client_ip = request.client.host if request.client else "Unknown IP"
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()

    user_agent = request.headers.get("user-agent", "Unknown Client")
    referer = request.headers.get("referer", None)
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    if token_id in ACTIVE_HONEYTOKENS:
        token = ACTIVE_HONEYTOKENS[token_id]
        token["is_tripped"] = True
        token["trip_count"] += 1
        token["last_tripped_at"] = timestamp
        token["last_intruder_ip"] = client_ip

        # Infer approximate location
        geo_loc = "New Delhi, India (AS55836)" if "127." in client_ip or "localhost" in client_ip else f"External Intruder ({client_ip})"

        alert = {
            "id": f"alert-{secrets.token_hex(6)}",
            "token_id": token_id,
            "token_type": token["token_type"],
            "memo": token["memo"],
            "intruder_ip": client_ip,
            "intruder_user_agent": user_agent,
            "intruder_referer": referer,
            "geo_location": geo_loc,
            "triggered_at": timestamp,
            "severity": "CRITICAL"
        }

        token["intrusions"].insert(0, alert)
        INTRUSION_LOGS.insert(0, alert)

    # 1x1 Transparent GIF Byte stream
    transparent_gif = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
    return Response(content=transparent_gif, media_type="image/gif")

@router.get("/tokens/list", response_model=List[HoneytokenOut])
def list_honeytokens(user: Optional[User] = Depends(get_current_user_optional)):
    """Retrieve all active Honeytoken traps and real-time intruder tripwire logs."""
    # Provide default seed traps for immediate user exploration if empty
    if not ACTIVE_HONEYTOKENS:
        seed_id_1 = "canary_demo_aws_prod"
        ACTIVE_HONEYTOKENS[seed_id_1] = {
            "id": seed_id_1,
            "token_type": "decoy_aws_key",
            "memo": "Decoy AWS Root Access Keys in /root/.aws/credentials",
            "canary_url": f"http://127.0.0.1:8000/api/v1/deception/ping/{seed_id_1}",
            "decoy_payload": {
                "AWS_ACCESS_KEY_ID": "AKIA9839075DEMO2026",
                "AWS_SECRET_ACCESS_KEY": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
                "INSTRUCTIONS": "Plant in test server config. Any attacker scraping AWS keys triggers this tripwire."
            },
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "is_tripped": True,
            "trip_count": 2,
            "last_tripped_at": "10 minutes ago",
            "last_intruder_ip": "198.51.100.42",
            "intrusions": [
                {
                    "id": "alert-demo-1",
                    "token_id": seed_id_1,
                    "token_type": "decoy_aws_key",
                    "memo": "Decoy AWS Root Access Keys in /root/.aws/credentials",
                    "intruder_ip": "198.51.100.42",
                    "intruder_user_agent": "aws-cli/2.15.10 Python/3.11.8 Linux/x86_64",
                    "intruder_referer": None,
                    "geo_location": "Frankfurt, Germany (Tor Exit Node AS9009)",
                    "triggered_at": "Just now",
                    "severity": "CRITICAL"
                }
            ]
        }

    return [HoneytokenOut(**t) for t in ACTIVE_HONEYTOKENS.values()]

@router.delete("/tokens/{token_id}")
def delete_honeytoken(token_id: str):
    """Revoke and delete an active honeytoken."""
    if token_id in ACTIVE_HONEYTOKENS:
        del ACTIVE_HONEYTOKENS[token_id]
        return {"success": True, "message": f"Honeytoken '{token_id}' successfully deleted and disarmed."}
    raise HTTPException(status_code=404, detail="Honeytoken not found.")
