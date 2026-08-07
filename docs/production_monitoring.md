# CodeMe Academy Production Monitoring

## Objective
Identify issues before the users report them by monitoring the four golden signals: Latency, Traffic, Errors, and Saturation.

## 1. Application Health (`/api/health`)
- We have introduced a strict health check endpoint.
- **Action:** Configure an uptime monitor (e.g., UptimeRobot, BetterStack) to GET `https://api.yourdomain.com/health` every 1 minute.
- If it returns `503 Service Unavailable`, trigger an immediate PagerDuty or Slack alert.

## 2. Server Logs
- The FastAPI logging configuration now isolates `ERROR` and `CRITICAL` logs.
- **Action:** Pipe `stdout` and `stderr` to a centralized log aggregator like DataDog or AWS CloudWatch. Set alarms if error frequencies spike over 5% of total traffic.

## 3. Database Saturation
- **Action:** Monitor Supabase dashboard metrics, specifically the **Disk IO** and **Connection Limits**.
- CodeMe Academy utilizes `asyncpg` which pools connections. Ensure the Postgres `max_connections` limit is respected to prevent 500 errors under heavy student loads.

