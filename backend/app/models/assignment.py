# Compatibility shim — Assignment and AssignmentSubmission live in app.models.course
from app.models.course import Assignment, AssignmentSubmission

__all__ = ["Assignment", "AssignmentSubmission"]
