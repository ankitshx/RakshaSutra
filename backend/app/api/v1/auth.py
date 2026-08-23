"""
RakshaSutra Authentication & RBAC Engine
Implements secure user registration, login with brute-force protection,
session validation, and server-side RBAC (USER, BUSINESS_ADMIN, ENTERPRISE_ADMIN, SUPER_ADMIN).
"""

import time
import secrets
from datetime import datetime, timedelta
from typing import Optional, List, Callable
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.core.config import settings
from app.models.user import User
from app.models.audit_log import AuditLog
from app.services.entitlement_service import EntitlementService

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

# In-memory IP failed attempt tracker for brute-force mitigation
FAILED_LOGIN_ATTEMPTS: dict = {}  # {ip_str: [timestamp1, timestamp2, ...]}

# Schemas
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=100)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

# RBAC Dependencies
async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    user = db.query(User).filter(User.id == payload["sub"], User.is_active == True).first()
    return user

get_optional_current_user = get_current_user_optional

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == payload["sub"], User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_roles(allowed_roles: List[str]) -> Callable:
    """RBAC Guard Dependency Factory."""
    normalized_allowed = [r.lower() for r in allowed_roles]
    
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = getattr(current_user, "role", "user").lower()
        # super_admin inherits all permissions
        if user_role == "super_admin" or user_role in normalized_allowed:
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required role: {', '.join(allowed_roles)} (Your role: {user_role})."
        )
    return role_checker

async def get_current_super_admin(
    current_user: User = Depends(require_roles(["super_admin", "admin"]))
) -> User:
    return current_user

get_current_admin = get_current_super_admin

# Quota Enforcement Wrappers
def enforce_api_quota(user: Optional[User], db: Session):
    return EntitlementService.enforce_scan_quota(user, db)

def enforce_osint_quota(user: Optional[User], db: Session):
    return EntitlementService.enforce_osint_quota(user, db)

# Endpoints
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    request: UserRegisterRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """Register a new citizen account with 6 free daily threat scans and 1 daily OSINT scan."""
    email_clean = request.email.lower().strip()
    
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    new_user = User(
        email=email_clean,
        hashed_password=get_password_hash(request.password),
        full_name=request.full_name,
        role="user",
        subscription_tier="free",
        daily_quota=6,
        scans_today=0,
        osint_quota=1,
        osint_today=0,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log audit event
    audit = AuditLog(
        actor_id=new_user.id,
        actor_email=new_user.email,
        actor_role=new_user.role,
        action="USER_REGISTRATION",
        target_type="user",
        target_id=new_user.id,
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(audit)
    db.commit()

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return TokenResponse(
        access_token=token,
        user={
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role,
            "subscription_tier": new_user.subscription_tier,
            "daily_quota": new_user.daily_quota,
            "scans_today": new_user.scans_today,
            "osint_quota": new_user.osint_quota,
            "osint_today": new_user.osint_today
        }
    )

@router.post("/login", response_model=TokenResponse)
def login_user(
    request: UserLoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with brute-force rate-limiting protection.
    Returns generic authentication error on failure.
    """
    client_ip = req.client.host if req.client else "unknown"
    now_ts = time.time()

    # Brute-force check: max 5 failed attempts per IP within 5 minutes
    ip_failures = [t for t in FAILED_LOGIN_ATTEMPTS.get(client_ip, []) if now_ts - t < 300]
    if len(ip_failures) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please wait 5 minutes before trying again."
        )

    email_clean = request.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(request.password, user.hashed_password):
        # Record failure
        ip_failures.append(now_ts)
        FAILED_LOGIN_ATTEMPTS[client_ip] = ip_failures
        
        # Log failed attempt
        audit = AuditLog(
            actor_email=email_clean,
            action="USER_LOGIN_FAILED",
            target_type="auth",
            ip_address=client_ip
        )
        db.add(audit)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact security support."
        )

    # Clear failed attempts on success
    FAILED_LOGIN_ATTEMPTS.pop(client_ip, None)

    # Log successful login
    audit = AuditLog(
        actor_id=user.id,
        actor_email=user.email,
        actor_role=user.role,
        action="USER_LOGIN_SUCCESS",
        target_type="user",
        target_id=user.id,
        ip_address=client_ip
    )
    db.add(audit)
    db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "subscription_tier": user.subscription_tier,
            "daily_quota": user.daily_quota,
            "scans_today": user.scans_today,
            "osint_quota": getattr(user, "osint_quota", 1),
            "osint_today": getattr(user, "osint_today", 0)
        }
    )

@router.get("/me")
def get_current_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get authenticated user profile and live entitlement metrics."""
    entitlements = EntitlementService.get_user_entitlements(current_user, db)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "subscription_tier": current_user.subscription_tier,
        "daily_quota": current_user.daily_quota,
        "scans_today": current_user.scans_today,
        "osint_quota": getattr(current_user, "osint_quota", 1),
        "osint_today": getattr(current_user, "osint_today", 0),
        "scans_used": current_user.scans_used,
        "entitlements": entitlements
    }

@router.post("/change-password")
def change_password(
    request: PasswordChangeRequest,
    req: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change account password with current password verification."""
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    # Log password change
    audit = AuditLog(
        actor_id=current_user.id,
        actor_email=current_user.email,
        actor_role=current_user.role,
        action="USER_PASSWORD_CHANGED",
        target_type="user",
        target_id=current_user.id,
        ip_address=req.client.host if req.client else "unknown"
    )
    db.add(audit)
    db.commit()

    return {"success": True, "message": "Password changed successfully."}

@router.get("/quota/status")
def get_quota_status(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get current scan & OSINT daily usage metrics and limits."""
    entitlements = EntitlementService.get_user_entitlements(current_user, db)
    return {
        "tier": entitlements["tier"],
        "daily_quota": entitlements["daily_scan_limit"],
        "scans_today": getattr(current_user, "scans_today", 0) if current_user else 0,
        "osint_quota": entitlements["osint_daily_limit"],
        "osint_today": getattr(current_user, "osint_today", 0) if current_user else 0,
        "is_authenticated": current_user is not None
    }
