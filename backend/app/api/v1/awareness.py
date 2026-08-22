from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.services.awareness_service import AWARENESS_ARTICLES, PHISHING_QUIZ_QUESTIONS, SECURITY_CHECKLISTS

router = APIRouter(prefix="/awareness", tags=["Security Awareness Center"])

@router.get("/articles")
def get_articles():
    """Retrieve all cybersecurity awareness learning modules."""
    return AWARENESS_ARTICLES

@router.get("/articles/{slug}")
def get_article_by_slug(slug: str):
    """Retrieve full content of a specific awareness article."""
    for art in AWARENESS_ARTICLES:
        if art["slug"] == slug:
            return art
    raise HTTPException(status_code=404, detail="Awareness article not found.")

@router.get("/quiz")
def get_quiz_questions():
    """Retrieve interactive phishing and scam simulation quiz questions."""
    return PHISHING_QUIZ_QUESTIONS

@router.get("/checklists")
def get_security_checklists():
    """Retrieve essential security hygiene checklists."""
    return SECURITY_CHECKLISTS
