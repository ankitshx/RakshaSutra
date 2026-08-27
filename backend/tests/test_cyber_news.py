"""
Test Suite for Cyber Threat News & Hourly Intelligence Feeds
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_cyber_news_feed():
    """Verify retrieval of hourly-synchronized cyber news articles."""
    res = client.get("/api/v1/cyber-news")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "articles" in data
    assert len(data["articles"]) > 0
    
    first = data["articles"][0]
    assert "id" in first
    assert "title" in first
    assert "source" in first
    assert "category" in first
    assert "severity" in first
    assert "summary" in first
    assert "url" in first
    assert "affected_systems" in first
    assert "mitigation_action" in first

def test_get_breaking_cyber_news():
    """Verify retrieval of top breaking cyber threat bulletins."""
    res = client.get("/api/v1/cyber-news/breaking?limit=3")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    assert len(data) > 0
    assert data[0]["severity"] in ["CRITICAL", "HIGH", "MEDIUM", "INFO"]

def test_cyber_news_category_and_search_filter():
    """Verify category and keyword filtering."""
    res = client.get("/api/v1/cyber-news?category=Zero-Day")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data["articles"], list)
    for art in data["articles"]:
        assert art["category"].lower() == "zero-day"

    search_res = client.get("/api/v1/cyber-news?search=CERT-In")
    assert search_res.status_code == 200
    sdata = search_res.json()
    assert isinstance(sdata["articles"], list)

def test_force_refresh_cyber_news():
    """Verify manual synchronization endpoint."""
    res = client.post("/api/v1/cyber-news/refresh")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "synced_articles_count" in data
