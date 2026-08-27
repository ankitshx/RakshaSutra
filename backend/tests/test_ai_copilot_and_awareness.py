"""
RakshaSutra AI Copilot & Awareness Education Test Suite
Tests RakshaAI conversation, prompt fact-grounding, incident playbooks,
awareness training articles, and interactive scam quiz simulation.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_raksha_ai_chat_general():
    res = client.post("/api/v1/ai/chat", json={
        "message": "I clicked on a strange link asking for my bank OTP. What should I do right now?",
        "history": []
    })
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]) > 20
    assert "suggested_questions" in data

def test_raksha_ai_playbooks():
    # 1. List all playbooks
    list_res = client.get("/api/v1/ai/playbooks")
    assert list_res.status_code == 200
    playbooks = list_res.json()
    assert len(playbooks) >= 3
    pb_ids = [pb["id"] for pb in playbooks]
    assert "phishing_click_response" in pb_ids
    assert "financial_fraud_response" in pb_ids

    # 2. Get specific playbook
    single_res = client.get("/api/v1/ai/playbooks/phishing_click_response")
    assert single_res.status_code == 200
    pb = single_res.json()
    assert "Phishing" in pb["title"]
    assert len(pb["immediate_steps"]) >= 3

def test_awareness_modules_and_quiz():
    # 1. Articles
    art_res = client.get("/api/v1/awareness/articles")
    assert art_res.status_code == 200
    articles = art_res.json()
    assert len(articles) >= 3

    # 2. Get specific article
    slug = articles[0]["slug"]
    single_art = client.get(f"/api/v1/awareness/articles/{slug}")
    assert single_art.status_code == 200
    assert single_art.json()["slug"] == slug

    # 3. Quiz questions
    quiz_res = client.get("/api/v1/awareness/quiz")
    assert quiz_res.status_code == 200
    quiz = quiz_res.json()
    assert len(quiz) >= 3
    assert "scenario" in quiz[0]
    assert "options" in quiz[0]
    assert "explanation" in quiz[0]

    # 4. Checklists
    checklists_res = client.get("/api/v1/awareness/checklists")
    assert checklists_res.status_code == 200
    checklists = checklists_res.json()
    assert len(checklists) >= 2
