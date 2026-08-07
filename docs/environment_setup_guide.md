# CodeMe Academy Environment Setup

## Rule of Strict Separation
Production environments must NEVER share secrets with the Development environments.

## Required Variables (`backend/.env`)
Ensure these exact keys exist before executing `.\scripts\validate_and_deploy.ps1`.

### Database
- `DATABASE_URL`: The fully qualified PostgreSQL connection string (Async).

### Supabase
- `SUPABASE_PROJECT_URL`: The API URL of your Supabase instance.
- `SUPABASE_JWT_SECRET`: The exact secret used to decode user sessions.

### Generative AI
- `GROQ_API_KEYS`: A comma-separated list of Groq API keys to facilitate load balancing.

### System Configuration
- `ENVIRONMENT`: Must be set strictly to `production` during deployments.
- `CORS_ORIGINS`: Comma separated list of permitted frontend URLs (e.g., `https://codemeacademy.com`).

## Auditing Secrets
1. Run `.\scripts\validate_environment.ps1` to programmatically ensure variables are intact.
2. Ensure `.env` is globally ignored in `.gitignore`. It should never be checked into source control.

