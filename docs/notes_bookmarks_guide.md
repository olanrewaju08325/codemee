# CodeMe Academy Notes & Bookmarks Guide

## Personal Notes
Students can maintain an organized collection of rich-text notes tied specifically to course entities.
- **Privacy:** Notes are strictly private to the student's `student_id`.
- **Auto-save:** The frontend editor debounces input and pushes silent background updates.
- **Organization:** Notes are categorized by `entity_type` (e.g. course, module, lesson).

## Bookmarks
The "My Bookmarks" dashboard provides a unified view of saved content.
- Bookmarks store `title_snapshot` and `url_snapshot` to avoid expensive database JOINs on load.
- Students can filter by type: `lesson`, `resource`, `announcement`.

