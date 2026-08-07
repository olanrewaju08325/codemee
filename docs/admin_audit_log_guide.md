# CodeMe Academy Audit Log Guide

## Strict Immutability
The `ActivityLog` table cannot be modified or truncated from the UI.
It records every action performed by an Admin or a Teacher (publishing, grading, suspending, payment approvals).

## Audit Viewer
The `AuditLogViewer` component allows administrators to query these events by Date Range, User Role, and Target Object, providing a perfect paper trail for dispute resolution or security investigations.

