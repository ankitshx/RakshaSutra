import uuid
import secrets
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user_optional, get_current_user

router = APIRouter(prefix="/subscription", tags=["Subscriptions & Monetization"])

PLANS = [
    {
        "id": "free",
        "name": "Community Free Trial",
        "price_inr": 0,
        "price_usd": 0,
        "billing_period": "forever",
        "description": "Essential scam and phishing protection for individual citizens, students, and elders.",
        "badge": "10 Free Scans",
        "features": [
            "10 free threat scans total",
            "Plain-English Traffic Light Verdicts",
            "Emergency 1930 Cyber Fraud Containment Guide",
            "Dual Dark & Light Mode Access",
            "Interactive Phishing Simulation"
        ],
        "quota": 10,
        "is_popular": False
    },
    {
        "id": "pro",
        "name": "Pro Cyber Defender",
        "price_inr": 499,
        "price_usd": 9,
        "billing_period": "monthly",
        "annual_price_inr": 4990,
        "description": "Advanced threat detection, unlimited scans, developer API keys, and priority AI incident response copilot.",
        "badge": "Most Popular • Unlimited Scans",
        "features": [
            "Unlimited link & message scanning",
            "5,000 API Requests/mo (Developer API Key)",
            "Priority Raksha AI Copilot (Instant Analysis)",
            "Downloadable PDF / JSON Threat Dossiers",
            "Automated Phishing Link Takedown Guidance",
            "Zero Rate-Limits & Instant Threat Feed Updates"
        ],
        "quota": 999999,
        "is_popular": True
    },
    {
        "id": "enterprise",
        "name": "SOC & Organization Suite",
        "price_inr": 4999,
        "price_usd": 59,
        "billing_period": "monthly",
        "annual_price_inr": 49990,
        "description": "Enterprise-wide employee simulation campaigns, multi-seat access, and custom threat intel feeds.",
        "badge": "For Companies & Colleges",
        "features": [
            "Unlimited Organization-wide API Quota",
            "Custom Employee Phishing Simulation Campaigns",
            "Brand Impersonation & Typosquatting Alerts",
            "Dedicated Incident Response Dossier Export for Police / Cyber Cells",
            "Multi-Seat Analyst & Admin Team Management",
            "24/7 Priority Emergency Support SLA"
        ],
        "quota": 999999,
        "is_popular": False
    }
]

class CheckoutRequest(BaseModel):
    plan_id: str  # "pro" or "enterprise"
    billing_cycle: str = "monthly"  # "monthly" or "annual"
    payment_method: str = "upi"  # "upi", "card", "netbanking", "stripe"
    coupon_code: Optional[str] = None

@router.get("/plans")
def list_subscription_plans():
    """Retrieve all available subscription tiers and pricing matrices."""
    return {"plans": PLANS, "currency_options": ["INR", "USD"]}

@router.get("/my")
def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve current authenticated user's active subscription status and usage."""
    tier = getattr(current_user, "subscription_tier", "free")
    quota = getattr(current_user, "monthly_quota", 10)
    used = getattr(current_user, "scans_used", 0)
    is_unlimited = tier in ["pro", "enterprise", "unlimited"] or current_user.role in ["admin", "analyst"]

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "subscription_tier": tier,
        "monthly_quota": "Unlimited" if is_unlimited else quota,
        "scans_used": used,
        "quota_remaining": "Unlimited" if is_unlimited else max(0, quota - used),
        "is_unlimited": is_unlimited,
        "api_key": current_user.api_key or f"rs_{tier}_{secrets.token_hex(12)}"
    }

@router.post("/checkout")
def process_checkout(
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process subscription checkout session.
    Instantly provisions elevated API keys and activates unlimited Pro/Enterprise tier.
    """
    target_plan = next((p for p in PLANS if p["id"] == req.plan_id), None)
    if not target_plan or req.plan_id == "free":
        raise HTTPException(status_code=400, detail="Invalid plan selected for checkout.")

    # Upgrade User Account in Database
    current_user.subscription_tier = req.plan_id
    current_user.monthly_quota = 999999  # Unlimited
    if current_user.role == "user":
        current_user.role = "analyst"  # Promote to analyst for pro tools
    
    current_user.api_key = f"rs_{req.plan_id}_{secrets.token_hex(16)}"
    db.commit()
    db.refresh(current_user)

    tx_id = f"TXN_{uuid.uuid4().hex[:10].upper()}"

    return {
        "success": True,
        "message": f"Congratulations! You have successfully subscribed to {target_plan['name']}. Unlimited threat scans are now active.",
        "transaction_id": tx_id,
        "plan_id": req.plan_id,
        "plan_name": target_plan["name"],
        "new_api_key": current_user.api_key,
        "monthly_quota": "Unlimited",
        "subscription_tier": current_user.subscription_tier,
        "receipt_url": f"/api/v1/subscription/receipt/{tx_id}"
    }

@router.post("/instant-upgrade")
def instant_upgrade(
    plan_id: str = "pro",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Instant 1-click upgrade button for immediate demo/subscription activation."""
    target_plan = next((p for p in PLANS if p["id"] == plan_id), PLANS[1])

    current_user.subscription_tier = target_plan["id"]
    current_user.monthly_quota = 999999  # Unlimited
    if current_user.role == "user":
        current_user.role = "analyst"
    current_user.api_key = f"rs_{target_plan['id']}_{secrets.token_hex(16)}"
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": f"Upgraded to {target_plan['name']}! Unlimited threat scans are now active on your account.",
        "subscription_tier": current_user.subscription_tier,
        "monthly_quota": "Unlimited",
        "new_api_key": current_user.api_key
    }
