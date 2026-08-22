# 🛡️ RakshaSutra — AI-Powered Cybersecurity & Threat Detection Platform

> **"Check Before You Click."**  
> *Defensive cybersecurity platform for real-time phishing detection, brand impersonation inspection, psychological urgency analysis, and automated security awareness.*

---

## 🌐 Public Cloud Deployment (Google Cloud Run / Render)

RakshaSutra includes a unified multi-stage **Dockerfile** that packages the compiled React frontend and FastAPI backend into a single high-performance container.

### Option 1: Deploy on Google Cloud Run (Fast & Free Tier Available)

1. Open the [Google Cloud Console](https://console.cloud.google.com/run).
2. Click **Create Service**.
3. Select **Continuously deploy from a repository**.
4. Connect your GitHub repository: `ankitshx/RakshaSutra`.
5. Choose **Dockerfile** as the build type.
6. Check **Allow unauthenticated invocations** (Public Access).
7. Click **Create** — Google Cloud will build and provide a public HTTPS URL (e.g. `https://rakshasutra-xyz-uc.a.run.app`)!

Or using Google Cloud SDK:
```bash
gcloud run deploy rakshasutra \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

---

### Option 2: 1-Click Free Deployment on Render

1. Go to [Render.com](https://render.com) and log in with GitHub.
2. Click **New +** ➔ **Web Service**.
3. Select `ankitshx/RakshaSutra`.
4. Render will automatically detect the `Dockerfile` and `render.yaml`.
5. Click **Create Web Service** — Your app will be live on `https://rakshasutra.onrender.com` in 2 minutes!

---

## 🔐 Security & Administrator Configuration

Administrator credentials and sensitive API keys are configured strictly via private environment variables or a local `.env` file (which is excluded from Git tracking):

```bash
# Copy template configuration
cp .env.example .env

# Set your private credentials in .env:
ADMIN_EMAIL=your_private_admin@domain.com
ADMIN_PASSWORD=YourStrongSecretPassword123!
```

---

## 🚀 Key Features

* **🔗 Unified Threat Scanner:** Multi-vector URL, Message, Website, and IOC lookup in one interface.
* **🛑 Plain-English Safety Verdicts:** Traffic light clarity (*STOP! THIS IS DANGEROUS*, *BE CAREFUL*, *LOOKS NORMAL*) for non-technical users.
* **🚨 1-Click Emergency Panic Helper:** Immediate 3-step containment with 1930 Cyber Fraud Helpline dialing.
* **🤖 Raksha AI Copilot:** Interactive defensive AI assistant with 4 incident containment playbooks.
* **🏢 Website Security Audit:** TLS certificate validation and HTTP security headers compliance (A+ to F grades).
* **🎨 Dual Themes:** Dark Obsidian Cyber Mode & High-Contrast Light Mode.
* **🔑 Developer Threat API & Quotas:** Rate limit quotas (10 uses allowance per user) with Developer API key manager.
* **🔐 Official Admin SOC Portal:** Custom IOC threat signature manager, SSRF defense audit logs, and user access control.

---

## 🧪 Local Quickstart

### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 License
MIT License. Built for proactive digital defense.
