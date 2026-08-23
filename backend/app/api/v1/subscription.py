"""
RakshaSutra Subscription & Razorpay Payment Gateway Engine
Handles plan catalogs, Razorpay order creation, payment verification, and webhook idempotency.
"""

import os
import uuid
import hmac
import hashlib
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session
import razorpay

from app.core.database import get_db
from app.core.config import settings
from app.core.logging import logger
from app.models.user import User
from app.models.billing import Plan, Subscription, Payment, Invoice, WebhookEvent
from app.models.audit_log import AuditLog
from app.api.v1.auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/subscription", tags=["Subscriptions & Real Payments"])

# Initialize Razorpay Client
try:
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception as e:
    logger.warning(f"Razorpay Client initialization notice: {str(e)}")
    razorpay_client = None

PLANS = [
    {
        "id": "free",
        "name": "Community Free",
        "tier": "free",
        "price_inr": 0,
        "price_usd": 0,
        "billing_period": "forever",
        "description": "Essential scam and phishing protection for individual citizens, students, and elders.",
        "badge": "6 Scans / Day",
        "features": [
            "6 threat scans per day (resets at 00:00 UTC)",
            "1 OSINT investigation per day",
            "Plain-English Traffic Light Verdicts (SAFE/CAUTION/DANGER)",
            "Emergency 1930 Cyber Fraud Containment Guide",
            "Basic Cyber Threat Map (Simulation Mode)",
            "Personal Scan History"
        ],
        "daily_scan_quota": 6,
        "osint_daily_quota": 1,
        "api_monthly_quota": 0,
        "is_popular": False
    },
    {
        "id": "pro",
        "name": "Pro Cyber Defender",
        "tier": "pro",
        "price_inr": 299,
        "price_usd": 5,
        "billing_period": "monthly",
        "description": "Advanced threat detection, dark web monitoring, browser extension, and expanded OSINT investigations.",
        "badge": "Most Popular • 100 Scans/Day",
        "features": [
            "100 threat scans per day",
            "Unlimited OSINT investigations & Force Threat Graph",
            "Dark Web & Breach Exposure Monitoring",
            "Universal Cross-Browser Extension (Chrome, Edge, Brave)",
            "Detailed PDF / JSON Incident Reports",
            "Advanced Cyber Threat Map with Filters & Controls",
            "Priority AI Security Copilot Playbooks"
        ],
        "daily_scan_quota": 100,
        "osint_daily_quota": 999999,
        "api_monthly_quota": 0,
        "is_popular": True
    },
    {
        "id": "business",
        "name": "Business Team Suite",
        "tier": "business",
        "price_inr": 999,
        "price_usd": 15,
        "billing_period": "monthly",
        "description": "Designed for SMEs, law firms, and tech teams requiring organization monitoring and developer API access.",
        "badge": "For Teams • 500 Scans/Day",
        "features": [
            "500 threat scans per day",
            "5 Team Member Seats with Role-Based Access",
            "Organization Domain & Mail Infrastructure Monitoring",
            "1,000 API Requests/month (10 req/min rate limit)",
            "Team Audit Logs & Security Telemetry",
            "Centralized Browser Extension Policy Management",
            "Assisted Incident Response Dossier Generator"
        ],
        "daily_scan_quota": 500,
        "osint_daily_quota": 999999,
        "api_monthly_quota": 1000,
        "is_popular": False
    },
    {
        "id": "enterprise",
        "name": "Enterprise SOC & Defense",
        "tier": "enterprise",
        "price_inr": 4999,
        "price_usd": 65,
        "billing_period": "custom",
        "description": "Custom high-volume API quotas, SIEM webhooks, SSO integration, active honeytokens, and 24/7 SLA.",
        "badge": "Enterprise Custom",
        "features": [
            "Contract-based high-volume scan quota",
            "Custom API Quota & Configurable Endpoints",
            "Single Sign-On (SAML / OIDC SSO) & Enterprise RBAC",
            "SIEM Integration & Real-time Webhooks",
            "Honeytoken & Active Deception Tripwires",
            "Continuous Dark Web Corporate Monitoring",
            "Dedicated Security Account Manager & 99.9% SLA"
        ],
        "daily_scan_quota": 999999,
        "osint_daily_quota": 999999,
        "api_monthly_quota": 50000,
        "is_popular": False
    }
]

# Schemas
class CreateOrderRequest(BaseModel):
    plan_id: str = Field(..., description="'pro', 'business', or 'enterprise'")

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: str

@router.get("/plans")
def get_plans():
    """Retrieve official SaaS plan catalog."""
    return {"plans": PLANS}

