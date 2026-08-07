# CodeMe Academy Rollback Runbook

## Emergency Scenarios

### Scenario 1: Frontend Build Corrupts State
**Symptom:** Users report white screens or React Boundary Errors immediately after deployment.
**Action:**
1. Do NOT attempt to hot-patch production code.
2. In your deployment provider (e.g., Vercel/Netlify), click **Rollback to Previous Release**.
3. Verify the previous Service Worker invalidates the new cache.

### Scenario 2: Backend API Failure (5xx Errors)
**Symptom:** The `/api/health` endpoint reports `"status": "degraded"`.
**Action:**
1. Revert the Python deployment artifact to the previous `main` commit.
2. Check `stderr` logs for missing environment variables or uninstalled `pip` dependencies.

### Scenario 3: Database Migration Failure
**Symptom:** The API throws 500s relating to `UndefinedColumn` or `RelationDoesNotExist`.
**Action:**
1. Pause the Frontend (enable maintenance mode) to prevent data writing.
2. Execute the `down` migration explicitly using your migration tool (Alembic/Supabase CLI).
3. Confirm data consistency using the Supabase Dashboard.
4. Rollback the Backend API to match the previous database schema version.

