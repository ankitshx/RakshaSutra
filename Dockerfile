# ==============================================================================
# Multi-Stage Dockerfile for RakshaSutra
# Builds React Vite Frontend + FastAPI Backend into a single hardened container.
# Ready for Google Cloud Run, Render, Railway, Fly.io, or Docker.
# ==============================================================================

# STAGE 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --silent

COPY frontend/ ./
RUN npm run build

# STAGE 2: Python FastAPI Production Backend
FROM python:3.11-slim AS production

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend source
COPY backend/ /app/backend/

# Copy compiled frontend from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Set working directory to backend
WORKDIR /app/backend

# Create non-root user for security
RUN useradd -m -u 1000 raksha && chown -R raksha:raksha /app
USER raksha

EXPOSE 8080

CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
