# CodeMe Academy AI Assisted Teaching Guide

## The AI Editor Plugin
Teachers are supplied with an AI Co-Pilot accessible from `AIAssistantWidget.tsx`.

## Capabilities
- **Draft Outlines:** "Generate a 5-part outline for React Hooks."
- **Generate Quizzes:** "Create 3 multiple-choice questions on useState."

## Safety Rails
- The API explicitly returns a string buffer (`api/teacher/ai/draft`). 
- This buffer is injected into the client-side rich text editor state.
- The AI has **zero** permission to write directly to the database or alter live course schemas. Human approval is structurally enforced.

