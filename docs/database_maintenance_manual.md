# CodeMe Academy Database Maintenance Manual

## Automated Maintenance Tasks
To ensure the database does not degrade over time, several automated cleanup routines are required.

### 1. Notification Cleanup
- **Task**: Delete read notifications older than 30 days.
- **Schedule**: Weekly via cron or Supabase pg_cron.
- **Query**: `DELETE FROM notifications WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days';`

### 2. Orphaned Uploads
- **Task**: Identify and remove files in Supabase Storage that do not have corresponding references in `exam_payment_verification` or `profiles.avatar_url`.
- **Schedule**: Monthly.

### 3. Vacuum Analyze (Managed)
- Supabase automatically runs PostgreSQL `autovacuum` daemon to reclaim storage from dead tuples (deleted rows). Manual vacuuming is not required unless heavy bulk deletions occur.

