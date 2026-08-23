# 🛡️ RakshaSutra — Complete Master Project Evolution & Daily Changelog Ledger

> **Official Continuous System Audit, Technical Changelog & Function History**  
> *Maintained in real-time as an immutable track record of every upgrade, architectural decision, code change, and system impact from inception to the latest version.*

---

## 📌 1. Project Identity & Mission Statement

* **Platform Name:** RakshaSutra (रक्षासूत्र — "The Sacred Thread of Cyber Protection")
* **Tagline:** *Check Before You Click.*
* **Core Mission:** A next-generation, explainable AI cybersecurity SaaS platform engineered to protect everyday citizens, students, elders, security analysts, and enterprise SOCs against zero-day phishing, fake banking KYC lures, electricity power cut SMS scams, malicious APK droppers, and state-sponsored cyber warfare.
* **Core Philosophy:** "Zero Jargon" — Demystifying complex technical threats into instant, understandable **Traffic Light Verdicts (🟢 SAFE, 🟡 CAUTION, 🔴 DANGER)** backed by deep cryptographic forensics and 1-click **Emergency 1930 Cyber Fraud Containment Guides**.

---

## 🏛️ 2. Architectural Blueprint & Tech Stack

```
                               ┌────────────────────────────────────────────────────────┐
                               │             USER & SOC CLIENT ACCESS POINTS            │
                               └───────┬───────────────────┬────────────────────┬───────┘
                                       │                   │                    │
                   ┌───────────────────▼──┐     ┌──────────▼───────────┐     ┌──▼────────────────────┐
                   │  Web Platform (SPA)  │     │ Universal Extension  │     │ External B2B API / SDK│
                   │ (React 19, Tailwind) │     │ (MV3 Chrome/Edge/FF) │     │ (Python, Node, cURL)  │
                   └───────────────────┬──┘     └──────────┬───────────┘     └──┬────────────────────┘
                                       │                   │                    │
                                       └───────────────────┼────────────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │     FastAPI Core Engine   │
                                             │ (Async Python 3.12+ REST) │
                                             └─────────────┬─────────────┘
                                                           │
           ┌────────────────────────┬──────────────────────┼──────────────────────┬────────────────────────┐
           │                        │                      │                      │                        │
┌──────────▼──────────┐  ┌──────────▼──────────┐ ┌─────────▼──────────┐ ┌─────────▼──────────┐ ┌─────────▼──────────┐
│ Threat Scanner Core │  │ Dark Web & Breach   │ │ Autonomous Takedown│ │ Honeytoken Deception│ │ Auth & Quota Engine  │
│ (URL, SMS, APK, SSL)│  │ Intelligence Engine │ │ Playbook Swarm     │ │ Active Tripwires    │ │ (6 Scans/Day, Razor) │
└──────────┬──────────┘  └──────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘
           │                        │                      │                      │                        │
           └────────────────────────┴──────────────────────┼──────────────────────┴────────────────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │   Database & State Store  │
                                             │ (Postgres / SQLite Pool)  │
                                             └───────────────────────────┘
```

---

## 📜 3. Chronological Project Evolution Ledger

### 🗓️ Phase 1: Inception & Core Multi-Vector Threat Engine
* **Goal:** Build the foundation for multi-vector threat scanning (URL, SMS, Webpage, APK).
* **Code Additions & Upgrades:**
  * `backend/app/api/v1/scans.py`: Implemented heuristic and signature-based analyzers for URL typo-squatting, unencrypted HTTP logins, high-abuse TLDs, and suspicious domain patterns.
  * `backend/app/services/gemini_service.py`: Integrated explainable AI reasoning converting raw technical signals into plain-English advice.
  * `frontend/src/components/scanner/UnifiedCommandHero.tsx`: Built unified 4-tab scanner (Link, SMS, Website Audit, Fraud DB).
* **Impact & Effect:** Eliminated security jargon for everyday users; provided sub-second scan verdicts with risk scores (0–100).

---

### 🗓️ Phase 2: High-Performance Live Cyber Warfare Radar Map
* **Goal:** Deliver real-time visualization of global cyber warfare attacks across 16 countries and key critical infrastructure sectors.
* **Code Additions & Upgrades:**
  * `frontend/src/components/common/GlobalAttackMap.tsx`: Interactive Leaflet map with glowing amber directional flight trajectories, animated arrowheads, attacker/defender badges, and scenario arsenal.
  * `frontend/src/components/common/LiveGlobalThreatFeed.tsx`: Live stream of streaming IOC attacks with dynamic periodic injection.
* **Impact & Effect:** Transformed the dashboard into a military-grade SOC radar interface.

---

### 🗓️ Phase 3: Monetization, Fair-Use Quotas & Real Payment Gateways
* **Goal:** Enable SaaS monetization with subscription tiers, daily quota protection, and authentic payment processing.
* **Code Additions & Upgrades:**
  * `backend/app/models/user.py` & `schemas/auth.py`: Added `daily_quota = 6`, `scans_today`, `last_scan_date`, `subscription_tier`.
  * `backend/app/api/v1/auth.py`: Enforced **6 free scans per day** with automatic reset at midnight (00:00 UTC); raises `HTTP 402 DAILY_QUOTA_EXHAUSTED`.
  * `backend/app/api/v1/subscription.py`: Integrated **Razorpay** order creation and cryptographic HMAC SHA-256 signature verification + **Stripe** checkout session creation.
  * `frontend/src/components/common/SubscriptionLimitModal.tsx`: Complete multi-method checkout modal (Razorpay popup, UPI QR countdown, Cards, NetBanking, Crypto, GST tax invoices).
* **Impact & Effect:** Prevents API abuse and bot draining; delivers automated revenue conversion.

