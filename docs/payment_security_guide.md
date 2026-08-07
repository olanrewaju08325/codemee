# CodeMe Academy Payment Security Guide

The application utilizes a manual bank transfer verification workflow. Security relies on operational rigidity rather than third-party payment gateways.

## Hardened Workflow
1. **Student Submission:** The student uploads a receipt. The API validates the file extension and blocks path traversal attempts.
2. **Rate Limiting:** Submission endpoints are throttled to 5 requests per minute per IP to prevent spamming the admin queue.
3. **Admin Verification:** Administrators review the queue.
4. **Audit Logging:** Upon approval or rejection, an immutable audit log is generated tying the admin ID to the specific payment ID, ensuring traceability.

## Threat Mitigation
- **Duplicate Submissions:** The database schema tracks `student_id` and `quiz_id`. The API checks `count_approved_payments` to prevent double-charging or duplicate approvals for the same resource.
- **Double Approvals:** The UI state and backend queries filter exclusively for `pending` status when admins are reviewing, preventing race conditions where two admins approve the same receipt simultaneously.

