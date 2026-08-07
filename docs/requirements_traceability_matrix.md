# CodeMe Academy - Requirements Traceability Matrix

| Req ID | Source | Description | Priority | DB Tables | API Route | Frontend UI | Test Coverage | Status |
|---|---|---|---|---|---|---|---|---|
| REQ-000001 | MES Part 1 | Supabase Email Auth | Critical | `auth.users` | `/auth/v1` | `AuthScreen.tsx` | Manual Test, Unit | ? PASS |
| REQ-000002 | MES Part 1 | Session Persistence | High | - | Supabase JS | LocalStorage | E2E | ? PASS |
| REQ-000003 | MES Part 2 | Teacher Dashboard | Critical | `teacher_profiles` | `/api/teacher` | `TeacherDashboard.tsx` | E2E | ? PASS |
| REQ-000004 | MES Part 3 | AI Tutor Subsystem | High | `ai_conversations` | `/api/ai/chat` | `AIChatInterface.tsx` | Integration | ? PASS |
| REQ-000005 | MES Part 4 | Manual Payments Workflow | Critical | `manual_payments` | `/api/payments` | `PaymentVerificationQueue.tsx` | E2E | ? PASS |
| REQ-000006 | MES Part 5 | Dynamic Lesson Models | Critical | `lessons` | `/api/lessons` | `LessonView.tsx` | Unit | ? PASS |
| REQ-000007 | MES Part 5 | Quiz Submissions | High | `quiz_submissions` | `/api/quizzes` | `QuizView.tsx` | Integration | ? PASS |
| REQ-000008 | MES Part 6 | Database Resiliency | High | All | - | - | Migration Check | ? PASS |
| REQ-000009 | MES Part 7 | RBAC Security (RLS) | Critical | All | FastAPI Depends | `AppRouter.tsx` | Security Review | ? PASS |
| REQ-000010 | MES Part 8 | Admin Monitoring Dashboard | High | `system_event_logs` | `/api/admin/monitoring` | `SystemHealthDashboard.tsx` | Integration | ? PASS |
| REQ-000011 | MAC Rule | WD101 Permanently Free | Critical | `courses.price=0` | `/api/courses` | `CourseCatalogView.tsx` | Manual Test | ? PASS |
| REQ-000012 | MAC Rule | Teachers cannot modify pricing | High | `courses` | `/api/teacher/courses` | `TeacherDashboard.tsx` | Security Review | ? PASS |
| REQ-000013 | MAC Rule | Certificates require 100% completion | High | `certificates` | `/api/certificates` | `CertificateView.tsx` | Integration | ? PASS |

