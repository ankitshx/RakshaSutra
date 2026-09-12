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

def test_super_admin_upgrade_advisor_access_and_execution():
    # 1. Non-super admin is rejected
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@rakshasutra.org",
        "password": "Admin@12345"
    })
    admin_token = admin_login.json()["access_token"]
    forbidden_res = client.get("/api/v1/admin/upgrade-advisor", headers={"Authorization": f"Bearer {admin_token}"})
    assert forbidden_res.status_code == 403
    assert "restricted exclusively to Super Administrators" in forbidden_res.json()["detail"]

    # 2. Super admin succeeds
    super_login = client.post("/api/v1/auth/login", json={
        "email": "superadmin@rakshasutra.org",
        "password": "SuperAdmin@12345"
    })
    assert super_login.status_code == 200
    super_token = super_login.json()["access_token"]
    super_headers = {"Authorization": f"Bearer {super_token}"}

    advisor_res = client.get("/api/v1/admin/upgrade-advisor", headers=super_headers)
    assert advisor_res.status_code == 200
    adv_data = advisor_res.json()
    assert adv_data["status"] == "UPGRADE_ADVISOR_ACTIVE"
    assert adv_data["target_audience"] == "SUPER_ADMINISTRATOR_ONLY"
    assert "readiness_score" in adv_data
    assert "upgrade_categories" in adv_data
    assert len(adv_data["upgrade_categories"]) >= 3

    # 3. Super admin executes upgrade action
    exec_res = client.post(
        "/api/v1/admin/upgrade-advisor/execute",
        headers=super_headers,
        json={"action_id": "update_heuristics_dictionary"}
    )
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["success"] is True
    assert "Heuristics Dictionary" in exec_data["message"]
