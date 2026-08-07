# CodeMe Academy Logging Guide

## Structured Logging
Logs are structured as JSON via the `SystemEventLog` table and standard `logging.py` interceptors.

## Constraints
- **NO SECRETS:** The `log_system_event` explicitly strips payload data that matches passwords or API keys.
- **Traceability:** A unique `request_id` is assigned to each inbound HTTP request to correlate events across the stack.

