# CodeMe Academy Teacher Course Management

## Boundaries
Teachers are designated as Content Authors and Graders for specific courses. 
They CANNOT:
- Alter the monetary price of a course.
- Change global enrollment windows.
- Delete courses outright.
- Modify platform-wide certificates.

## Content Publishing
All teacher-published content is intercepted by the `content_qa_service.py`. If a teacher forgets a lesson title or attempts to publish an empty module, the system will block the state transition and explicitly return the validation error.