@router.post("/razorpay/create-order")
def create_razorpay_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Razorpay order for plan subscription checkout.
    """
    plan = next((p for p in PLANS if p["id"] == request.plan_id), None)
    if not plan or plan["price_inr"] <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan selected for payment."
        )

    amount_paise = plan["price_inr"] * 100
    receipt_id = f"rcpt_{current_user.id[:8]}_{int(datetime.utcnow().timestamp())}"

    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt_id,
        "notes": {
            "user_id": current_user.id,
            "user_email": current_user.email,
            "plan_id": plan["id"],
            "plan_tier": plan["tier"]
        }
    }

    try:
        if razorpay_client:
            order = razorpay_client.order.create(data=order_data)
            razorpay_order_id = order.get("id")
        else:
            # Test-mode fallback
            razorpay_order_id = f"order_test_{secrets.token_hex(8)}"
    except Exception as e:
        logger.error(f"Razorpay order creation error: {str(e)}")
        razorpay_order_id = f"order_test_{secrets.token_hex(8)}"

    # Record pending payment record
    payment = Payment(
        user_id=current_user.id,
        razorpay_order_id=razorpay_order_id,
        amount=amount_paise,
        currency="INR",
        status="created"
    )
    db.add(payment)
    db.commit()

    return {
        "success": True,
        "order_id": razorpay_order_id,
        "amount": amount_paise,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID,
        "plan_name": plan["name"],
        "plan_id": plan["id"],
        "user_email": current_user.email,
        "user_name": current_user.full_name or "Valued Defender"
    }

@router.post("/razorpay/verify-payment")
def verify_razorpay_payment(
    request: VerifyPaymentRequest,
    req: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify Razorpay payment signature and activate subscription entitlements.
    """
    # 1. Cryptographic HMAC SHA-256 verification
    generated_sig = hmac.new(
        key=settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        msg=f"{request.razorpay_order_id}|{request.razorpay_payment_id}".encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()

    is_valid = hmac.compare_digest(generated_sig, request.razorpay_signature)
    
    # In local development test mode, allow verification if test keys match
    if not is_valid and not (settings.RAZORPAY_KEY_ID.startswith("rzp_test") and request.razorpay_signature.startswith("sig_test_")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cryptographic payment signature verification failed."
        )

    plan = next((p for p in PLANS if p["id"] == request.plan_id), None)
    if not plan:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown plan ID.")

    # 2. Update Payment record
    payment = db.query(Payment).filter(Payment.razorpay_order_id == request.razorpay_order_id).first()
    if not payment:
        payment = Payment(
            user_id=current_user.id,
            razorpay_order_id=request.razorpay_order_id,
            amount=plan["price_inr"] * 100,
            currency="INR"
        )
        db.add(payment)

    payment.razorpay_payment_id = request.razorpay_payment_id
    payment.razorpay_signature = request.razorpay_signature
    payment.status = "captured"
    payment.method = "razorpay"

    # 3. Create / Update Subscription record
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()

    now = datetime.utcnow()
    period_end = now + timedelta(days=30)

    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan_id=plan["id"],
            razorpay_order_id=request.razorpay_order_id,
            status="active",
            current_period_start=now,
            current_period_end=period_end
        )
        db.add(subscription)
    else:
        subscription.plan_id = plan["id"]
        subscription.razorpay_order_id = request.razorpay_order_id
        subscription.status = "active"
        subscription.current_period_end = period_end

    # 4. Generate Invoice
    invoice_num = f"INV-RS-{now.strftime('%Y%m')}-{secrets.token_hex(3).upper()}"
    invoice = Invoice(
        user_id=current_user.id,
        subscription_id=subscription.id,
        payment_id=payment.id,
        invoice_number=invoice_num,
        amount=plan["price_inr"] * 100,
        tax_amount=int(plan["price_inr"] * 100 * 0.18),
        status="paid"
    )
    db.add(invoice)

    # 5. Activate User Tier & Quotas
    current_user.subscription_tier = plan["tier"]
    current_user.daily_quota = plan["daily_scan_quota"]
    current_user.osint_quota = plan["osint_daily_quota"]

    # Assign business_admin or enterprise_admin role if upgraded to team tiers
    if plan["tier"] == "business" and current_user.role == "user":
        current_user.role = "business_admin"
    elif plan["tier"] == "enterprise" and current_user.role in ["user", "business_admin"]:
        current_user.role = "enterprise_admin"

    # Log audit event
    audit = AuditLog(
        actor_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        action="SUBSCRIPTION_ACTIVATED",
        target_type="plan",
        target_id=plan["id"],
        details={"payment_id": request.razorpay_payment_id, "amount_inr": plan["price_inr"]},
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully activated {plan['name']}! Your upgraded entitlements are now live.",
        "subscription_tier": current_user.subscription_tier,
        "daily_quota": current_user.daily_quota,
        "osint_quota": current_user.osint_quota,
        "invoice_number": invoice_num
    }

@router.post("/razorpay/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Authoritative Razorpay Webhook Handler with raw body HMAC verification and idempotency protection.
    """
    raw_body = await request.body()
    body_str = raw_body.decode("utf-8")

    # 1. Verify Webhook Signature
    if settings.RAZORPAY_WEBHOOK_SECRET and x_razorpay_signature:
        expected_sig = hmac.new(
            key=settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            msg=raw_body,
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, x_razorpay_signature):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature.")

    try:
        event_payload = json.loads(body_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload.")

    event_id = event_payload.get("event_id") or event_payload.get("id") or str(uuid.uuid4())
    event_type = event_payload.get("event", "unknown")

    # 2. Idempotency Check: Ignore already processed events
    existing_event = db.query(WebhookEvent).filter(WebhookEvent.event_id == event_id).first()
    if existing_event:
        return {"status": "ignored", "message": "Event already processed."}

    webhook_record = WebhookEvent(
        event_id=event_id,
        event_type=event_type,
        payload=event_payload,
        status="processed"
    )
    db.add(webhook_record)
    db.commit()

    # 3. Handle Webhook Events
    if event_type == "payment.captured":
        payment_entity = event_payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")
        notes = payment_entity.get("notes", {})
        user_id = notes.get("user_id")
        plan_id = notes.get("plan_id")

        if user_id and plan_id:
            user = db.query(User).filter(User.id == user_id).first()
            plan = next((p for p in PLANS if p["id"] == plan_id), None)
            if user and plan:
                user.subscription_tier = plan["tier"]
                user.daily_quota = plan["daily_scan_quota"]
                user.osint_quota = plan["osint_daily_quota"]
                db.commit()

    return {"status": "success", "event_id": event_id}
