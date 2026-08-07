# CodeMe Academy Backup & Recovery Guide

## Backup Strategy
CodeMe Academy leverages Supabase Point-in-Time Recovery (PITR).
- **Frequency**: Continuous WAL (Write-Ahead Log) archiving.
- **Retention**: 7 to 30 days depending on the Supabase Pro plan tier.
- **Scope**: Includes database schema, data, and Supabase Storage metadata.

## Restoration Procedure (Disaster Recovery)
If database corruption occurs (e.g., accidental `DELETE` without a `WHERE` clause):
1. **Access Supabase Dashboard**: Navigate to Database -> Backups -> PITR.
2. **Select Timestamp**: Choose the exact minute before the corruption occurred.
3. **Initiate Restore**: Click "Restore". Note that the API will experience downtime (typically 2-5 minutes) while the instance reboots.

## Storage Recovery
If physical storage objects (e.g., PDFs) are deleted, they must be restored via the Supabase Storage API backups, which are synchronized with the database snapshots.

