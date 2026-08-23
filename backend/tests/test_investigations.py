import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_threat_intel_health_endpoint():
    """Verify threat intelligence health endpoint returns live status for all engines."""
    res = client.get("/api/v1/threat-intelligence/health")
    assert res.status_code == 200
    data = res.json()
    assert "overall_status" in data
    assert "total_providers" in data
    assert data["total_providers"] >= 5
    assert len(data["providers"]) >= 5
    for p in data["providers"]:
        assert "name" in p
        assert "status" in p
        assert p["status"] in ["OPERATIONAL", "DEGRADED", "UNAVAILABLE", "RATE_LIMITED", "NOT_CONFIGURED"]

def test_investigation_creation_and_dossier():
    """Verify full evidence-driven investigation flow, ID generation, and dossier retrieval."""
    res = client.post("/api/v1/investigations/create", json={"target": "http://example.com"})
    assert res.status_code == 200
    data = res.json()
    assert "investigation_id" in data
    assert data["investigation_id"].startswith("RS-INV-")
    assert "risk_score" in data
    assert "confidence_score" in data
    assert "findings" in data
    assert "timeline" in data
    assert "relationship_graph" in data

    inv_id = data["investigation_id"]
    
    # Retrieve dossier
    dossier_res = client.get(f"/api/v1/investigations/{inv_id}")
    assert dossier_res.status_code == 200
    dossier = dossier_res.json()
    assert dossier["investigation_id"] == inv_id
    assert dossier["risk_level"] in ["SAFE", "CAUTION", "DANGER"]

    # Export JSON
    export_res = client.get(f"/api/v1/investigations/{inv_id}/dossier/json")
    assert export_res.status_code == 200
    assert "application/json" in export_res.headers["content-type"]

def test_investigation_brand_impersonation_detection():
    """Verify brand impersonation detection on typosquatted target."""
    res = client.post("/api/v1/investigations/create", json={"target": "http://sbi-banking-update.xyz/login.php"})
    assert res.status_code == 200
    data = res.json()
    assert data["risk_score"] > 30
    assert any("Impersonation" in f["title"] or "Brand" in f["category"] for f in data["findings"])

def test_personal_security_score_and_passport():
    """Verify personal security score and Security Passport generation."""
    res = client.get("/api/v1/security/score")
    assert res.status_code == 200
    score = res.json()
    assert 0 <= score["overall_score"] <= 100
    assert "dimensions" in score
    assert "account_security" in score["dimensions"]

    passport_res = client.get("/api/v1/security/passport")
    assert passport_res.status_code == 200
    passport = passport_res.json()
    assert passport["passport_id"].startswith("RS-PASS-")
    assert "verified_dimensions" in passport
    assert passport["k_anonymity_verified"] is True

def test_framework_alignments_nist_and_owasp():
    """Verify NIST CSF 2.0 and OWASP WSTG references."""
    nist_res = client.get("/api/v1/security/nist-posture")
    assert nist_res.status_code == 200
    nist = nist_res.json()
    assert "functions" in nist
    assert len(nist["functions"]) == 6

    owasp_res = client.get("/api/v1/security/owasp-wstg")
    assert owasp_res.status_code == 200
    owasp = owasp_res.json()
    assert "categories" in owasp
