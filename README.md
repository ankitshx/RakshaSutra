# 🛡️ RakshaSutra (रक्षासूत्र) — Explainable Cybersecurity & Threat Intelligence SaaS

> **Tagline: "Check Before You Click."**  
> *Production-ready cybersecurity SaaS providing explainable URL/SMS/website scanning, OSINT digital footprinting, verified breach monitoring, interactive threat map simulations, developer APIs, and assisted incident response workflows.*

---

## 🏛️ System Architecture

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

## 💎 SaaS Subscription Tiers & Pricing

| Tier | Price (INR) | Threat Scans | OSINT Investigations | Developer API | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Community Free** | ₹0 / mo | **6 Scans / Day** | **1 Scan / Day** | None | Plain-English verdicts, 1930 Helpline guide, Threat Map simulation |
| **Pro Cyber Defender** | ₹299 / mo | **100 Scans / Day** | **Unlimited** | None | Full OSINT threat graphs, dark web breach checks, browser extension |
| **Business Team Suite** | ₹999 / mo | **500 Scans / Day** | **Unlimited** | **1,000 req/mo (10 req/min)** | 5 Team seats, organization monitoring, team audit logs, REST API |
| **Enterprise SOC & Defense** | Custom | Custom Volume | **Unlimited** | **50,000+ req/mo** | SSO, SIEM integration, active honeytokens, dedicated SLA |

---

## 🚀 Key Modules & Technical Capabilities

### 1. 🔍 Explainable Multi-Vector Threat Scanner
* **Deterministic Scoring Engine:** Evaluates domain age, typosquatting (Levenshtein distance against 100+ global and Indian brands), TLD reputation, redirect chains, and threat intelligence hits.
* **Traffic Light Verdicts:** Clear `SAFE`, `CAUTION`, or `DANGER` verdicts paired with evidence and actionable recommendations.
* **SSRF-Protected Network Layer:** Strict private IPv4/IPv6 filtering and timeout containment.

### 2. 🕵️‍♂️ OSINT Digital Footprinting & Threat Graphs
* **40+ Social & Developer Platform Probes:** Passive footprinting across GitHub, Instagram (GraphQL API), Telegram, Reddit, Steam, Keybase, etc.
* **DNS & Infrastructure Resolver:** Queries `A`, `AAAA`, `MX`, `TXT`, `NS` records, analyzes SPF/DMARC email spoofing risks, and extracts subdomains from certificate transparency logs.
* **Interactive Force-Directed Graph:** Visual relationship mapping between root targets, discovered identities, and infrastructure IPs with JSON dossier export.

### 3. 🛡️ Dark Web & Breach Exposure Intelligence
* **HaveIBeenPwned API v3 Integration:** Queries verified global corporate breach records.
* **k-Anonymity SHA-1 Privacy Hashing:** Evaluates compromised credentials using 5-character prefix matching (zero plaintext passwords transmitted or stored).

### 4. 📝 Incident Response Assistant
* **Assisted Reporting Workflow:** Generates cryptographic SHA-256 evidence digests and RFC 2822-compliant abuse complaint letters for domain registrars (Cloudflare, AWS, Namecheap, GoDaddy).
* **CERT-In & 1930 Escalation:** Standardized complaint templates for CERT-In (`incident@cert-in.org.in`) and guidance for the Indian National Cyber Fraud Helpline (**1930**).
* **Edge Defense Rules:** Generates Nginx, Apache, Cloudflare WAF, Windows Hosts, and iptables blocking rules.

### 5. 🌐 Cyber Threat Map
* **Simulation Mode:** Clearly labeled synthetic educational telemetry stream with interactive playback controls (Play, Pause, Replay, 1x/2x/5x speed) and filter chips.
* **Threat Intelligence Feed:** Stream verified Indicators of Compromise (IOCs) when configured.

### 6. 🔑 Developer REST API Gateway
* **Cryptographic Key Hashing:** API keys are returned once upon creation (`rs_live_...`), and only the prefix and SHA-256 hash are persisted.
* **Account-Level Quota Enforcer:** Centralized monthly usage aggregation across all keys owned by an account.

---

## ⚡ Quick Start & Development Setup

### Backend (Python 3.12+ / FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows: venv\Scripts\activate | Linux: source venv/bin/activate
pip install -r requirements.txt
python migrate_db.py
python -m pytest
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend (React 19 + Vite + TypeScript)
```bash
cd frontend
npm install
npm run build
npm run dev
```

---

## 📄 License & Legal
* **License:** MIT Open Source (Defensive & Educational Use).
* **Privacy:** Zero-Knowledge k-Anonymity hashing for all credential checks.
* **Support:** `support@rakshasutra.org` | **Security:** `security@rakshasutra.org`