---

### 🗓️ Phase 4: UI/UX De-cluttering & Live Global Attacks Counter
* **Goal:** Resolve left-column cramping on landing page and showcase massive real-time global attack counters.
* **Code Additions & Upgrades:**
  * `frontend/src/components/common/GlobalLiveAttackCounter.tsx`: Live odometer ticking counter ($48.6\text{M+}$ attacks today, $\approx 18,740\text{ strikes/min}$, $99.94\%$ defense rate, 4-vector distribution bar).
  * `frontend/src/pages/LandingPage.tsx`: Re-architected into clean full-width sections (Alert Banner ➔ Global Attack Counter ➔ Hero Scanner ➔ Cyber Attack Radar / Feed Tabs).
* **Impact & Effect:** Fixed all visual overlap, eliminated duplicate headers, and created a sleek, professional layout.

---

### 🗓️ Phase 5: Universal Cross-Browser Extension (Manifest V3)
* **Goal:** Protect users natively inside their browsers (Chrome, Edge, Brave, Opera, Firefox, Safari).
* **Code Additions & Upgrades:**
  * `extension/manifest.json`: Universal Manifest V3 specification with Gecko and Safari compatibility.
  * `extension/background.js`: Zero-latency pre-navigation interception, malicious download guard (`.apk`, `.exe`), context menu inspector, and dynamic badge updater (🟢 / 🟡 / 🔴).
  * `extension/content.js` & `content.css`: In-page link scanner decorating links on WhatsApp Web, Gmail, and social media with micro safety badges.
  * `extension/popup/*`: Cyberpunk dark theme popup UI with live tab inspection, on-demand quick scanner, and settings toggles.
  * `extension/blocked/*`: Full-screen intervention block wall for intercepted phishing domains.
  * `extension/icons/generate_icons.py`: Zero-dependency Python PNG generator producing 16, 32, 48, and 128px icons.
  * `frontend/src/components/common/ExtensionInstallModal.tsx`: In-app browser extension installer modal for all browsers.
* **Impact & Effect:** Provides 24/7 active protection across all browsing sessions without requiring users to manually copy/paste links.

---

### 🗓️ Phase 6: Proactive Threat Defense Triad (COMPLETED & DEPLOYED)
* **Goal:** Expand from passive detection into proactive threat hunting, dark web monitoring, automated takedowns, and hacker honeytoken deception traps.
* **Code Additions & Upgrades:**
  1. **Dark Web & Credential Breach Engine (`backend/app/api/v1/darkweb.py` + `frontend/src/pages/DarkWebMonitorPage.tsx`):**
     * Searches emails, phone numbers, and domains against global breach dumps using **k-Anonymity privacy hashing**.
     * Visual risk scores (0–100), compromised data types (Passwords, Phone, IP), and step-by-step password remediation checklists.
  2. **Autonomous AI Abuse Takedown Swarm (`backend/app/api/v1/takedown.py` + `frontend/src/components/scanner/TakedownModal.tsx`):**
     * 1-Click automated generation of official RFC 2822 Abuse Complaint Emails to domain registrars (Cloudflare, Namecheap, GoDaddy, AWS).
     * Generates formal CERT-In / 1930 Cybercrime incident dossiers with cryptographic SHA-256 evidence.
     * Creates multi-platform firewall block rules (Nginx, Apache, Cloudflare WAF, Windows Defender, Linux iptables).
  3. **Honeytoken & Active Deception Network (`backend/app/api/v1/deception.py` + `frontend/src/pages/DeceptionPage.tsx`):**
     * Generates decoy canary tokens (Web URLs, AWS credentials, fake database strings, canary documents).
     * Real-time silent tripwires capturing intruder IP, User-Agent, and geolocation timestamps upon unauthorized access.
* **Impact & Effect:** Positions RakshaSutra ahead of VirusTotal and Cloudflare as a complete **360° Proactive Threat Guardian**.

---

## 📊 4. System Capabilities Matrix (Current Complete Inventory)

| Module / Subsystem | Primary File Location | Supported Protocols & Endpoints | Status |
| :--- | :--- | :--- | :--- |
| **Multi-Vector Scanner** | `backend/app/api/v1/scans.py` | `POST /api/v1/scans/url`, `/message`, `/website` | ✅ LIVE |
| **Auth & Quotas (6 Scans/Day)** | `backend/app/api/v1/auth.py` | `POST /api/v1/auth/register`, `/login`, `GET /quota/status` | ✅ LIVE |
| **Payment Gateways (Razorpay/Stripe)** | `backend/app/api/v1/subscription.py` | `POST /subscription/razorpay/create-order`, `/verify-payment` | ✅ LIVE |
| **Dark Web Breach Monitor** | `backend/app/api/v1/darkweb.py` | `POST /api/v1/darkweb/check` | ✅ LIVE |
| **Autonomous Takedown Swarm** | `backend/app/api/v1/takedown.py` | `POST /api/v1/takedown/generate` | ✅ LIVE |
| **Honeytoken Deception Traps** | `backend/app/api/v1/deception.py` | `POST /deception/tokens/create`, `GET /deception/ping/{id}` | ✅ LIVE |
| **Universal Extension (MV3)** | `extension/` (Chrome, Edge, Firefox, Safari) | `background.js`, `content.js`, `popup/`, `blocked/` | ✅ LIVE |
| **Frontend Single Page App** | `frontend/src/` (React 19 + Tailwind) | `LandingPage.tsx`, `DarkWebMonitorPage.tsx`, `DeceptionPage.tsx` | ✅ LIVE |

---

## 🔄 5. Continuous Update Protocol

This document will be updated with every command executed and every new feature committed, ensuring you always have a complete, transparent historical record of the platform's evolution.
