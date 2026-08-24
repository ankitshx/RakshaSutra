"""
RakshaSutra Enterprise Observability & Prometheus Metrics Engine
High-performance, zero-external-dependency metrics collector compatible with Prometheus & Grafana.
"""

import time
import threading
from typing import Dict, List, Tuple
from collections import defaultdict

class MetricsCollector:
    def __init__(self):
        self._lock = threading.Lock()
        self.http_requests_total = defaultdict(int)  # (method, endpoint, status) -> count
        self.request_durations = []  # list of durations in seconds (last 5000)
        self.scans_total = defaultdict(int)  # (scan_type, verdict) -> count
        self.active_investigations = 0
        self.circuit_breaker_trips = defaultdict(int)  # (provider) -> count
        self.cache_hits_total = 0
        self.cache_misses_total = 0
        self.pii_redactions_total = defaultdict(int)  # (type) -> count
        self.copilot_explanations_total = defaultdict(int)  # (verdict) -> count
        self.copilot_confidence_bucket = defaultdict(int)  # (bucket) -> count
        self.start_time = time.time()

    def record_http_request(self, method: str, endpoint: str, status_code: int, duration_sec: float):
        with self._lock:
            # Normalize endpoint path to avoid cardinality explosion
            clean_endpoint = endpoint.split("?")[0]
            if "/api/v1/scans/" in clean_endpoint:
                clean_endpoint = "/api/v1/scans/:type"
            elif "/api/v1/investigations/" in clean_endpoint:
                clean_endpoint = "/api/v1/investigations/:id"
            elif "/api/v1/evidence/" in clean_endpoint:
                clean_endpoint = "/api/v1/evidence/:id"

            key = (method, clean_endpoint, str(status_code))
            self.http_requests_total[key] += 1
            
            if len(self.request_durations) > 5000:
                self.request_durations.pop(0)
            self.request_durations.append(duration_sec)

    def record_scan(self, scan_type: str, verdict: str):
        with self._lock:
            self.scans_total[(scan_type, verdict)] += 1

    def record_circuit_trip(self, provider: str):
        with self._lock:
            self.circuit_breaker_trips[provider] += 1

    def record_cache_hit(self):
        with self._lock:
            self.cache_hits_total += 1

    def record_cache_miss(self):
        with self._lock:
            self.cache_misses_total += 1

    def record_pii_redaction(self, pii_type: str, count: int = 1):
        with self._lock:
            self.pii_redactions_total[pii_type] += count

    def record_copilot_explanation(self, verdict: str, confidence_score: int):
        with self._lock:
            self.copilot_explanations_total[verdict] += 1
            if confidence_score >= 90:
                bucket = "90-100"
            elif confidence_score >= 70:
                bucket = "70-89"
            elif confidence_score >= 50:
                bucket = "50-69"
            else:
                bucket = "0-49"
            self.copilot_confidence_bucket[bucket] += 1

    def set_active_investigations(self, count: int):
        with self._lock:
            self.active_investigations = count

    def export_prometheus_text(self) -> str:
        """Export metrics formatted strictly according to Prometheus plaintext exposition format."""
        with self._lock:
            lines = [
                "# HELP rakshasutra_uptime_seconds Total uptime of RakshaSutra service in seconds.",
                "# TYPE rakshasutra_uptime_seconds gauge",
                f"rakshasutra_uptime_seconds {round(time.time() - self.start_time, 2)}",
                "",
                "# HELP rakshasutra_http_requests_total Total number of HTTP requests processed.",
                "# TYPE rakshasutra_http_requests_total counter"
            ]

            for (method, endpoint, status_code), count in self.http_requests_total.items():
                lines.append(f'rakshasutra_http_requests_total{{method="{method}",endpoint="{endpoint}",status="{status_code}"}} {count}')

            lines.extend([
                "",
                "# HELP rakshasutra_scans_total Total number of cybersecurity threat scans executed.",
                "# TYPE rakshasutra_scans_total counter"
            ])
            for (scan_type, verdict), count in self.scans_total.items():
                lines.append(f'rakshasutra_scans_total{{type="{scan_type}",verdict="{verdict}"}} {count}')

            lines.extend([
                "",
                "# HELP rakshasutra_active_investigations Current count of running asynchronous forensic investigations.",
                "# TYPE rakshasutra_active_investigations gauge",
                f"rakshasutra_active_investigations {self.active_investigations}",
                "",
                "# HELP rakshasutra_circuit_breaker_trips_total Total circuit breaker failover trips on threat intel feeds.",
                "# TYPE rakshasutra_circuit_breaker_trips_total counter"
            ])
            for provider, count in self.circuit_breaker_trips.items():
                lines.append(f'rakshasutra_circuit_breaker_trips_total{{provider="{provider}"}} {count}')

            lines.extend([
                "",
                "# HELP rakshasutra_cache_operations_total Cache hit and miss counters.",
                "# TYPE rakshasutra_cache_operations_total counter",
                f'rakshasutra_cache_operations_total{{result="hit"}} {self.cache_hits_total}',
                f'rakshasutra_cache_operations_total{{result="miss"}} {self.cache_misses_total}',
                "",
                "# HELP rakshasutra_pii_redactions_total Total PII instances scrubbed before persistence.",
                "# TYPE rakshasutra_pii_redactions_total counter"
            ])
            for pii_type, count in self.pii_redactions_total.items():
                lines.append(f'rakshasutra_pii_redactions_total{{type="{pii_type}"}} {count}')

            lines.extend([
                "",
                "# HELP rakshasutra_copilot_explanations_total Total RakshaAI Copilot explanations generated by verdict.",
                "# TYPE rakshasutra_copilot_explanations_total counter"
            ])
            for verdict, count in self.copilot_explanations_total.items():
                lines.append(f'rakshasutra_copilot_explanations_total{{verdict="{verdict}"}} {count}')

            lines.extend([
                "",
                "# HELP rakshasutra_copilot_confidence_bucket Histogram bucket distribution of copilot confidence scores.",
                "# TYPE rakshasutra_copilot_confidence_bucket counter"
            ])
            for bucket, count in self.copilot_confidence_bucket.items():
                lines.append(f'rakshasutra_copilot_confidence_bucket{{range="{bucket}"}} {count}')

            # Latency summary
            if self.request_durations:
                avg_lat = sum(self.request_durations) / len(self.request_durations)
                max_lat = max(self.request_durations)
                lines.extend([
                    "",
                    "# HELP rakshasutra_http_request_duration_seconds Average and max request duration in seconds.",
                    "# TYPE rakshasutra_http_request_duration_seconds gauge",
                    f'rakshasutra_http_request_duration_seconds{{quantile="avg"}} {round(avg_lat, 4)}',
                    f'rakshasutra_http_request_duration_seconds{{quantile="max"}} {round(max_lat, 4)}'
                ])

            return "\n".join(lines) + "\n"

metrics = MetricsCollector()
