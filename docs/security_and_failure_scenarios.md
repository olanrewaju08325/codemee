# CodeMe Academy - Security & Failure Scenarios Matrix

## 1. Security Journeys (Negative Testing)
| Scenario | Attempt | Outcome / Graceful Degradation | Status |
|---|---|---|---|
| Privilege Escalation | Student attempts to fetch `/api/admin/payments`. | `403 Forbidden` JSON blob returned. UI renders ErrorState block. | ? PASS |
| Financial Manipulation | Teacher attempts to approve a pending payment receipt. | Backend middleware rejects request. DB untouched. | ? PASS |
| Replay Attack | Student attempts to upload the exact same receipt twice. | DB Unique Constraint violation caught. 409 Conflict returned. | ? PASS |
| Unauthenticated Access | Guest attempts to view raw lesson markdown. | `401 Unauthorized`. Redirected to `/login`. | ? PASS |

## 2. Infrastructure Failure Scenarios
| Scenario | Attempt | Outcome / Graceful Degradation | Status |
|---|---|---|---|
| AI Timeout | Groq API exceeds 10-second latency window. | Circuit breaker triggers. UI informs student "Tutor is currently resting." | ? PASS |
| Storage Bucket Unavailable | Supabase S3 bucket rejects file upload. | UI catches 5xx, alerts user to retry via Toast notification. | ? PASS |
| DB Disconnection | SQLAlchemy loses connection pool. | Global exception handler catches `OperationalError`, returns generic 500 without leaking schema data. | ? PASS |

## 3. Business Rule Invariants
| Rule | Verification Method | Status |
|---|---|---|
| WD101 Permanently Free | DB Default Constraint + API Check. | ? PASS |
| Batch Capacity Respected | DB `enrollment_count < batch.capacity` check. | ? PASS |
| Certificates require 100% | Generation logic traverses `progress` table. | ? PASS |

