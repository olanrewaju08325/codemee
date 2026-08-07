# CodeMe Academy - Frontend UI Inventory

## 1. Dashboards & Pages
| View | Description | Status |
|---|---|---|
| `AdminPortal.tsx` | Centralized hub for system management, monitoring, and financial verification. | ? Verified |
| `TeacherDashboard.tsx` | Portal for course grading, quiz generation, and announcements. | ? Verified |
| `Dashboard.tsx` | (Student) Core landing hub with Progress Cards and Study Streaks. | ? Verified |
| `LandingView.tsx` | Public-facing marketing splash page with Course Showcases. | ? Verified |
| `AuthScreen.tsx` | Registration, Login, and Password Reset gateway. | ? Verified |

## 2. Shared Reusable Components
| Component | Description | Status |
|---|---|---|
| `Card.tsx` | Standard glassmorphism container. | ? Verified |
| `Grid.tsx` | Responsive flex/grid wrapper. | ? Verified |
| `Skeleton.tsx` | Standardized loading state shimmer. | ? Verified |
| `EmptyState.tsx` | Standardized no-data fallback with illustrations. | ? Verified |
| `ErrorBarContext.tsx`| Global alert banner for network/validation errors. | ? Verified |
| `AIChatInterface.tsx`| Shared LLM prompt UI for both Teachers (Drafting) and Students (Tutoring). | ? Verified |

## 3. Form & Table Elements
| Element | Description | Status |
|---|---|---|
| `UserManagementTable.tsx` | Admin datagrid for suspending/modifying roles. | ? Verified |
| `PaymentVerificationQueue.tsx`| Admin datagrid for approving manual bank transfer receipts. | ? Verified |
| `CourseCatalogView.tsx` | Student grid for browsing available curricula. | ? Verified |

## 4. Unused / Missing Components
- **Missing Components**: None. The platform conforms exactly to the MES spec.
- **Unused Components**: The `MoreVertical` standard icon import was deprecated following table overhauls in Volume 8, but was cleared during deployment linting.

