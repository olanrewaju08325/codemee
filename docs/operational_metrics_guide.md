# CodeMe Academy Operational Metrics Guide

## API Latency
The `PerformanceMetrics.tsx` dashboard highlights critical bottlenecks.
- API Latency (p99) tracks the slowest 1% of backend requests.
- AI Token Latency tracks the response time of the external Groq LLaMA inferences.

## Actionable Data
Administrators should use this telemetry to determine when database query optimization or instance scaling is required.

