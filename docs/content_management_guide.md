# CodeMe Academy Content Management Guide

## 1. Course Lifecycle
Every course strictly transitions through:
1. **Draft**: Invisible to students. Work-in-progress.
2. **Under Review**: Submitted by a teacher to an Admin.
3. **Approved**: Passed QA checks.
4. **Published**: Visible to students.
5. **Active**: Live course handling enrollments.
6. **Maintenance**: Temporarily hidden for structural repairs.
7. **Archived**: Read-only historical record.

## 2. Quality Assurance Validation
The `content_qa_service` acts as a gatekeeper. A course cannot transition to **Approved** or **Published** if it violates schema requirements (e.g. empty lessons, missing titles, missing prerequisites).

## 3. Safe Live Editing
When an Admin or Teacher edits a **Published** course, the changes are auto-versioned. Progress records tied to existing `student_id` and `lesson_id` mappings remain intact. Major structural changes should occur in Maintenance mode.

