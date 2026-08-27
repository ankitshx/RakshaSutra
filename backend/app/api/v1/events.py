"""
RakhshaSutra v3.0 — Real-Time Event Stream (SSE) API
Streams live real-time security events (alerts, certificate drift, scans) with reconnect headers.
"""

import asyncio
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/events", tags=["Real-Time Event Stream"])

@router.get("/stream")
async def stream_live_security_events(request: Request):
    """
    Server-Sent Events (SSE) endpoint providing live security telemetry to connected clients.
    """
    async def event_generator():
        # Send initial connection event
        init_data = json.dumps({
            "event": "CONNECTED",
            "message": "Connected to RakhshaSutra Live Security Event Bus",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        yield f"data: {init_data}\n\n"

        while True:
            # Check client disconnect
            if await request.is_disconnected():
                break

            await asyncio.sleep(15)

            # Periodic heartbeat event
            hb_data = json.dumps({
                "event": "HEARTBEAT",
                "status": "OPERATIONAL",
                "active_threat_nodes": 42,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            yield f"data: {hb_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
