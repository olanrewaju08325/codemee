# CodeMe Academy Migration Management Guide

## Core Principles
1. **Never Edit Past Migrations:** Once a migration has been applied to production, it is permanently locked. Editing a historical migration file breaks the Alembic version chain and causes catastrophic synchronization failures.
2. **Forward-Only Changes:** If a mistake is made in production, create a *new* migration to fix it (e.g., `alter_column_type`, `drop_column`). Do not rollback production.

## Migration Generation
- **Alembic:** Used for backend schema management.
- **Workflow:** Modify `app/models/*.py`, then run `alembic revision --autogenerate -m "description"`.
- **Review:** Always manually review the generated SQL before committing. Alembic cannot safely auto-detect table renames or complex constraint changes.

