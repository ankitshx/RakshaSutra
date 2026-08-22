import logging
import uuid
import sys
from typing import Optional

# Setup standard logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("rakshasutra")

def generate_request_id() -> str:
    """Generate a clean user-facing tracking request ID like RS-A1B2C3D4"""
    unique_suffix = uuid.uuid4().hex[:8].upper()
    return f"RS-{unique_suffix}"
