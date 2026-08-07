# CodeMe Academy - Technical Debt Register

## 1. Code Quality Analysis
Static analysis via `oxlint` and TypeScript compiler reveals an exceedingly clean repository. However, minor technical debt vectors exist:

| Component / Area | Description of Debt | Complexity | Recommendation for V2 |
|---|---|---|---|
| `PaymentVerificationQueue.tsx` | UI component contains heavy inline data-fetching logic rather than using a custom hook. | Medium | Extract `useAdminPayments()` hook to improve modularity and testability. |
| DB Migrations | The `legacy_payments` table remains in the schema but is entirely orphaned. | Low | Generate an Alembic migration to `DROP TABLE legacy_payments`. |
| Bundle Size | The `lucide-react` icon library is imported aggressively, bloating the initial JS chunk. | Low | Refactor imports to pull specific icons (e.g. `lucide-react/icons/user`) to drastically improve tree-shaking. |

## 2. Future Growth Readiness
The application is structurally prepared to accommodate:
- Additional Instructors and Courses (Normalized DB relationships).
- CDN Integration (Vite static compilation).
- Microservice Migration (FastAPI routers are already strictly decoupled by domain).

