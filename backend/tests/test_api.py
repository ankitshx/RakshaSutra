import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["service"] == "RakshaSutra"
    assert data["status"] == "healthy"

def test_auth_registration_and_login():
    unique_email = "test_cyber_user_2026@example.com"
    # Register
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": "Password12345!Secure",
        "full_name": "Test Security User"
    })
    # Either 201 or 400 (if already exists)
    assert reg_resp.status_code in (201, 400)

    # Login
    login_resp = client.post("/api/v1/auth/login", json={
        "email": unique_email,
        "password": "Password12345!Secure"
    })
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == unique_email

def test_ssrf_blocked_in_url_scan():
    resp = client.post("/api/v1/scans/url", json={
        "url": "http://127.0.0.1:8080/admin/secrets"
    })
    assert resp.status_code == 400
    detail = resp.json()["detail"]
    assert "SSRF" in detail["message"] or "blocked" in detail["message"]

def test_message_scan_endpoint():
    resp = client.post("/api/v1/scans/message", json={
        "channel": "sms",
        "content": "Alert: Your power bill is unpaid. Electricity will be cut tonight at 9 PM. Call officer at 9876543210 immediately."
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_score"] > 50
    assert len(data["indicators"]) > 0

def test_dashboard_endpoint():
    resp = client.get("/api/v1/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_scans" in data
    assert "risk_distribution" in data
