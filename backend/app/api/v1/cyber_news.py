"""
API endpoints for Cyber Threat News & Hourly Security Dispatches
"""

from typing import Optional
from fastapi import APIRouter, Query, BackgroundTasks
from app.services.cyber_news_service import cyber_news_service

router = APIRouter(prefix="/cyber-news", tags=["Cyber Threat News & Hourly Dispatches"])

@router.get("")
async def get_cyber_news(
    category: Optional[str] = Query(None, description="Filter by category (Zero-Day, Ransomware, Phishing, Advisory, Data Breach, AI Threats)"),
    search: Optional[str] = Query(None, description="Search query in titles and summaries"),
    limit: int = Query(30, ge=1, le=100)
):
    """
    Retrieve latest hourly-synchronized cybersecurity intelligence news,
    CISA/CERT-In advisories, zero-day alerts, and vendor patch bulletins.
    """
    return await cyber_news_service.get_latest_news(category=category, search=search, limit=limit)

@router.get("/breaking")
def get_breaking_cyber_news(limit: int = Query(5, ge=1, le=10)):
    """
    Retrieve top critical and breaking cyber threat bulletins for real-time tickers and command center alerts.
    """
    return cyber_news_service.get_breaking_news(limit=limit)

@router.post("/refresh")
async def force_refresh_news(background_tasks: BackgroundTasks):
    """
    Force manual synchronization of all global RSS threat intelligence feeds.
    """
    count = await cyber_news_service.sync_rss_feeds()
    return {
        "status": "success",
        "message": f"Successfully synchronized hourly threat news. Total indexed articles: {count}",
        "synced_articles_count": count
    }
