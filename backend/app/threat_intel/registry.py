import asyncio
from typing import Dict, List, Any
from app.threat_intel.base import ThreatIntelProvider
from app.threat_intel.urlhaus import URLhausProvider
from app.threat_intel.virustotal import VirusTotalProvider, AbuseIPDBProvider

class ThreatIntelRegistry:
    """Registry managing all external and local threat intelligence engines."""

    def __init__(self):
        self.providers: Dict[str, ThreatIntelProvider] = {
            "urlhaus": URLhausProvider(),
            "virustotal": VirusTotalProvider(),
            "abuseipdb": AbuseIPDBProvider(),
        }

    async def query_all(self, target: str, target_type: str) -> Dict[str, Any]:
        """
        Query all enabled providers asynchronously in parallel.
        """
        tasks = []
        provider_names = []
        for name, provider in self.providers.items():
            if provider.is_enabled:
                tasks.append(provider.query_target(target, target_type))
                provider_names.append(name)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        hits = []
        max_score_impact = 0
        all_tags = set()
        matched_categories = []

        for i, res in enumerate(results):
            if isinstance(res, dict) and res.get("found"):
                hits.append(res)
                impact = res.get("score_impact", 0)
                if impact > max_score_impact:
                    max_score_impact = impact
                if res.get("threat_category"):
                    matched_categories.append(res["threat_category"])
                for t in res.get("tags", []):
                    all_tags.add(t)

        return {
            "has_threat_intel_hit": len(hits) > 0,
            "hits_count": len(hits),
            "hits": hits,
            "max_score_impact": min(max_score_impact, 40),
            "matched_categories": matched_categories,
            "tags": list(all_tags),
            "providers_checked": provider_names
        }

    def get_all_provider_statuses(self) -> List[Dict[str, Any]]:
        return [p.get_status() for p in self.providers.values()]

threat_intel_registry = ThreatIntelRegistry()
