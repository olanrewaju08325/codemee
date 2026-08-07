# CodeMe Academy Progress Tracking Guide

## Gamification Foundation
Volume 6 introduces the foundational gamification tracking loop.

### 1. Streaks
- Calculated dynamically via `Profile.last_active_date`.
- If `last_active_date` is < 24 hours ago, increment.
- If > 48 hours ago, reset to 1.
- Displayed prominently in the AppShell header and the Dashboard.

### 2. Percentage Completion
- Derived by dividing `completed_lessons` by total lessons in the course schema.
- Progress updates are atomic database transactions to ensure UI consistency.

