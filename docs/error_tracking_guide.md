# CodeMe Academy Error Tracking Guide

## Unhandled Exceptions
The `ErrorTracker.tsx` interface queries `api/admin/monitoring/errors`.
It aggregates unhandled backend exceptions (e.g. 500 Internal Server Errors) into the `ErrorLog` table, preserving the stack trace for engineering diagnosis.

