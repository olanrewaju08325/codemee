# CodeMe Academy Deployment Guide

## 1. Prerequisites
- **Node.js**: v18+
- **Python**: 3.10+
- **PostgreSQL**: Managed via Supabase
- **OS Environment**: Windows (PowerShell) or Linux (Bash)

## 2. Automated Pipeline
The deployment is strictly gated by the master pipeline script. 
Execute the following to ensure the codebase is deployment-safe:
```powershell
.\scripts\validate_and_deploy.ps1
```
*If this script fails, STOP immediately. Do not attempt manual deployments.*

## 3. Frontend Deployment (Production)
If the pipeline passes:
1. Compile the production artifact: `npm run build`
2. The compiled static PWA will reside in `frontend/dist/`.
3. Push the `dist/` directory to your CDN/Hosting provider (e.g., Vercel, Netlify, NGINX).

## 4. Backend Deployment (Production)
1. Ensure the Python environment is strictly synced with `requirements.txt`.
2. Start the Uvicorn production server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```
3. Use a reverse proxy (NGINX) or a managed runtime (Railway/Render) to expose port 8000 via HTTPS.

## 5. Post-Deployment Checks
1. Navigate to `https://api.yourdomain.com/health`.
2. Ensure the JSON payload reports `"status": "healthy"`.
3. Open the Frontend and attempt a mock login.

