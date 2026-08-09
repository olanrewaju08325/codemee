# CodeMe Academy

CodeMe Academy is a three-panel technology learning platform for a private Nigerian academy.

- **Students** discover courses, apply, pay by verified manual transfer, learn, complete assessments, receive support, and earn eligible certificates.
- **Teachers** manage only the courses assigned to them: course content, live classes, assignments, quizzes, academic support, and grading.
- **Admins** manage the academy: courses, teacher invitations and assignments, enrolment, manual-payment verification, certificates, support, communication settings, and platform configuration.

## Product model

Each course can be configured as **Live**, **Self-Paced**, or **Hybrid**. Course access is activated only after an administrator verifies the learner's payment submission. The payment model supports Bank Transfer, Moniepoint, and PalmPay today, while keeping invoices and payments ready for future instalments and online gateways.

Quiz and final-exam controls are owned by the assigned teacher or an admin. Course payment and quiz/exam retake payment are separate concepts.

## Architecture

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, PWA |
| Backend | FastAPI, SQLAlchemy async |
| Database & Auth | Supabase PostgreSQL and Supabase Auth |
| File storage | Supabase Storage (private payment receipts) |
| Hosting | Vercel frontend and Render backend |

## Repository layout

```text
frontend/                 React application
backend/                  FastAPI application
supabase/migrations/      Ordered database migrations
```

## Environment configuration

Never commit real secrets. The frontend receives only public values; the backend owns all private credentials.

### Vercel (frontend)

```env
SUPABASE_PROJECT_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
VITE_API_BASE_URL=https://your-render-api.onrender.com
VITE_VAPID_PUBLIC_KEY=your-public-vapid-key
```

`SUPABASE_PROJECT_URL` and `SUPABASE_ANON_KEY` deliberately use the normal names above. `vite.config.ts` injects only those two public values into the browser build. Do not put `SUPABASE_SERVICE_ROLE_KEY` in Vercel.

### Render (backend)

```env
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_PROJECT_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
FRONTEND_URL=https://your-vercel-site.vercel.app
CORS_ORIGINS=https://your-vercel-site.vercel.app
ENVIRONMENT=production
SMTP_HOST=...
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
AI_PROVIDER=groq
GROQ_API_KEYS=...
```

`SUPABASE_SERVICE_ROLE_KEY`, SMTP credentials, JWT secret, and AI keys belong **only** in Render. `FRONTEND_URL` and `CORS_ORIGINS` must use the exact Vercel production URL, with no trailing slash.

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Database migrations

Apply the SQL migrations in ascending order in Supabase SQL Editor. Do not run ad-hoc diagnostic SQL against production. Before launch, confirm migrations `034_course_commerce.sql`, `035_staff_roles_and_support.sql`, `036_exam_mode.sql`, and `037_three_panel_roles.sql` have all completed successfully.

## Pre-launch checklist

- Enter real academy contact and manual-payment details through Admin Settings.
- Set the actual Vercel production URL in both Render URL settings.
- Create the owner admin account and invite real teachers.
- Assign each teacher to the courses they should manage.
- Make one controlled payment submission and verify access activation.
- Validate private receipt viewing, course access, final assessment, certificate eligibility, SMTP, and support routing in staging.
- Run the frontend production build and backend test suite before every deploy.

## Security notes

- Payment receipts are stored privately and accessed by time-limited signed URLs.
- Roles are limited to `admin`, `teacher`, and `student`.
- Teachers are restricted to their assigned courses.
- Correct quiz answers are not sent with the student quiz payload.
- Secrets stay in hosting-provider environment settings, never in GitHub.

## Status

The academy commerce, course delivery modes, assessment controls, support routing, and three-role model are implemented. Production launch remains conditional on runtime verification, real business settings, staff setup, and the final security/runtime cleanup listed in the launch checklist.
