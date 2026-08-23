# 🛡️ RakshaSutra (रक्षासूत्र) — Next-Generation AI Cybersecurity & OSINT Intelligence Platform

> **"Check Before You Click."**  
> *Autonomous multi-vector threat detection, live cyber warfare radar, 100% authentic dark web monitoring, cross-platform OSINT reconnaissance with interactive threat graphs, active deception honeytokens, automated abuse takedowns, and universal browser extension.*

---

## 🏛️ System Architecture

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
 │ Threat Scanner Core │  │ Autonomous OSINT    │ │ Dark Web & Breach  │ │ Autonomous Takedown│ │ Honeytoken Deception│
 │ (URL, SMS, APK, SSL)│  │ Recon & Threat Graph│ │ Intelligence Engine│ │ Playbook Swarm     │ │ Active Tripwires    │
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

## 🚀 Key Capabilities & Modules

### 1. 🔍 Autonomous OSINT Reconnaissance & Interactive Threat Graph
* **40+ Platform Username Recon:** Fast asynchronous probing across **Instagram (GraphQL API), GitHub, Telegram, Reddit, X (Twitter), TikTok, Steam, Spotify, Chess.com, HackerNews, Medium, Keybase**, etc.
* **Passive DNS & Infrastructure Footprinter:** Full DNS resolution (`A`, `AAAA`, `MX`, `TXT`, `NS`, `SOA`), DMARC/SPF email spoofing risk auditing, and Subdomain Certificate Transparency harvesting (`crt.sh`).
* **Telecom Carrier & Circle Resolver:** Resolves Indian and International mobile carriers (**Jio, Airtel, Vi, BSNL, AT&T, EE**) and registered telecom circles (**Delhi NCR, Mumbai, Karnataka, Rajasthan**).
* **Interactive Force-Directed Threat Graph:** Drag-and-drop interactive visual canvas connecting targets, IPs, nameservers, mail tenants, and discovered social profiles with 1-click JSON dossier export.

### 2. 🕵️‍♂️ 100% Authentic Live Dark Web & Breach Exposure Scanner
* **Live HaveIBeenPwned API v3 Integration:** Direct query access to **1,030+ verified corporate breaches** (Adobe, LinkedIn, Canva, Dropbox, Twitter, etc.) representing over **14.2 Billion compromised accounts**.
* **NIST / Cloudflare k-Anonymity Leaked Password Verifier:** Locally computes SHA-1 and queries 900M+ real leaked credentials via 5-character prefix matching with zero-knowledge privacy.

### 3. 🧩 Universal Cross-Browser Extension (W3C Manifest V3)
* Compatible with **Google Chrome, Microsoft Edge, Brave, Opera, Mozilla Firefox, and Apple Safari**.
* **Pre-Navigation Interceptor:** Stops requests before malicious scripts or downloads execute.
* **Dynamic Traffic Light Badges:** 🟢 Safe, 🟡 Caution, 🔴 Danger in browser toolbar.
* **In-Page Link Highlighter:** Inspects and decorates links inside WhatsApp Web, Gmail, and social media.
* **Malicious Download Guard:** Blocks background `.apk` and `.exe` auto-downloads.

### 4. 🍯 Honeytoken & Active Deception Network
* Generate decoy canary tokens (**AWS Credentials, Fake DB Strings, Web Tracking URLs, Canary PDFs**).
* Silent 1x1 GIF tracking webhooks capture intruder IP, User-Agent, and geolocation upon unauthorized access.

### 5. ⚔️ Autonomous AI Abuse Takedown Swarm
* 1-Click generation of formal RFC 2822 Abuse Complaint Emails to domain registrars (Cloudflare, AWS, Namecheap, GoDaddy).
* Generates formal CERT-In / 1930 Cybercrime incident dossiers with cryptographic SHA-256 evidence.
* Generates multi-platform firewall block rules (Nginx, Apache, Cloudflare WAF, Windows Defender, Linux iptables).

### 6. 💳 Fair-Use Quotas & SaaS Monetization
* **6 Free Scans Per Day** with automated midnight reset (00:00 UTC) for free accounts.
* Integrated cryptographic payment verification for **Razorpay** (HMAC SHA-256) and **Stripe** checkout sessions.

### 7. 🎨 Enterprise Typography & Ultra-Wide Fluid Grid
* Dual Google Font System: **Plus Jakarta Sans** for UI/Headings + **JetBrains Mono** for threat telemetry and code.
* Zero-gap responsive layout (`max-w-[1780px]` / `max-w-[1720px]`) optimized for 1080p, 2K, 4K, laptops, and ultrawide displays.

---

## 🔐 Security & Administrator Configuration

Administrator credentials and sensitive API keys are configured strictly via private environment variables or a local `.env` file (which is excluded from Git tracking):

```bash
# Copy template configuration
cp .env.example .env

# Set your private credentials in .env:
ADMIN_EMAIL=admin@rakshasutra.org
ADMIN_PASSWORD=ChangeThisAdminSecret2026!
```

---

## 🧪 Local Quickstart

### Backend (FastAPI):
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python migrate_db.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (React 19 + Vite):
```bash
cd frontend
npm install
npm run dev
```

Visit **http://127.0.0.1:5173** to access the live platform.

---

## 📜 Daily Track Record & Audit Log
For a complete, real-time audit trail of every single code modification, upgrade, and architectural decision, see [`PROJECT_EVOLUTION_LOG.md`](./PROJECT_EVOLUTION_LOG.md).

---

## ⚖️ License
MIT License. Built for proactive digital defense and open-source intelligence.

