# CodeMe Academy - Backend API Inventory

## 1. Routers
| Route Prefix | Domain | Controller Location | Verified |
|---|---|---|---|
| `/api/admin` | Global Administration | `app/routers/admin_*.py` | ? Yes |
| `/api/teacher` | Instructor Portal | `app/routers/teacher_*.py` | ? Yes |
| `/api/student` | Learner Data & Progress | `app/routers/student_*.py` | ? Yes |
| `/api/courses` | Catalog & Content | `app/routers/courses.py` | ? Yes |
| `/api/ai` | Groq LLaMA Integrations | `app/routers/ai_tutor.py` | ? Yes |
| `/api/auth` | Supabase Delegation | `app/routers/auth.py` | ? Yes |

## 2. Models & Database Schemas
| Schema Table | ORM Model | Purpose | Verified |
|---|---|---|---|
| `users` (Auth) | `User` | Maps Supabase Auth ID to local RBAC profiles | ? Yes |
| `courses` | `Course` | Pricing, requirements, active status | ? Yes |
| `lessons` | `Lesson` | Atomic markdown content | ? Yes |
| `manual_payments` | `ManualPayment` | Verification queue for bank transfers | ? Yes |
| `certificates` | `Certificate` | Cryptographically signed completion records | ? Yes |
| `ai_conversations` | `AIConversation` | Logging of prompt history for context injection | ? Yes |
| `system_event_logs` | `SystemEventLog` | General application health and audit trails | ? Yes |

## 3. Middleware & Core Services
- `require_role(allowed_roles: list[str])`: Primary authorization dependency injecting context.
- `DatabaseSession`: SQLAlchemy async session pooling factory.
- `ErrorHandler`: Standardized HTTP Exception catchers translating to 400/401/403/404 JSON blobs.

## 4. Unused / Missing Modules
- **Missing**: None. The API surface covers 100% of the UI demands.
- **Unused**: The `legacy_payments` controller logic was successfully deleted during the migration to manual payments, leaving no dead code.

