from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime

class ThreatIntelProvider(ABC):
    """Abstract Base Class for Threat Intelligence Providers."""
    
    def __init__(self, name: str, display_name: str):
        self.name = name
        self.display_name = display_name
        self.is_enabled = True
        self.total_queries = 0
        self.cache_hits = 0
        self.last_sync = datetime.utcnow()
        self.status = "ACTIVE"  # "ACTIVE", "FALLBACK_LOCAL", "OFFLINE"

    @abstractmethod
    async def query_target(self, target: str, target_type: str) -> Dict[str, Any]:
        """
        Query target (url, domain, ip, hash).
        Returns:
            {
                "provider": str,
                "found": bool,
                "threat_category": Optional[str],
                "confidence": int (0-100),
                "details": str,
                "score_impact": int,
                "tags": List[str]
            }
        """
        pass

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "display_name": self.display_name,
            "status": self.status,
            "latency_ms": 12.5,
            "total_queries": self.total_queries,
            "cache_hits": self.cache_hits,
            "last_sync": self.last_sync,
            "is_enabled": self.is_enabled
        }
