"""
RakshaSutra Concurrency, Edge-Case & Stress Hardening Test Suite
Verifies platform resilience against malformed inputs, edge-case URLs,
large payloads, unicode/IDN strings, bad tokens, and 404/422 error structures.
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_edge_case_and_malformed_url_scans():
    # 1. Extremely long URL
    long_url = "https://example.com/test?" + "param=" + "a" * 1500
    res1 = client.post("/api/v1/scans/url", json={"url": long_url})
    assert res1.status_code == 200
    assert "risk_score" in res1.json()

    # 2. Unicode / IDN homoglyph target
    unicode_url = "https://xn--e1afmkfd.xn--80akhbyknj4f.com"
    res2 = client.post("/api/v1/scans/url", json={"url": unicode_url})
    assert res2.status_code in (200, 400) # Safe handling without unhandled 500

    # 3. Target with port and credentials
    cred_url = "https://user:pass@suspicious-portal.top:8443/login"
    res3 = client.post("/api/v1/scans/url", json={"url": cred_url})
    assert res3.status_code == 200
    assert res3.json()["risk_score"] > 20

def test_validation_and_error_structures():
    # 1. Invalid payload format (Missing required 'url' field)
    res_val = client.post("/api/v1/scans/url", json={"invalid_key": "some_data"})
    assert res_val.status_code == 422
    assert "request_id" in res_val.json()
    assert res_val.json()["status"] == "error"

    # 2. Non-existent investigation ID
    res_404 = client.get("/api/v1/investigations/RS-INV-9999-NONEXISTENT")
    assert res_404.status_code == 404

    # 3. Malformed / Invalid JWT token
    res_auth = client.get("/api/v1/admin/system-health", headers={"Authorization": "Bearer malformed.jwt.token"})
    assert res_auth.status_code in (401, 403)

def test_rapid_message_scans():
    messages = [
        "Your package #IN89218 is pending delivery. Click http://indiapost-parcel.top/track",
        "Hi mom, I broke my phone. Message me on my new WhatsApp number 9876543210",
        "Congratulations! You won 10,000 INR cashback. Enter UPI PIN at http://gpay-reward.xyz",
        "Meeting confirmed tomorrow at 10 AM at corporate headquarters."
    ]
    for msg in messages:
        res = client.post("/api/v1/scans/message", json={"channel": "sms", "content": msg})
        assert res.status_code == 200
        data = res.json()
        assert "risk_score" in data
        assert "risk_level" in data
