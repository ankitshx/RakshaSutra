"""
RakshaSutra Enterprise Circuit Breaker & Anti-Ban Resiliency Layer
Protects external threat feeds (VirusTotal, URLhaus, crt.sh, PhishTank)
from cascading socket timeouts, rate limit bans, and transient cloud outages.
"""

import time
import random
import asyncio
from typing import Callable, Any, Dict

class CircuitState:
    CLOSED = "CLOSED"      # Normal operation
    OPEN = "OPEN"          # Failing, fast-fallback to local heuristics
    HALF_OPEN = "HALF_OPEN"# Testing single probe request

class ThreatFeedCircuitBreaker:
    def __init__(
        self,
        name: str,
        failure_threshold: int = 3,
        recovery_timeout: float = 30.0,
        half_open_success_threshold: int = 2
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_success_threshold = half_open_success_threshold
        
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = 0.0
        self._lock = asyncio.Lock()

    async def can_execute(self) -> bool:
        async with self._lock:
            now = time.time()
            if self.state == CircuitState.OPEN:
                if now - self.last_failure_time >= self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    self.success_count = 0
                    return True
                return False
            return True

    async def record_success(self):
        async with self._lock:
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.half_open_success_threshold:
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
            elif self.state == CircuitState.CLOSED:
                self.failure_count = 0

    async def record_failure(self):
        async with self._lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "state": self.state,
            "failure_count": self.failure_count,
            "last_failure_time": self.last_failure_time
        }

class CircuitBreakerRegistry:
    def __init__(self):
        self._breakers: Dict[str, ThreatFeedCircuitBreaker] = {}

    def get_breaker(self, name: str) -> ThreatFeedCircuitBreaker:
        if name not in self._breakers:
            self._breakers[name] = ThreatFeedCircuitBreaker(name=name)
        return self._breakers[name]

circuit_breaker_registry = CircuitBreakerRegistry()
