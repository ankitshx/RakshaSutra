"""
RakhshaSutra v3.0 — Organizations, Multi-Tenancy & RBAC 2.0 API
Manages multi-seat teams, invitations, and role-to-permission mappings.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.organization import Organization, TeamMember, ROLE_PERMISSIONS, get_permissions_for_role

router = APIRouter(prefix="/organizations", tags=["Organization & Multi-Tenancy"])

class CreateOrgRequest(BaseModel):
    name: str
    domain: Optional[str] = None
    tier: str = "business"

class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field("analyst", description="owner, admin, analyst, developer, viewer")

class UpdateMemberRoleRequest(BaseModel):
    role: str = Field(..., description="owner, admin, analyst, developer, viewer")

@router.get("/current", response_model=Dict[str, Any])
def get_current_organization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve current user's active organization, team members, and permissions."""
    # Find user's membership
    membership = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).first()
    if not membership:
        # Return personal workspace representation
        return {
            "is_personal": True,
            "organization": {
                "id": f"personal-{current_user.id}",
                "name": f"{current_user.full_name or 'Personal'}'s Workspace",
                "tier": current_user.subscription_tier,
                "max_seats": 1,
                "members_count": 1
            },
            "user_role": "owner",
            "permissions": get_permissions_for_role("owner"),
            "members": [
                {
                    "user_id": current_user.id,
                    "email": current_user.email,
                    "full_name": current_user.full_name,
                    "role": "owner",
                    "joined_at": current_user.created_at.isoformat() if current_user.created_at else None
                }
            ]
        }

    org = membership.organization
    members = db.query(TeamMember).filter(TeamMember.organization_id == org.id).all()

    return {
        "is_personal": False,
        "organization": {
            "id": org.id,
            "name": org.name,
            "domain": org.domain,
            "tier": org.tier,
            "max_seats": org.max_seats,
            "members_count": len(members)
        },
        "user_role": membership.role,
        "permissions": get_permissions_for_role(membership.role),
        "members": [
            {
                "id": m.id,
                "user_id": m.user_id,
                "role": m.role,
                "permissions": get_permissions_for_role(m.role),
                "joined_at": m.joined_at.isoformat() if m.joined_at else None
            }
            for m in members
        ]
    }

@router.get("/roles/permissions-matrix")
def get_roles_permissions_matrix():
    """Retrieve standard RBAC 2.0 permission matrix."""
    return {
        "roles": list(ROLE_PERMISSIONS.keys()),
        "matrix": {
            role: list(perms)
            for role, perms in ROLE_PERMISSIONS.items()
        }
    }
