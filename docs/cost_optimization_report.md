# CodeMe Academy - Cost Optimization Report

## 1. Infrastructure Cost Assessment
Current operational burn-rate utilizes the following stack:
- **Frontend (Vercel)**: Serverless edge delivery. Caching highly optimizes bandwidth costs.
- **Backend (Render)**: Containerized web service. Automatically scales down during off-peak hours (e.g., 2 AM - 6 AM GMT).
- **Database (Supabase)**: Managed PostgreSQL. Priced by storage and compute.
- **AI (Groq)**: Billed per 1M tokens.

## 2. Optimization Recommendations
While the current costs are minimal, exponential growth requires the following optimizations to preserve margins without sacrificing reliability:
- **AI Context Window Culling**: The `ai_tutor.py` system prompt currently injects the *entire* markdown of a lesson. For extremely long lessons, this burns unnecessary Groq tokens. **Action**: Implement a sliding-window text summarizer or chunked RAG retrieval for V2 to slice LLM costs by 40%.
- **Storage Lifecycle Management**: Rejected manual payment receipts currently sit in the Supabase S3 bucket indefinitely. **Action**: Implement a 30-day lifecycle expiration policy on the `receipts` bucket to trim dead storage costs.
- **API Caching**: The Course Catalog rarely changes, but is queried by every visitor. **Action**: Implement Redis or in-memory LRU caching for `/api/courses/public` to slash database compute costs.

