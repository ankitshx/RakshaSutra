# 🚀 RakshaSutra (रक्षासूत्र) — Complete Production Deployment Guide

RakhshaSutra is packaged as a **self-contained, enterprise-grade, multi-stage Docker container** where the compiled React 19 frontend is bundled directly inside the FastAPI Python 3.11+ backend.

This means you can deploy the **entire system (Frontend + Backend + Database + Security Engine) in 1 single click** without needing to configure complex reverse proxies or CORS policies.

---

## 🌟 Quick Platform Comparison: Where Should You Deploy?

| Platform | Difficulty | Cost | Best For | Live URL Format |
| :--- | :--- | :--- | :--- | :--- |
| **Render.com** (Recommended ⭐) | **Zero (1-Click)** | **Free Tier** | Quickest, zero maintenance, full-stack | `https://rakshasutra.onrender.com` |
| **Railway.app** | **Zero (1-Click)** | $5 Free Trial | Ultra-fast Docker builds | `https://rakshasutra.up.railway.app` |
| **Google Cloud Run** | Easy | Pay-per-use (Free tier available) | Enterprise scale, auto-scaling to zero | `https://rakshasutra-xyz-uc.a.run.app` |
| **Vercel + Render** (Split) | Moderate | **100% Free** | High-speed global edge CDN for UI | Vercel for UI + Render for API |
| **Self-Hosted VPS** (AWS / DigitalOcean) | Advanced | $4 - $10 / month | Total control, custom domains, on-premise | `https://yourdomain.com` |

---

## 🥇 Option 1: Render.com (Recommended — 100% Free & Easiest)

Render automatically detects the repository's root [Dockerfile](file:///x:/Rakshasutra/Dockerfile) and [render.yaml](file:///x:/Rakshasutra/render.yaml) blueprint.

### Step-by-Step Instructions:
1. Go to [Render.com](https://render.com) and Sign Up / Log In (you can use your GitHub account).
2. Click the **"New +"** button at the top right and select **"Web Service"** (or select **"Blueprint"** to use `render.yaml`).
3. Under **"Connect a repository"**, select your GitHub repository: `ankitshx/RakshaSutra`.
4. Fill in the basic settings:
   - **Name:** `rakshasutra`
   - **Region:** Any region close to you (e.g., *Singapore*, *Frankfurt*, or *Oregon*)
   - **Branch:** `main`
   - **Runtime:** `Docker`
   - **Instance Type:** `Free`
5. **Environment Variables** (Optional, sane defaults are already pre-configured):
   - `PORT`: `8080`
   - `SECRET_KEY`: `AnyLongRandomProductionSecretKey2026!`
   - `ADMIN_EMAIL`: `admin@rakshasutra.org` (or your personal email)
   - `ADMIN_PASSWORD`: `YourStrongAdminPassword123!`
   - `DATABASE_URL`: `sqlite:///./rakshasutra.db` (or attach a free Render PostgreSQL database URL)
6. Click **"Deploy Web Service"**.

> **Result:** In ~3–4 minutes, Render builds the container and gives you a live HTTPS URL (e.g. `https://rakshasutra.onrender.com`). You can open it in any browser and use the system immediately!

---

## 🥈 Option 2: Railway.app (Ultra-Fast 1-Click Docker)

1. Sign in at [Railway.app](https://railway.app) with GitHub.
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select `ankitshx/RakshaSutra`.
4. Railway will automatically detect the [Dockerfile](file:///x:/Rakshasutra/Dockerfile).
5. In project settings, under **Networking**, click **"Generate Domain"**.
6. That's it! Your site will be live instantly.

---

## 🥉 Option 3: Google Cloud Run (Enterprise Serverless)

If you have a Google Cloud Platform (GCP) account:

1. Install and authenticate the Google Cloud CLI:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
2. Deploy directly from the project root:
   ```bash
   gcloud run deploy rakshasutra \
     --source . \
     --port 8080 \
     --allow-unauthenticated \
     --region us-central1 \
     --memory 512Mi
   ```
3. Cloud Run will automatically build the container via Google Cloud Build and deploy it to a global HTTPS endpoint.

---

## ⚡ Option 4: Split Deployment (Frontend on Vercel + Backend on Render)

If you prefer using **Vercel** for the React UI and **Render** for the Python API:

### 1. Deploy the Backend on Render:
- In Render, create a Web Service using the [Dockerfile](file:///x:/Rakshasutra/Dockerfile).
- Note your live API URL (e.g., `https://rakshasutra-backend.onrender.com`).

### 2. Deploy the Frontend on Vercel:
- Go to [Vercel.com](https://vercel.com) and import `ankitshx/RakshaSutra`.
- Under **Root Directory**, click edit and select **`frontend`**.
- Under **Environment Variables**, add:
  - `VITE_API_URL` = `https://rakshasutra-backend.onrender.com`
- Click **"Deploy"**.
- Vercel will build the frontend and serve it globally via CDN. All API requests will automatically route to your Render backend.

---

## 🖥️ Option 5: Self-Hosted VPS / Cloud VM (Docker Compose)

For deployment on an Ubuntu/Debian server (AWS EC2, DigitalOcean, Linode, Hetzner, etc.):

1. Connect to your server via SSH:
   ```bash
   ssh user@your-server-ip
   ```
2. Install Docker & Docker Compose:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-plugin
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/ankitshx/RakshaSutra.git
   cd RakshaSutra
   ```
4. Copy environment template:
   ```bash
   cp .env.example .env
   nano .env # Set your SECRET_KEY and ADMIN_PASSWORD
   ```
5. Launch with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
6. The application is now live on `http://YOUR_SERVER_IP:8080`.
7. (Optional) For custom domain and free Let's Encrypt SSL, point your domain DNS to your server IP and run:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 🎁 Community Free Access Mode (100% Free)

RakhshaSutra currently operates in **Community Free Public Access Mode**:
- **Zero Payment Required:** All citizens, developers, and organizations can perform unlimited threat scans, deep OSINT footprinting, and generate developer API tokens without paying or needing a credit card.
- **No Paywalls:** All quotas (`daily_quota = 999999`) and enterprise capabilities are enabled out-of-the-box. Payment gateway setup can be deferred for a later date.

---

## 🔑 Secure Administrator Access (Secret Credentials)

Administrative passwords are **NOT** publicly displayed on the login page to ensure maximum confidentiality. You can customize them in your deployment platform's private environment variables:

| Role | Environment Variable (Email) | Environment Variable (Password) | Default (Fallback) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `SUPERADMIN_EMAIL` | `SUPERADMIN_PASSWORD` | `superadmin@rakshasutra.org` / `SuperAdmin@12345` | Root system control, Upgrade Advisor, Telemetry |
| **SOC Admin** | `ADMIN_EMAIL` | `ADMIN_PASSWORD` | `admin@rakshasutra.org` / `Admin@12345` | SOC alert triage, incident containment, threat intel |
| **Citizen Demo** | *Public 1-Click* | *Public 1-Click* | `demo@rakshasutra.org` / `Citizen@12345` | Public demo access for regular citizens |

> 🔒 **Security Best Practice:** In production (e.g. on Render, Cloud Run, or VPS), set your own private `ADMIN_PASSWORD` and `SUPERADMIN_PASSWORD` in the environment settings. The system will automatically use your secret credentials upon startup.
