# CodeMe Academy Security Architecture

## 1. Authentication & Session Management
- **Provider:** Supabase Auth handles all user identities via cryptographically secure JWTs.
- **Session Lifecycles:** Access tokens expire after 1 hour; refresh tokens persist until explicitly revoked or device logged out.
- **Role Authority:** Client-side role objects are purely decorative for UX routing. The ultimate source of truth is the Postgres `profiles.role` column, validated asynchronously by FastAPI dependencies (`require_admin`, `require_teacher`).

## 2. API Boundary Control
- **Input Validation:** Pydantic `v2` enforces strict type checking before Python execution.
- **Rate Limiting:** `slowapi` enforces IP-based rate limiting on sensitive endpoints like `/api/payments` (5 reqs/min) to prevent brute-force abuse.
- **Obfuscation:** All stack traces (`500 Internal Server Error`) are caught globally by FastAPI exception handlers and sanitized before returning to the frontend.

## 3. Database Security (Supabase)
- **Row Level Security (RLS):** Policies ensure that a student can only perform `SELECT` on their own row in the `profiles` table. Cross-tenant data bleeds are impossible at the database engine level.
- **Prepared Statements:** `asyncpg` combined with SQLAlchemy Core prevents SQL Injection by pre-compiling all queries.

## 4. Operational Monitoring
- **Admin Audit Logging:** Every state-mutating action performed by an administrator is securely cataloged into the `admin_audit_logs` table. This log is immutable and serves as a permanent record for accountability.

