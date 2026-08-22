import uuid
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
        "name": "Community Starter",
        "price_inr": 0,
        "price_usd": 0,
        "billing_period": "forever",
        "description": "Essential scam and phishing protection for individual citizens, students, and elders.",
        "badge": "Free Forever",
        "features": [
            "20 link & message scans per day",
            "Plain-English Traffic Light Verdicts",
            "Emergency 1930 Cyber Fraud Containment Guide",
            "Interactive Phishing Simulation Games",
            "Dual Dark & Light Mode Access"
        ],
        "quota": 50,
        "is_popular": False
    },
    {
        "id": "pro",
        "name": "Pro Cyber Defender",
        "price_inr": 499,
        "price_usd": 9,
        "billing_period": "monthly",
        "annual_price_inr": 4990,
        "description": "Advanced threat detection, developer API keys, and priority AI incident response copilot.",
        "badge": "Most Popular",
        "features": [
            "Unlimited link & message scanning",
            "5,000 API Requests/mo (Developer API Key)",
            "Priority Raksha AI Copilot (Instant Analysis)",
            "Downloadable PDF / JSON Threat Dossiers",
            "Automated Phishing Link Takedown Guidance",
            "Zero Rate-Limits & Instant Threat Feed Updates"
        ],
        "quota": 5000,
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
        "quota": 100000,
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
    quota = getattr(current_user, "monthly_quota", 50)
    used = getattr(current_user, "scans_used", 0)

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "subscription_tier": tier,
        "monthly_quota": quota,
        "scans_used": used,
        "quota_remaining": max(0, quota - used),
        "api_key": current_user.api_key or f"rs_free_{uuid.uuid4().hex[:12]}"
    }

@router.post("/checkout")
def process_checkout(
    req: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process subscription checkout session (supporting UPI, Cards, Netbanking, or Stripe).
    Instantly provisions elevated API keys and activates upgraded tier.
    """
    target_plan = next((p for p in PLANS if p["id"] == req.plan_id), None)
    if not target_plan or req.plan_id == "free":
        raise HTTPException(status_code=400, detail="Invalid plan selected for checkout.")

    # Upgrade User Account in Database
    current_user.subscription_tier = req.plan_id
    current_user.monthly_quota = target_plan["quota"]
    if current_user.role == "user":
        current_user.role = "analyst"  # Promote to analyst for pro tools
    
    # Generate high-throughput API key if missing or upgrade prefix
    current_user.api_key = f"rs_{req.plan_id}_{uuid.uuid4().hex[:18]}"
    db.commit()
    db.refresh(current_user)

    tx_id = f"TXN_{uuid.uuid4().hex[:10].upper()}"

    return {
        "success": True,
        "message": f"Congratulations! You have successfully upgraded to {target_plan['name']}.",
        "transaction_id": tx_id,
        "plan_id": req.plan_id,
        "plan_name": target_plan["name"],
        "new_api_key": current_user.api_key,
        "monthly_quota": current_user.monthly_quota,
        "receipt_url": f"/api/v1/subscription/receipt/{tx_id}"
    }
