"""
RakhshaSutra v3.0 — Security Reports & Dossier Generation API
Generates executive summaries, assessment reports, and forensic dossier exports.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.security_report import SecurityReport
from app.models.asset import Asset
from app.models.vulnerability import Vulnerability
from app.models.alert_and_incident import SecurityAlert, SecurityIncident

router = APIRouter(prefix="/reports", tags=["Security Report Generator"])

class GenerateReportRequest(BaseModel):
    title: str
    report_type: str = Field(..., description="EXECUTIVE_SUMMARY, SECURITY_ASSESSMENT, PHISHING_DOSSIER, ATTACK_SURFACE, VULNERABILITY_AUDIT, INCIDENT_POSTMORTEM")
    target_scope: Optional[str] = "Entire Organization"

@router.get("", response_model=List[Dict[str, Any]])
def list_reports(
    report_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List all generated security reports."""
    query = db.query(SecurityReport)
    if report_type:
        query = query.filter(SecurityReport.report_type == report_type.upper())
    reports = query.order_by(SecurityReport.created_at.desc()).all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "report_type": r.report_type,
            "summary": r.summary,
            "target_scope": r.target_scope,
            "overall_posture_score": r.overall_posture_score,
            "findings_summary": r.findings_summary or {},
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in reports
    ]

@router.post("/generate", status_code=status.HTTP_201_CREATED)
def generate_security_report(
    req: GenerateReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a formal markdown / structured security report from live telemetry."""
    # Gather live telemetry metrics
    assets = db.query(Asset).all()
    vulns = db.query(Vulnerability).all()
    alerts = db.query(SecurityAlert).all()
    incidents = db.query(SecurityIncident).all()

    crit_alerts = len([a for a in alerts if a.severity == "CRITICAL"])
    high_alerts = len([a for a in alerts if a.severity == "HIGH"])
    crit_vulns = len([v for v in vulns if v.severity == "CRITICAL"])
    high_vulns = len([v for v in vulns if v.severity == "HIGH"])

    posture_score = max(35, 100 - (crit_alerts * 15 + high_alerts * 8 + crit_vulns * 10))

    findings_summary = {
        "critical_findings": crit_alerts + crit_vulns,
        "high_findings": high_alerts + high_vulns,
        "total_assets": len(assets),
        "total_incidents": len(incidents),
        "posture_score": posture_score
    }

    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y %H:%M UTC")

    markdown_content = f"""# 🛡️ RakhshaSutra Security Report: {req.title}

**Report Classification:** DEFENSIVE SECURITY ASSIGNMENT  
**Generated On:** {now_str}  
**Target Scope:** {req.target_scope}  
**Author / SOC Lead:** {current_user.email}  
**Overall Security Posture Score:** {posture_score} / 100  

---

## 1. Executive Summary

During this assessment period, RakhshaSutra evaluated **{len(assets)} digital assets** and aggregated multi-vector telemetry across DNS, TLS, threat intelligence feeds, and vulnerability databases.

- **Overall Posture:** {"🟢 ROBUST" if posture_score >= 80 else ("🟡 ATTENTION REQUIRED" if posture_score >= 60 else "🔴 CRITICAL RISK")}
- **Active Incidents:** {len(incidents)}
- **Critical Alerts:** {crit_alerts}
- **High-Risk Vulnerabilities:** {crit_vulns + high_vulns}

---

## 2. Key Findings & Breakdown

| Category | Count | Status |
| :--- | :--- | :--- |
| **Monitored Assets** | {len(assets)} | Protected |
| **Critical Findings** | {findings_summary["critical_findings"]} | {"Action Required" if findings_summary["critical_findings"] > 0 else "Clean"} |
| **High Findings** | {findings_summary["high_findings"]} | {"Under Investigation" if findings_summary["high_findings"] > 0 else "Clean"} |
| **Active SOC Incidents** | {len(incidents)} | Monitored |

---

## 3. Recommended Remediation Roadmap

1. **Contain High-Severity Findings:** Review open alerts in the Alerts Center and verify certificate renewal schedules.
2. **Apply Security Patches:** Mitigate identified CVEs in the Vulnerability Intelligence Center.
3. **Continuous Monitoring:** Ensure all production subdomains have active drift detection enabled.

*Report generated automatically by RakhshaSutra Digital Defense OS.*
"""

    report = SecurityReport(
        title=req.title,
        report_type=req.report_type.upper(),
        summary=f"Security report generated for {req.target_scope} with posture score {posture_score}/100.",
        target_scope=req.target_scope,
        overall_posture_score=posture_score,
        findings_summary=findings_summary,
        content_markdown=markdown_content,
        created_by_user_id=current_user.id
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "message": "Report generated successfully.",
        "id": report.id,
        "title": report.title,
        "overall_posture_score": report.overall_posture_score,
        "content_markdown": report.content_markdown
    }

@router.get("/{report_id}")
def get_report_detail(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve full markdown content and findings metadata for a report."""
    report = db.query(SecurityReport).filter(SecurityReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    return {
        "id": report.id,
        "title": report.title,
        "report_type": report.report_type,
        "summary": report.summary,
        "target_scope": report.target_scope,
        "overall_posture_score": report.overall_posture_score,
        "findings_summary": report.findings_summary or {},
        "content_markdown": report.content_markdown,
        "created_at": report.created_at.isoformat() if report.created_at else None
    }
