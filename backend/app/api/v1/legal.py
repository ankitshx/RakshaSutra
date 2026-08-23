"""
RakshaSutra Legal, Privacy & Compliance Disclosures
Provides official policies on data collection, scan telemetry, k-anonymity privacy, and 1930 guidance.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/legal", tags=["Legal, Privacy & Compliance"])

@router.get("/privacy-policy")
def get_privacy_policy():
    return {
        "title": "RakshaSutra Privacy Policy",
        "last_updated": "2026-08-23",
        "principles": [
            "Zero-Knowledge Hashing: Passwords and sensitive queries are hashed locally using k-Anonymity (only 5-character SHA-1 prefixes are transmitted to threat indices).",
            "Data Minimization: We only process the minimal telemetry required to evaluate risk indicators.",
            "No Sale of Personal Data: We never sell or monetize user scan histories, email addresses, or phone numbers.",
            "Retention & Deletion: Users can purge their scan history at any time from their personal dashboard."
        ],
        "contact_email": "privacy@rakshasutra.org"
    }

@router.get("/terms-of-service")
def get_terms_of_service():
    return {
        "title": "RakshaSutra Terms of Service",
        "last_updated": "2026-08-23",
        "terms": [
            "Defensive Use Only: RakshaSutra tools are provided exclusively for proactive security evaluation and educational awareness.",
            "No Offensive Action: Users must not attempt to use our APIs or tools to probe, disrupt, or attack third-party systems.",
            "Independent Verification: Risk scores and confidence ratings are evidence-based recommendations and do not constitute absolute legal warranties.",
            "Official Cybercrime Guidance: RakshaSutra assists users in generating incident dossiers for official submission to authorized portals (cybercrime.gov.in / 1930) but does not replace law enforcement."
        ]
    }

@router.get("/refund-policy")
def get_refund_policy():
    return {
        "title": "RakshaSutra Refund & Cancellation Policy",
        "last_updated": "2026-08-23",
        "policy": "We offer a 7-day money-back guarantee for initial Pro and Business subscription upgrades. Users can cancel subscriptions anytime from their billing dashboard.",
        "support_email": "billing@rakshasutra.org"
    }
