"""
RakshaSutra Enterprise Honeytoken & Active Deception Test Suite
Tests honeytoken generation, canary traps (AWS key, DB, Web), tripwire webhook execution,
and intruder telemetry collection.
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

def test_honeytoken_creation_and_listing(admin_headers):
    # 1. Create AWS Decoy Key
    aws_res = client.post(
        "/api/v1/deception/tokens/create",
        headers=admin_headers,
        json={
            "token_type": "decoy_aws_key",
            "memo": "Test AWS Decoy in GitHub Repo"
        }
    )
    assert aws_res.status_code == 200
    aws_data = aws_res.json()
    assert "AKIA" in aws_data["decoy_payload"]["AWS_ACCESS_KEY_ID"]
    token_id = aws_data["id"]

    # 2. Create DB Decoy Credential
    db_res = client.post(
        "/api/v1/deception/tokens/create",
        headers=admin_headers,
        json={
            "token_type": "fake_db_credential",
            "memo": "Test PostgreSQL Fake Credential"
        }
    )
    assert db_res.status_code == 200
    db_data = db_res.json()
    assert "postgres://" in db_data["decoy_payload"]["DATABASE_URL"]

    # 3. List active honeytokens
    list_res = client.get("/api/v1/deception/tokens/list", headers=admin_headers)
    assert list_res.status_code == 200
    tokens = list_res.json()
    assert any(t["id"] == token_id for t in tokens)

    # 4. Trip canary webhook
    trip_res = client.get(f"/api/v1/deception/ping/{token_id}", headers={"User-Agent": "Nmap-Scout/7.94"})
    assert trip_res.status_code == 200
    assert trip_res.headers["content-type"] == "image/gif"

    # 5. Verify token status is tripped
    updated_list_res = client.get("/api/v1/deception/tokens/list", headers=admin_headers)
    assert updated_list_res.status_code == 200
    tripped_token = next(t for t in updated_list_res.json() if t["id"] == token_id)
    assert tripped_token["is_tripped"] is True
    assert tripped_token["trip_count"] >= 1
    assert len(tripped_token["intrusions"]) >= 1
