# CodeMe Academy Student Dashboard Guide

## Architecture
The Dashboard relies on `api/student/dashboard` for its telemetry payload.

### Telemetry Yields:
- `has_completed_onboarding`: Dictates whether to popup the wizard.
- `next_recommended_lesson`: Calculated sequentially from `StudentProgress`.
- `streak_count`: Number of consecutive active days.

## UI Strategy
- Avoid overwhelm.
- One primary CTA ("Resume WD101").
- Supporting widgets (Quizzes, Assignments, Bookmarks) pushed to the secondary grid.

