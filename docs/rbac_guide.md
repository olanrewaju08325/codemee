# CodeMe Academy RBAC Guide

Role-Based Access Control (RBAC) dictates what actions a user can perform. Roles are statically defined in the `profiles` table as ENUMs (`student`, `teacher`, `admin`).

## Student Role
- **Capabilities:** View enrolled courses, submit assignments/quizzes, upload payment receipts, utilize the AI tutor.
- **Restrictions:** Cannot edit courses, view non-enrolled user data, approve payments, or access the `/api/admin` namespace.

## Teacher Role
- **Capabilities:** Manage content for assigned courses, review student submissions for those courses, broadcast announcements.
- **Restrictions:** Cannot alter system pricing, approve payments, or modify administrative settings.

## Admin Role
- **Capabilities:** Unrestricted platform control. Can approve payments, manage user roles, view global analytics.
- **Restrictions (Accountability):** Every action is logged in the `admin_audit_logs` table. The `admin` role is the highest privilege level.

