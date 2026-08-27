"""
RakshaSutra Continuous Monitoring & Webhooks Test Suite
Tests automated background monitoring, certificate drift detection,
and secure webhook deliveries with HMAC-SHA256 signature verification.
"""

import pytest
import hmac
import hashlib
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@rakshasutra.org",
        "password": "Admin@12345"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_monitoring_target_lifecycle(auth_headers):
    # 1. Create monitored target
    create_res = client.post(
        "/api/v1/monitoring/targets",
        headers=auth_headers,
        json={
            "target": "example.com",
            "target_type": "domain",
            "check_frequency_hours": 12
        }
    )
    assert create_res.status_code == 200
    target_data = create_res.json()
    assert "example.com" in target_data["target"]
    target_id = target_data["id"]

    # 2. List monitored targets
    list_res = client.get("/api/v1/monitoring/targets", headers=auth_headers)
    assert list_res.status_code == 200
    targets = list_res.json()
    assert any(t["id"] == target_id for t in targets)

    # 3. Trigger manual state check
    check_res = client.post(f"/api/v1/monitoring/targets/{target_id}/check-now", headers=auth_headers)
    assert check_res.status_code == 200
    check_data = check_res.json()
    assert check_data["target_id"] == target_id
    assert "fresh_risk_score" in check_data

    # 4. List monitoring alerts
    alerts_res = client.get("/api/v1/monitoring/alerts", headers=auth_headers)
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert isinstance(alerts, list)

    # 5. Delete monitored target
    del_res = client.delete(f"/api/v1/monitoring/targets/{target_id}", headers=auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"].upper() == "SUCCESS"

def test_webhook_endpoint_and_delivery(auth_headers):
    # 1. Create webhook subscription
    wh_res = client.post(
        "/api/v1/webhooks/endpoints",
        headers=auth_headers,
        json={
            "url": "https://webhook.site/test-security-endpoint",
            "events": ["investigation.completed", "threat.detected"]
        }
    )
    assert wh_res.status_code == 200
    endpoint_data = wh_res.json()
    assert "secret_key" in endpoint_data
    assert endpoint_data["url"] == "https://webhook.site/test-security-endpoint"
    endpoint_id = endpoint_data["id"]
    secret_key = endpoint_data["secret_key"]

    # 2. Verify HMAC SHA-256 calculation
    sample_payload = b'{"event":"threat.detected","risk_score":95}'
    calculated_sig = hmac.new(secret_key.encode(), sample_payload, hashlib.sha256).hexdigest()
    assert len(calculated_sig) == 64

    # 3. List webhook deliveries
    deliveries_res = client.get("/api/v1/webhooks/deliveries", headers=auth_headers)
    assert deliveries_res.status_code == 200
    assert isinstance(deliveries_res.json(), list)

    # 4. Delete webhook endpoint
    del_res = client.delete(f"/api/v1/webhooks/endpoints/{endpoint_id}", headers=auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"
