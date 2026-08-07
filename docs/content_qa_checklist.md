# CodeMe Academy Content QA Checklist

Before transitioning any course to the `published` state, the QA engine must implicitly pass all of the following:

## Structural Integrity
- [ ] Course contains at least 1 Module.
- [ ] Every Module contains at least 1 Lesson or 1 Quiz.
- [ ] Lesson titles are not empty and exceed 3 characters.
- [ ] Lesson content is not empty and exceeds 10 characters.

## Educational Context
- [ ] Every Lesson has an `estimated_duration` specified.
- [ ] Media links (videos, PDFs) are formatted correctly.

If the QA engine flags any of these, the API returns an HTTP 400 with a detailed payload of structural violations, and the status update is aborted.

