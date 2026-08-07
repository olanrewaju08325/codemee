# CodeMe Academy - Operational Maintenance Calendar

## Weekly Maintenance
- **Review System Event Logs**: Scan `/api/admin/monitoring` for unexpected spike in 5xx errors or unauthorized access attempts.
- **Triage Incident Register**: Ensure all P2/P3 incidents have an assigned owner and resolution path.

## Monthly Maintenance
- **Dependency Audits**: Run `npm audit` on the Vite frontend and `pip-audit` on the FastAPI backend. Prioritize critical CVE patches.
- **Manual Payment Reconciliation**: Cross-reference Supabase `manual_payments` approvals with actual Bank Statements to catch human error or fraud.
- **Storage Cleanup**: Manually purge rejected receipts from Supabase S3 buckets to reduce storage burn-rate.

## Quarterly Reviews
- **Infrastructure Cost Analysis**: Review Vercel, Render, and Groq billing. Determine if caching layers (Redis) need immediate implementation to preserve margins.
- **Disaster Recovery Drills**: Perform a simulated Supabase PiTR (Point-in-Time Recovery) to a staging database to verify backup integrity.

