"""
RakshaSutra Security Posture, Frameworks & Admin SOC Controls Test Suite
Tests security score dimensions, NIST CSF 2.0 / OWASP compliance,
admin telemetry, user role updates, and custom IOC blacklist rule lifecycle.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def admin_headers():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@rakshasutra.org",
        "password": "Admin@12345"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_security_score_and_dimensions():
    res = client.get("/api/v1/security/score")
    assert res.status_code == 200
    data = res.json()
    assert "overall_score" in data
    assert 0 <= data["overall_score"] <= 100
    assert "dimensions" in data
    dims = data["dimensions"]
    assert "account_security" in dims
    assert "password_exposure" in dims
    assert "browser_protection" in dims
    assert "threat_history" in dims
    assert "privacy_controls" in dims

def test_nist_csf_functions():
    res = client.get("/api/v1/security/nist-posture")
    assert res.status_code == 200
    nist = res.json()
    assert "functions" in nist
    function_names = [f["name"] for f in nist["functions"]]
    assert any("Govern" in fn for fn in function_names)
    assert any("Identify" in fn for fn in function_names)
    assert any("Protect" in fn for fn in function_names)
    assert any("Detect" in fn for fn in function_names)
    assert any("Respond" in fn for fn in function_names)
    assert any("Recover" in fn for fn in function_names)

def test_admin_system_health(admin_headers):
    res = client.get("/api/v1/admin/system-health", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "OPERATIONAL"
    assert "cpu_usage_pct" in data
    assert "memory_usage_pct" in data
    assert data["database_connected"] is True

def test_admin_users_list_and_events(admin_headers):
    # 1. Users list
    users_res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) >= 2

    # 2. Security events list
    events_res = client.get("/api/v1/admin/security-events", headers=admin_headers)
    assert events_res.status_code == 200
    assert isinstance(events_res.json(), list)

def test_admin_ioc_rules_lifecycle(admin_headers):
    test_domain = "malicious-apt-threat-test.top"
    
    # 1. Add IOC rule
    add_res = client.post(
        "/api/v1/admin/ioc-rules",
        headers=admin_headers,
        json={
            "ioc_type": "domain",
            "ioc_value": test_domain,
            "threat_category": "Phishing",
            "confidence": 99,
            "description": "Blacklisted test malware domain",
            "tags": ["apt-lure", "custom-block"]
        }
    )
    assert add_res.status_code == 200
    ioc_id = add_res.json()["id"]

    # 2. List IOC rules
    list_res = client.get("/api/v1/admin/ioc-rules", headers=admin_headers)
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["ioc_value"] == test_domain for i in items)

    # 3. Delete IOC rule
    del_res = client.delete(f"/api/v1/admin/ioc-rules/{ioc_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert "deleted successfully" in del_res.json()["message"]
