# 🛡️ RakshaSutra (रक्षासूत्र) — Complete Project Status & Architecture Report

> **Tagline:** *"Check Before You Click."*  
> **Official Repository:** `x:\Rakshasutra`  
> **Version:** `1.0.0-PROD-SAAS`  
> **Last Updated:** August 23, 2026  

---

## 📑 Table of Contents

1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [Core Feature Breakdown & Modules](#3-core-feature-breakdown--modules)
   - [3.1 Explainable Multi-Vector Threat Scanner](#31-explainable-multi-vector-threat-scanner)
   - [3.2 OSINT Reconnaissance & Interactive Threat Graph](#32-osint-reconnaissance--interactive-threat-graph)
   - [3.3 Dark Web & Breach Intelligence](#33-dark-web--breach-intelligence)
   - [3.4 Cyber Threat Map (Simulation & Live Stream)](#34-cyber-threat-map-simulation--live-stream)
   - [3.5 Incident Response Assistant](#35-incident-response-assistant)
   - [3.6 Enterprise Honeytokens & Active Deception](#36-enterprise-honeytokens--active-deception)
   - [3.7 Cross-Browser Extension (Manifest V3)](#37-cross-browser-extension-manifest-v3)
4. [SaaS Monetization, Tiers & Quota Engine](#4-saas-monetization-tiers--quota-engine)
5. [Developer REST API Gateway & Security](#5-developer-rest-api-gateway--security)
6. [Authentication, RBAC & Super Admin Hardening](#6-authentication-rbac--super-admin-hardening)
7. [Database Schema & Data Models](#7-database-schema--data-models)
8. [Automated Verification & Test Results](#8-automated-verification--test-results)
9. [How to Run & Access](#9-how-to-run--access)

---

## 1. Executive Summary & Purpose

**RakshaSutra** was created to solve a critical cybersecurity problem: online scams, phishing links, fake banking portals, and credential thefts target everyday citizens and small businesses who lack specialized security teams.

### Core Philosophy:
1. **Explainable Verdicts (No Black Boxes):** Every scan renders a plain-English **Traffic Light Verdict** (`SAFE` 🟢, `CAUTION` 🟡, `DANGER` 🔴), along with the exact underlying technical indicators (domain age, typosquatting distance, redirect chains, threat intelligence records).
2. **Zero Fabricated Claims:** No synthetic marketing claims (`sub-20ms`, `100% authentic live crawler`, or fake global attack counters). The platform uses real data from authoritative sources (**HaveIBeenPwned API v3**, **Cloudflare k-Anonymity**, **crt.sh**, **CERT-In** guidelines).
3. **Citizen Protection & Law Enforcement Escalation:** Connects victimized users directly with the Indian National Cyber Fraud Helpline (**1930**) and generates formal reporting templates for **CERT-In** (`incident@cert-in.org.in`) and **cybercrime.gov.in**.

---

## 2. End-to-End System Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │             USER & SOC CLIENT ACCESS POINTS            │
                               └───────┬───────────────────┬────────────────────┬───────┘
                                       │                   │                    │
                   ┌───────────────────▼──┐     ┌──────────▼───────────┐     ┌──▼────────────────────┐
                   │  Web Platform (SPA)  │     │ Universal Extension  │     │ External REST API     │
                   │ (React 19, Tailwind) │     │ (MV3 Chrome/Edge/FF) │     │ (Hashed API Keys)     │
                   └───────────────────┬──┘     └──────────┬───────────┘     └──┬────────────────────┘
                                       │                   │                    │
                                       └───────────────────┼────────────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │     FastAPI Core Engine   │
                                             │  (Async Python 3.12+ REST)│
                                             └─────────────┬─────────────┘
                                                           │
           ┌────────────────────────┬──────────────────────┼──────────────────────┬────────────────────────┐
           │                        │                      │                      │                        │
┌──────────▼──────────┐  ┌──────────▼──────────┐ ┌─────────▼──────────┐ ┌─────────▼──────────┐ ┌─────────▼──────────┐
│ Threat Scanner Core │  │ OSINT Digital       │ │ Dark Web & Breach  │ │ Incident Response  │ │ Enterprise          │
│ (URL, SMS, Web, SSL)│  │ Footprint Engine    │ │ Exposure Monitor   │ │ Assistant (RFC2822)│ │ Deception Tripwires │
└──────────┬──────────┘  └──────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘
           │                        │                      │                      │                        │
           └────────────────────────┴──────────────────────┼──────────────────────┴────────────────────────┘
                                                           │
                                             ┌─────────────▼─────────────┐
                                             │  Database & Entitlements  │
                                             │ (PostgreSQL / SQLite Pool)│
                                             └───────────────────────────┘
```

---

## 3. Core Feature Breakdown & Modules

### 3.1 Explainable Multi-Vector Threat Scanner
- **URL & Link Scanner:** Analyzes destination URLs using deterministic scoring curves, Levenshtein distance for typosquatting against 100+ brands (SBI, HDFC, ICICI, Amazon, Netflix, Google, Apple), TLD reputation tiers (`.xyz`, `.top`, `.tk`), and full redirect chain tracing.
- **SMS & Message Scam Analyzer:** Uses regex and heuristics to detect urgency triggers, electricity bill disconnection threats, lottery scams, and suspicious contact numbers.
- **Website Security & TLS Audit:** Validates HTTPS certificates, expiration dates, HSTS activation, and security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- **SSRF Containment:** Hardened against Server-Side Request Forgery; blocks loopback addresses, internal network ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 127.0.0.0/8, and IPv6 equivalents).

### 3.2 OSINT Reconnaissance & Interactive Threat Graph
- **40+ Social & Developer Probes:** Fast asynchronous discovery across Instagram (GraphQL API `X-IG-App-ID: 936619743392459`), GitHub, Telegram, Reddit, X (Twitter), Steam, Spotify, Chess.com, HackerNews, Medium, Keybase, etc.
- **Passive DNS & Mail Infrastructure:** Queries `A`, `AAAA`, `MX`, `TXT`, `NS` records, audits SPF/DMARC email spoofing vulnerabilities, and harvests subdomains via Certificate Transparency (`crt.sh`).
- **Interactive Force-Directed Graph:** Built with D3.js and HTML5 Canvas. Allows zooming, panning, dragging nodes, filtering categories (Root Target, Social Identity, Network IP, Mail Infrastructure), and 1-click JSON dossier export.
- **Daily Quotas:** 1 free OSINT scan/day for Free users; unlimited for Pro/Business/Enterprise.

### 3.3 Dark Web & Breach Intelligence
- **Verified Directory:** Directly queries HaveIBeenPwned API v3 with over 1,030+ verified corporate breaches totaling 14.2B+ records.
- **Zero-Knowledge k-Anonymity:** Plaintext passwords and emails are never logged or transmitted. The SHA-1 hash is computed client-side or server-side, and only the 5-character prefix is checked against 900M+ leaked records.
- **Remediation Checklists:** Step-by-step guidance on password hygiene, 2FA authenticator apps, and banking monitoring.

### 3.4 Cyber Threat Map (Simulation & Live Stream)
- **Simulation Mode:** Explicitly marked with a `SIMULATION MODE` badge for educational telemetry.
- **Interactive Controls:** Includes Play, Pause, Replay, Speed selector (1x, 2x, 5x), and category filters (Ransomware, Phishing, DDoS, Web Attack, Infostealer).
- **Event Inspector:** Slide-out inspection panel displaying origin country, target hub, attack vector, port, and defense status.
- **No Fabricated Stats:** Removed all deceptive marketing stats (`$48.6M+ attacks today`, `18,740 strikes/min`).

### 3.5 Incident Response Assistant
- **Assisted Workflow:** Replaced automated takedown attacks with legal, compliant evidence preparation.
- **SHA-256 Evidence Digest:** Computes cryptographic evidence hashes.
- **RFC 2822 Abuse Letter:** Drafts ready-to-send abuse complaint emails tailored to specific domain registrars (Cloudflare, AWS, Namecheap, GoDaddy).
- **CERT-In Reporting Template:** Generates structured reports formatted for `incident@cert-in.org.in` and `cybercrime.gov.in`.
- **Defensive Configurations:** Generates Nginx, Apache, Cloudflare WAF, Windows Hosts, and Linux iptables rules.

### 3.6 Enterprise Honeytokens & Active Deception
- **Enterprise-Only:** Gated behind `settings.FEATURE_ENTERPRISE_HONEYTOKENS` and `enterprise_admin` / `super_admin` RBAC roles.
- **Canary Trap Types:** Decoy AWS access keys, fake database connection strings, canary Word/PDF documents, and web beacons.
- **Silent Telemetry:** Webhook endpoint `/api/v1/deception/ping/{token_id}` logs intruder IP, User-Agent, and Referer, returning a transparent 1x1 GIF.

### 3.7 Cross-Browser Extension (Manifest V3)
- **Compatibility:** Google Chrome, Microsoft Edge, Brave, Opera, Mozilla Firefox.
- **Features:** Pre-navigation blocking, toolbar badge indicators, and in-page link highlighter for Gmail and WhatsApp Web.

---

## 4. SaaS Monetization, Tiers & Quota Engine

| Plan Name | Tier Key | Price (INR) | Daily Threat Scans | Daily OSINT | Developer API | Included Features |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Community Free** | `free` | **₹0 / mo** | **6 Scans / Day** | **1 Scan / Day** | ❌ None | Traffic light verdicts, 1930 Helpline guide, Threat map simulation |
| **Pro Cyber Defender** | `pro` | **₹299 / mo** | **100 Scans / Day** | **Unlimited** | ❌ None | Unlimited OSINT threat graphs, dark web breach monitor, browser extension |
| **Business Team Suite** | `business` | **₹999 / mo** | **500 Scans / Day** | **Unlimited** | **1,000 req/mo (10 req/min)** | 5 Team seats, organization monitoring, team audit logs, REST API keys |
| **Enterprise SOC** | `enterprise` | **Custom** | **Contract Volume** | **Unlimited** | **50,000+ req/mo** | SSO, SIEM webhooks, active honeytokens, dedicated account manager |

### Billing Architecture & Razorpay Verification:
- **Order Creation:** `POST /api/v1/subscription/razorpay/create-order`
- **Payment Signature Verification:** `POST /api/v1/subscription/razorpay/verify-payment` verifies HMAC SHA-256 against `RAZORPAY_KEY_SECRET`.
- **Webhook Idempotency:** `POST /api/v1/subscription/razorpay/webhook` checks raw body signatures and logs unique `event_id` records in `WebhookEvent` table to prevent replay attacks.

---

## 5. Developer REST API Gateway & Security

- **Cryptographic Key Generation:** Keys are prefixed (`rs_live_...` or `rs_test_...`).
- **One-Time Secret Display:** Full raw API keys are returned to the user **exactly once** upon creation. Only the 12-character `key_prefix` and SHA-256 `key_hash` are stored in the database.
- **Account-Level Quota Enforcer:** Centralized monthly usage aggregation across all keys owned by an account (Business default: 1,000 req/mo, 10 req/min).

```bash
# Example API Request
curl -X POST "http://127.0.0.1:8000/api/v1/scans/url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer rs_live_your_secret_key" \
  -d '{"url": "http://suspicious-banking-site.xyz/login.php"}'
```

---

## 6. Authentication, RBAC & Super Admin Hardening

- **RBAC Roles:** `USER`, `BUSINESS_ADMIN`, `ENTERPRISE_ADMIN`, `SUPER_ADMIN`.
- **Brute-Force Rate Limiting:** In-memory progressive lockout (max 5 failed attempts per 5 minutes per IP).
- **Generic Error Responses:** Login returns generic errors ("Invalid email or password") to prevent username enumeration.
- **Single Designated Super Admin:** Configured strictly via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). No hardcoded credentials or autofill UI buttons.
- **Audit Trails:** All administrative, security, and authentication actions are recorded in the `AuditLog` table.

---

## 7. Database Schema & Data Models

### Database Tables Created:
1. `users` — Authentication, RBAC roles, scan quotas, and OSINT usage.
2. `scans` — URL/message scan results, risk scores, verdicts, and telemetry.
3. `threat_indicators` — Individual findings linked to scans.
4. `threat_feed_items` — Active indicators of compromise (IOCs).
5. `provider_status` — Status and metrics for threat intelligence feeds.
6. `security_events` — SSRF blocks and rate-limit violations.
7. `awareness_articles` — Educational cybersecurity articles.
8. `plans` — SaaS subscription plans and limits.
9. `subscriptions` — User subscription records and active billing periods.
10. `payments` — Razorpay payment records and transaction statuses.
11. `invoices` — Generated PDF invoice records and tax amounts.
12. `webhook_events` — Webhook idempotency and processed events.
13. `api_keys` — Hashed API keys, prefixes, and rate limits.
14. `api_usage` — Per-request telemetry and latency logs.
15. `api_quotas` — Account-level pooled monthly quotas.
16. `organizations` — Business & Enterprise multi-seat organizations.
17. `team_members` — Organization membership and roles.
18. `audit_logs` — Immutable audit trail of administrative events.

---

## 8. Automated Verification & Test Results

### 1. Pytest Backend Suite (20/20 Passed)
```
============================= test session starts =============================
platform win32 -- Python 3.14.5, pytest-9.1.1, pluggy-1.6.0
rootdir: X:\Rakshasutra\backend
configfile: pytest.ini
plugins: anyio-4.14.2, asyncio-1.4.0
collected 20 items

tests\test_api.py .....                                                  [ 25%]
tests\test_saas_features.py ......                                       [ 55%]
tests\test_scanners.py .....                                             [ 80%]
tests\test_ssrf.py ....                                                  [100%]

======================= 20 passed in 5.30s =======================
```

### 2. Frontend Production Build (0 Errors)
```
> tsc -b && vite build
✓ 1843 modules transformed.
dist/index.html                   1.55 kB │ gzip:   0.83 kB
dist/assets/index-D-4xeq2_.css   81.89 kB │ gzip:  17.39 kB
dist/assets/index-LJPZATaB.js   685.10 kB │ gzip: 176.19 kB
✓ built in 10.54s with 0 compilation errors
```

---

## 9. How to Run & Access

### Quick Launch Commands:

#### Backend:
```powershell
cd x:\Rakshasutra\backend
venv\Scripts\python.exe migrate_db.py
venv\Scripts\python.exe -m pytest
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### Frontend:
```powershell
cd x:\Rakshasutra\frontend
npm.cmd run dev -- --host 0.0.0.0 --port 5173
```

### Access Endpoints:
- **Local Web Platform:** [http://localhost:5173](http://localhost:5173)
- **Mobile LAN Access:** `http://192.168.1.44:5173`
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Default Super Admin:** Configured in `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
