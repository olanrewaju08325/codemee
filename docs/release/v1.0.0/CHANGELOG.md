# CodeMe Academy - CHANGELOG

## [v1.0.0] - Launch Candidate

### Added
- Complete Student Dashboard and learning environment (Markdown parsing, Quiz Engine, Assignment Uploads).
- Complete Teacher Dashboard (Lesson drafting, Rubric grading, Student tracking).
- Complete Admin Dashboard (Role management, Batch tracking).
- Manual Payment Verification pipeline (Receipt upload, DB deduplication, status approval).
- Groq LLaMA 3.1 AI Tutor integration with system prompt guardrails.
- Supabase Authentication (Email/Password & JWT propagation).
- Supabase Storage integration for assets and assignments.
- Cryptographically signed PDF Certificate Generation engine.
- Responsive tailwind-like UI across Mobile, Tablet, and Desktop breakpoints via global CSS variables.

### Security
- Granular Role-Based Access Control (RBAC) enforced via FastAPI `Depends()` middleware.
- Database Row Level Security (RLS) active on all critical tables.
- Protection against SQLi, XSS, and IDOR validated.

### Performance
- Vite code-splitting and asset lazy loading.
- SQLAlchemy connection pooling.

