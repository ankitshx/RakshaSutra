from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    subscription_tier: Optional[str] = "free"
    monthly_quota: Optional[int] = 10
    scans_used: Optional[int] = 0
    is_active: bool
    api_key: Optional[str] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class ApiKeyOut(BaseModel):
    api_key: str
    message: str
