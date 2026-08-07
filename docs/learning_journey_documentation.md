# CodeMe Academy Learning Journey

## The Sequential Pipeline
We enforce a strict linear pipeline to prevent students from feeling lost:

1. **Course Introduction:** High-level summary and learning objectives.
2. **Modules:** Logical chunking of topics.
3. **Lessons:** The atomic unit of instruction. Contains rich text, video, and resources.
4. **Quizzes:** Validates knowledge retention before allowing progression.
5. **Assignments:** Practical application of theory.
6. **Certificate:** The final reward upon 100% completion.

## "Mark as Complete" Logic
A lesson cannot be truly skipped. Clicking "Mark as Complete" triggers a validation API call. If a module contains a mandatory quiz, the next module remains locked until a passing grade is achieved.

