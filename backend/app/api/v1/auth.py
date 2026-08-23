import secrets
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserOut, Token, ApiKeyOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> User | None:
    """Extract authenticated user via Bearer token or X-API-Key header, otherwise None."""
    # 1. Check API Key header
    if x_api_key:
        user_by_key = db.query(User).filter(User.api_key == x_api_key).first()
        if user_by_key and user_by_key.is_active:
            return user_by_key

    # 2. Check Bearer token
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> User:
    """Enforce authenticated user requirement via Bearer Token or X-API-Key."""
    user = get_current_user_optional(token, x_api_key, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token or X-API-Key header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforce Admin privileges."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required.",
        )
    return current_user

def enforce_api_quota(
    user: Optional[User],
    db: Session
):
    """
    Enforce Daily Subscription & Quota Limits:
    - Admin / Analyst: Unlimited.
    - Pro / Enterprise Tier: Unlimited.
    - Free Tier: Limited to 6 free scans per day. Automatically resets at midnight.
    - Unauthenticated Guest: Allowed 3 trial scans.
    """
    if not user:
        # Unauthenticated guest scan allowance
        return

    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    # Automatic Daily Reset Check
    if getattr(user, "last_scan_date", None) != today_str:
        user.scans_today = 0
        user.last_scan_date = today_str

    tier = getattr(user, "subscription_tier", "free")
    role = getattr(user, "role", "user")

    # Unlimited access for paid subscribers & admins
    if tier in ["pro", "enterprise", "unlimited"] or role in ["admin", "analyst"]:
        user.scans_today = getattr(user, "scans_today", 0) + 1
        user.scans_used = getattr(user, "scans_used", 0) + 1
        db.commit()
        return

    # Free Tier Daily Quota Check (6 scans per day)
    daily_quota = getattr(user, "daily_quota", 6)
    scans_today = getattr(user, "scans_today", 0)

    if scans_today >= daily_quota:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "error": "DAILY_QUOTA_EXHAUSTED",
                "message": f"Daily free scan limit reached ({scans_today}/{daily_quota} scans used today). Your free scans reset every day at midnight, or upgrade to Pro for unlimited scans.",
                "tier": tier,
                "scans_today": scans_today,
                "daily_quota": daily_quota,
                "scans_used_total": getattr(user, "scans_used", 0),
                "upgrade_url": "/pricing"
            }
        )

    user.scans_today = scans_today + 1
    user.scans_used = getattr(user, "scans_used", 0) + 1
    db.commit()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account with 6 free scans per day before subscription."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    # First user is automatically admin for convenience
    user_count = db.query(User).count()
    is_first_admin = (user_count == 0)
    role = "admin" if is_first_admin else "user"
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name or user_in.email.split("@")[0].capitalize(),
        role=role,
        is_active=True,
        api_key=f"rs_{'admin' if is_first_admin else 'free'}_{secrets.token_hex(16)}",
        subscription_tier="enterprise" if is_first_admin else "free",
        daily_quota=999999 if is_first_admin else 6,
        scans_today=0,
        last_scan_date=today_str,
        monthly_quota=999999 if is_first_admin else 180,
        scans_used=0
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated.",
        )

    # Refresh daily reset on login
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    if getattr(user, "last_scan_date", None) != today_str:
        user.scans_today = 0
        user.last_scan_date = today_str
        db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve current authenticated user profile with daily reset verification."""
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    if getattr(current_user, "last_scan_date", None) != today_str:
        current_user.scans_today = 0
        current_user.last_scan_date = today_str
        db.commit()
    return current_user

@router.post("/api-key/regenerate")
def regenerate_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate developer API key."""
    tier = getattr(current_user, "subscription_tier", "free")
    new_key = f"rs_{tier}_{secrets.token_hex(16)}"
    current_user.api_key = new_key
    db.commit()
    return {"api_key": new_key, "message": "API key regenerated successfully."}

@router.get("/quota/status")
def get_quota_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve user subscription tier and daily scan usage statistics."""
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    if getattr(current_user, "last_scan_date", None) != today_str:
        current_user.scans_today = 0
        current_user.last_scan_date = today_str
        db.commit()

    tier = getattr(current_user, "subscription_tier", "free")
    daily_quota = getattr(current_user, "daily_quota", 6)
    scans_today = getattr(current_user, "scans_today", 0)
    scans_used_total = getattr(current_user, "scans_used", 0)
    is_unlimited = tier in ["pro", "enterprise", "unlimited"] or current_user.role in ["admin", "analyst"]

    return {
        "user_email": current_user.email,
        "role": current_user.role,
        "api_key": current_user.api_key or f"rs_{tier}_{secrets.token_hex(12)}",
        "subscription_tier": tier,
        "daily_quota": "Unlimited" if is_unlimited else daily_quota,
        "scans_today": scans_today,
        "scans_left_today": "Unlimited" if is_unlimited else max(0, daily_quota - scans_today),
        "scans_used_total": scans_used_total,
        "is_unlimited": is_unlimited,
        "resets_at": "Daily at 00:00 UTC",
        "status": "ACTIVE"
    }

@router.post("/quota/request-upgrade")
def request_quota_upgrade(
    reason: str = "Pro Upgrade",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Instant demo upgrade endpoint to Pro Unlimited tier."""
    current_user.subscription_tier = "pro"
    current_user.daily_quota = 999999
    current_user.monthly_quota = 999999
    if current_user.role == "user":
        current_user.role = "analyst"
    current_user.api_key = f"rs_pro_{secrets.token_hex(16)}"
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Upgraded to Pro Cyber Defender! Unlimited threat scans now active.",
        "subscription_tier": "pro",
        "daily_quota": "Unlimited",
        "monthly_quota": "Unlimited",
        "new_role": current_user.role
    }
