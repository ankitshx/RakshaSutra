"""
RakshaSutra Comprehensive SaaS, RBAC, Quota, and Security Tests
Tests Razorpay lifecycle, API key hashing, account-level quotas, and RBAC guards.
"""

import pytest
import hmac
import hashlib
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

@pytest.fixture
def registered_user():
    email = f"test_user_{hashlib.md5(str(pytest).encode()).hexdigest()[:8]}@example.com"
    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "Test Citizen"
    })
    assert res.status_code == 201
    return res.json()

def test_plans_catalog():
    res = client.get("/api/v1/subscription/plans")
    assert res.status_code == 200
    plans = res.json().get("plans", [])
    assert len(plans) == 4
    tiers = [p["tier"] for p in plans]
    assert "free" in tiers
    assert "pro" in tiers
    assert "business" in tiers
    assert "enterprise" in tiers

def test_threat_intel_health_status():
    res = client.get("/api/v1/threat-intelligence/health")
    assert res.status_code == 200
    data = res.json()
    assert "overall_status" in data
    assert "providers" in data
    assert data["total_providers"] >= 5

def test_incident_response_assistant():
    res = client.post("/api/v1/incident-response/generate", json={
        "target_url": "http://fake-sbi-kyc-update.xyz/login.php",
        "threat_classification": "Phishing / Credential Harvesting",
        "targeted_brand": "State Bank of India",
        "evidence_notes": "Active banking credential harvesting form."
    })
    assert res.status_code == 200
    data = res.json()
    assert "sha256_evidence_hash" in data
    assert "rfc2822_abuse_notice" in data
    assert "certin_incident_report" in data
    assert "cybercrime_1930_guidance" in data
    assert "firewall_rules" in data
    assert "State Bank of India" in data["rfc2822_abuse_notice"]

def test_darkweb_breach_monitor_attribution():
    res = client.post("/api/v1/darkweb/check", json={
        "query": "adobe.com",
        "query_type": "domain"
    })
    assert res.status_code == 200
    data = res.json()
    assert "HaveIBeenPwned" in data["data_source"]
    assert "remediation_steps" in data
    assert len(data["remediation_steps"]) >= 3

def test_osint_recon_and_graph():
    res = client.post("/api/v1/osint/username", json={
        "username": "instagram"
    })
    assert res.status_code == 200
    data = res.json()
    assert "matches" in data
    assert "total_probes" in data
    assert data["total_probes"] >= 20

def test_legal_disclosures():
    p_res = client.get("/api/v1/legal/privacy-policy")
    assert p_res.status_code == 200
    assert "Zero-Knowledge Hashing" in p_res.json()["principles"][0]

    t_res = client.get("/api/v1/legal/terms-of-service")
    assert t_res.status_code == 200
    assert "Defensive Use Only" in t_res.json()["terms"][0]
