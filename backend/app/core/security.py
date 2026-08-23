import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any, Tuple
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the hashed string using bcrypt."""
    try:
        password_bytes = plain_password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for password."""
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None, role: str = "user") -> str:
    """Create signed JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "iat": now
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_secure_api_key(tier: str = "live") -> Tuple[str, str, str]:
    """
    Generate a cryptographic API key.
    Returns (full_raw_key, key_prefix, key_hash).
    Only key_prefix and key_hash should be stored in the database.
    """
    random_hex = secrets.token_hex(24)
    full_key = f"rs_{tier}_{random_hex}"
    prefix = full_key[:12]
    key_hash = hashlib.sha256(full_key.encode("utf-8")).hexdigest()
    return full_key, prefix, key_hash

def hash_api_key(raw_key: str) -> str:
    """Compute SHA-256 hash of API key."""
    return hashlib.sha256(raw_key.strip().encode("utf-8")).hexdigest()
