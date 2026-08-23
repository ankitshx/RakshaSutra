from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

class ThreatIntelProvider(ABC):
    """
    Standardized Abstract Base Class for all Threat Intelligence Providers.
    Guarantees strict schema normalization, transparent error reporting,
    and distinct health status tracking (Operational, Degraded, Unavailable, Not Configured).
    """

    def __init__(self, name: str, display_name: str, category: str = "Reputation"):
        self.name = name
        self.display_name = display_name
        self.category = category
        self.is_enabled = True
        self.total_queries = 0
        self.cache_hits = 0
        self.last_sync = datetime.now(timezone.utc)
        self.status = "OPERATIONAL"  # OPERATIONAL, DEGRADED, UNAVAILABLE, RATE_LIMITED, NOT_CONFIGURED
        self.last_error: Optional[str] = None
        self.avg_latency_ms: float = 15.0

    @abstractmethod
    async def query_target(self, target: str, target_type: str = "url") -> Dict[str, Any]:
        """
        Query target (url, domain, ip, hash, email).
        Must ALWAYS return normalized dictionary:
        {
            "provider_name": str,
            "display_name": str,
            "status": str, # OPERATIONAL, DEGRADED, UNAVAILABLE, NOT_CONFIGURED
            "timestamp": str,
            "found": bool,
            "threat_category": Optional[str],
            "confidence": int (0-100),
            "score_impact": int (0-40),
            "evidence": str,
            "findings": List[Dict[str, Any]],
            "rate_limit_info": Optional[Dict[str, Any]],
            "error_message": Optional[str],
            "raw_reference": Optional[Dict[str, Any]],
            "tags": List[str]
        }
        """
        pass

    def get_status(self) -> Dict[str, Any]:
        """Return real-time operational health metrics."""
        return {
            "name": self.name,
            "display_name": self.display_name,
            "category": self.category,
            "status": self.status,
            "latency_ms": round(self.avg_latency_ms, 1),
            "total_queries": self.total_queries,
            "cache_hits": self.cache_hits,
            "last_sync": self.last_sync.isoformat() if hasattr(self.last_sync, 'isoformat') else str(self.last_sync),
            "is_enabled": self.is_enabled,
            "last_error": self.last_error
        }
