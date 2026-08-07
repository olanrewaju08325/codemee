# CodeMe Academy Hosting Configuration

## Frontend (Vercel)
The frontend is a static Vite application optimized as a Progressive Web Application.

### Configuration settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Routing**: Client-side routing is handled strictly. A `vercel.json` rewrite rule must be added:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Caching**: Stale-while-revalidate headers are pushed to CDN edges automatically.

## Backend (Render / Railway)
The backend is an asynchronous FastAPI service requiring consistent long-lived memory allocations.

### Configuration settings
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4`
- **Python Version**: `3.10` or higher.
- **Resource Profiling**: Allocate minimum `1GB RAM / 1 CPU` due to Pandas and async HTTP pools running concurrently.

## Database (Supabase)
PostgreSQL managed by Supabase.

### Configuration settings
- **Connection Pooling**: `Supavisor` is strongly recommended over PgBouncer for IPv4 connections to the serverless backend.
- **Backups**: Daily PITR (Point-In-Time-Recovery) must be enabled.
- **RLS (Row Level Security)**: Active by default across all public tables, isolating data via `auth.uid()`.

