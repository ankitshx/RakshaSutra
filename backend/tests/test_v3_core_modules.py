"""
RakhshaSutra v3.0 — Core Digital Defense OS Automated Test Suite
Tests Attack Surface Management (ASM), Vulnerability Intelligence (CVE),
Centralized Alert Pipeline, SOC Incident Response, Universal Search,
Security Reports, Automation Rules, and Multi-Tenancy RBAC 2.0.
"""

import uuid
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

# 1. Attack Surface Management (ASM) & Graph Tests
def test_asm_asset_lifecycle_and_graph(admin_headers):
    unique_name = f"payment-gw-{uuid.uuid4().hex[:6]}.rakshasutra.org"
    # Create an asset
    create_res = client.post(
        "/api/v1/assets",
        headers=admin_headers,
        json={
            "name": unique_name,
            "asset_type": "api_endpoint",
            "environment": "production",
            "criticality": "CRITICAL",
            "technologies": ["FastAPI", "Razorpay SDK", "Cloudflare WAF"],
            "tags": ["pci-scope", "fintech"]
        }
    )
    assert create_res.status_code == 201
    asset_id = create_res.json()["id"]

    # List assets
    list_res = client.get("/api/v1/assets")
    assert list_res.status_code == 200
    assets = list_res.json()
    assert any(a["id"] == asset_id for a in assets)

    # Get asset detail
    detail_res = client.get(f"/api/v1/assets/{asset_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["name"] == unique_name

    # Get Security Asset Graph
    graph_res = client.get("/api/v1/assets/graph")
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert "nodes" in graph_data
    assert "edges" in graph_data
    assert any(n["id"] == asset_id for n in graph_data["nodes"])

    # Passive Discovery
    discover_res = client.post(
        "/api/v1/assets/discover",
        headers=admin_headers,
        json={"seed_domain": "rakshasutra.org"}
    )
    assert discover_res.status_code == 200
    assert discover_res.json()["status"] == "success"

# 2. Vulnerability Intelligence Center Tests
def test_vulnerability_intelligence_and_asset_mapping(admin_headers):
    # List vulnerabilities
    vulns_res = client.get("/api/v1/vulnerabilities")
    assert vulns_res.status_code == 200
    vulns = vulns_res.json()
    assert len(vulns) >= 2
    cve_id = vulns[0]["id"]

    # Get single vulnerability detail
    single_res = client.get(f"/api/v1/vulnerabilities/{cve_id}")
    assert single_res.status_code == 200
    assert single_res.json()["id"] == cve_id

    # Get an asset to map
    assets_res = client.get("/api/v1/assets")
    asset_id = assets_res.json()[0]["id"]

    # Map vulnerability to asset
    map_res = client.post(
        "/api/v1/vulnerabilities/map-asset",
        headers=admin_headers,
        json={
            "asset_id": asset_id,
            "cve_id": cve_id,
            "detected_version": "1.0.0",
            "remediation_notes": "Identified in automated container scan."
        }
    )
    assert map_res.status_code == 200
    mapping_id = map_res.json()["id"]

    # Update remediation status
    update_res = client.put(
        f"/api/v1/vulnerabilities/asset-mappings/{mapping_id}/status",
        headers=admin_headers,
        json={"status": "INVESTIGATING", "remediation_notes": "Assigned to SRE for patch deployment."}
    )
    assert update_res.status_code == 200
    assert "status updated" in update_res.json()["message"].lower()

# 3. Centralized Alert Pipeline Tests
def test_alerts_pipeline_and_triage(admin_headers):
    # Create Alert
    alert_res = client.post(
        "/api/v1/alerts",
        headers=admin_headers,
        json={
            "title": "Unusual DNS Query Spike on auth.rakshasutra.org",
            "alert_type": "ANOMALY_TRAFFIC",
            "severity": "HIGH",
            "description": "High frequency DNS queries observed matching potential subdomain brute-force.",
            "source": "Network Sensor",
            "recommended_action": "Enable Cloudflare Under Attack mode on DNS zone."
        }
    )
    assert alert_res.status_code == 201
    alert_id = alert_res.json()["id"]

    # List Alerts
    list_res = client.get("/api/v1/alerts")
    assert list_res.status_code == 200
    alerts = list_res.json()
    assert any(a["id"] == alert_id for a in alerts)

    # Update Alert Status
    triage_res = client.put(
        f"/api/v1/alerts/{alert_id}/status",
        headers=admin_headers,
        json={"status": "ACKNOWLEDGED"}
    )
    assert triage_res.status_code == 200
    assert "acknowledged" in triage_res.json()["message"].lower()

    # Alerts Summary Metrics
    metrics_res = client.get("/api/v1/alerts/metrics/summary")
    assert metrics_res.status_code == 200
    assert "total_alerts" in metrics_res.json()

# 4. SOC Incident Response Center Tests
def test_soc_incident_lifecycle(admin_headers):
    # Declare Incident
    create_res = client.post(
        "/api/v1/incidents",
        headers=admin_headers,
        json={
            "title": "Credential Harvest Campaign via Typo Domain (rakshasutra-auth.top)",
            "classification": "Phishing Attempt",
            "severity": "HIGH",
            "summary": "Active phishing campaign attempting to harvest customer login credentials.",
            "affected_assets": ["auth.rakshasutra.org"],
            "ioc_indicators": ["rakshasutra-auth.top", "198.51.100.88"],
            "defensive_playbook_id": "phishing_click_response"
        }
    )
    assert create_res.status_code == 201
    incident_id = create_res.json()["id"]

    # Get Incident Detail
    detail_res = client.get(f"/api/v1/incidents/{incident_id}")
    assert detail_res.status_code == 200
    inc_data = detail_res.json()
    assert inc_data["id"] == incident_id
    assert len(inc_data["containment_checklist"]) >= 3

    # Add Analyst Note
    note_res = client.post(
        f"/api/v1/incidents/{incident_id}/notes",
        headers=admin_headers,
        json={"note": "Confirmed domain host is Cloudflare; abuse report dispatched."}
    )
    assert note_res.status_code == 200

    # Update Incident Status to Contained
    status_res = client.put(
        f"/api/v1/incidents/{incident_id}/status",
        headers=admin_headers,
        json={"status": "CONTAINED"}
    )
    assert status_res.status_code == 200

# 5. Universal Search Engine (Ctrl + K) Tests
def test_universal_security_search():
    res = client.get("/api/v1/search?q=rakshasutra")
    assert res.status_code == 200
    data = res.json()
    assert "categories" in data
    assert "assets" in data["categories"]
    assert data["total_matches"] >= 1

# 6. Security Report Generator Tests
def test_security_report_generator(admin_headers):
    res = client.post(
        "/api/v1/reports/generate",
        headers=admin_headers,
        json={
            "title": "Q3 2026 Executive Security Assessment",
            "report_type": "EXECUTIVE_SUMMARY",
            "target_scope": "Global Digital Infrastructure"
        }
    )
    assert res.status_code == 201
    report_data = res.json()
    assert "id" in report_data
    assert "content_markdown" in report_data
    assert report_data["overall_posture_score"] > 0

    # List reports
    list_res = client.get("/api/v1/reports")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

# 7. Security Automation Rules Tests
def test_automation_rules_lifecycle(admin_headers):
    create_res = client.post(
        "/api/v1/automation",
        headers=admin_headers,
        json={
            "name": "Auto-Create Incident on Critical Alert",
            "description": "Automatically open high-priority incident when a CRITICAL severity alert triggers.",
            "trigger_type": "ON_CRITICAL_ALERT",
            "conditions": {"min_severity": "CRITICAL"},
            "actions": [{"action": "CREATE_INCIDENT", "severity": "CRITICAL"}]
        }
    )
    assert create_res.status_code == 201
    rule_id = create_res.json()["id"]

    # Toggle Rule
    toggle_res = client.put(
        f"/api/v1/automation/{rule_id}/toggle",
        headers=admin_headers,
        json={"is_enabled": False}
    )
    assert toggle_res.status_code == 200

    # List Rules
    list_res = client.get("/api/v1/automation")
    assert list_res.status_code == 200
    assert any(r["id"] == rule_id for r in list_res.json())

# 8. Multi-Tenancy & RBAC 2.0 Organization Tests
def test_organization_and_rbac_matrix(admin_headers):
    # Current organization
    org_res = client.get("/api/v1/organizations/current", headers=admin_headers)
    assert org_res.status_code == 200
    org_data = org_res.json()
    assert "permissions" in org_data
    assert "scan:create" in org_data["permissions"]

    # RBAC 2.0 permissions matrix
    matrix_res = client.get("/api/v1/organizations/roles/permissions-matrix")
    assert matrix_res.status_code == 200
    matrix = matrix_res.json()
    assert "owner" in matrix["roles"]
    assert "analyst" in matrix["roles"]
    assert "developer" in matrix["roles"]
