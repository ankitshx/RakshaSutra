import hashlib
import hmac
import json
import secrets
import time
from datetime import datetime, timezone
from typing import Dict, List, Any
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.investigation import WebhookEndpoint, WebhookDelivery

router = APIRouter(prefix="/webhooks", tags=["Developer Webhook Gateway"])

@router.post("/endpoints")
async def create_webhook_endpoint(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register a new outgoing webhook URL with an auto-generated HMAC secret key."""
    url = payload.get("url", "").strip()
    events = payload.get("events", ["investigation.completed", "threat.detected", "monitoring.alert"])

    if not url or not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Valid webhook URL is required (must start with http:// or https://).")

    secret_key = f"whsec_{secrets.token_hex(24)}"
    endpoint = WebhookEndpoint(
        user_id=current_user.id,
        url=url,
        secret_key=secret_key,
        subscribed_events=events,
        is_active=True
    )
    db.add(endpoint)
    db.commit()
    db.refresh(endpoint)

    return {
        "id": endpoint.id,
        "url": endpoint.url,
        "secret_key": endpoint.secret_key,
        "subscribed_events": endpoint.subscribed_events,
        "is_active": endpoint.is_active,
        "created_at": endpoint.created_at.isoformat()
    }

@router.get("/endpoints")
async def list_webhook_endpoints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all registered webhook endpoints for current user."""
    endpoints = db.query(WebhookEndpoint).filter(
        WebhookEndpoint.user_id == current_user.id
    ).all()

    return [
        {
            "id": ep.id,
            "url": ep.url,
            "secret_preview": ep.secret_key[:10] + "..." if ep.secret_key else "",
            "subscribed_events": ep.subscribed_events,
            "is_active": ep.is_active,
            "created_at": ep.created_at.isoformat()
        }
        for ep in endpoints
    ]

@router.delete("/endpoints/{endpoint_id}")
async def delete_webhook_endpoint(
    endpoint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a registered webhook endpoint."""
    ep = db.query(WebhookEndpoint).filter(
        WebhookEndpoint.id == endpoint_id,
        WebhookEndpoint.user_id == current_user.id
    ).first()
    if not ep:
        raise HTTPException(status_code=404, detail="Webhook endpoint not found.")
    db.delete(ep)
    db.commit()
    return {"status": "success", "message": "Webhook endpoint deleted successfully."}

@router.post("/endpoints/{endpoint_id}/test")
async def test_webhook_ping(
    endpoint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a test HMAC SHA-256 signed ping payload to a registered webhook endpoint."""
    ep = db.query(WebhookEndpoint).filter(
        WebhookEndpoint.id == endpoint_id,
        WebhookEndpoint.user_id == current_user.id
    ).first()

    if not ep:
        raise HTTPException(status_code=404, detail="Webhook endpoint not found.")

    test_payload = {
        "event_id": f"evt_{secrets.token_hex(8)}",
        "event_type": "ping",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "message": "RakshaSutra Webhook Verification Ping",
            "environment": "production",
            "version": "1.0.0"
        }
    }

    payload_str = json.dumps(test_payload, separators=(',', ':'))
    signature = hmac.new(
        ep.secret_key.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()

    t0 = time.time()
    status_code = None
    resp_text = None
    success = False

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                ep.url,
                content=payload_str,
                headers={
                    "Content-Type": "application/json",
                    "X-RakshaSutra-Signature": f"t={int(time.time())},v1={signature}",
                    "User-Agent": "RakshaSutra-Webhook-Dispatcher/1.0"
                }
            )
            status_code = res.status_code
            resp_text = res.text[:500]
            success = 200 <= status_code < 300
    except Exception as e:
        resp_text = f"Connection failed: {str(e)}"

    duration_ms = round((time.time() - t0) * 1000, 1)

    delivery = WebhookDelivery(
        endpoint_id=ep.id,
        event_type="ping",
        payload=test_payload,
        status_code=status_code,
        response_body=resp_text,
        signature_header=f"v1={signature}",
        duration_ms=duration_ms,
        success=success
    )
    db.add(delivery)
    db.commit()

    return {
        "delivery_id": delivery.id,
        "url": ep.url,
        "event_type": "ping",
        "signature": f"v1={signature}",
        "status_code": status_code,
        "duration_ms": duration_ms,
        "success": success,
        "response_preview": resp_text
    }

@router.get("/deliveries")
async def list_webhook_deliveries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List recent webhook delivery attempts with HTTP response codes and duration."""
    user_endpoints = db.query(WebhookEndpoint.id).filter(
        WebhookEndpoint.user_id == current_user.id
    ).all()
    endpoint_ids = [ep[0] for ep in user_endpoints]

    deliveries = db.query(WebhookDelivery).filter(
        WebhookDelivery.endpoint_id.in_(endpoint_ids)
    ).order_by(WebhookDelivery.created_at.desc()).limit(50).all()

    return [
        {
            "id": d.id,
            "endpoint_id": d.endpoint_id,
            "event_type": d.event_type,
            "status_code": d.status_code,
            "signature": d.signature_header,
            "duration_ms": d.duration_ms,
            "success": d.success,
            "created_at": d.created_at.isoformat()
        }
        for d in deliveries
    ]
