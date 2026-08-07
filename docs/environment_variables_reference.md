# CodeMe Academy Environment Variables Reference

This document catalogs all environment variables required by CodeMe Academy. 
**NEVER commit actual secrets or `.env` files to source control.**

## Backend (`backend/.env`)

### Database Connection
| Variable | Description | Example / Allowed Values |
|----------|-------------|--------------------------|
| `DATABASE_URL` | The PostgreSQL connection string using `asyncpg` | `postgresql+asyncpg://user:pass@host:5432/db` |

### Supabase / Authentication
| Variable | Description | Example / Allowed Values |
|----------|-------------|--------------------------|
| `SUPABASE_PROJECT_URL` | API URL for the Supabase project | `https://xyz.supabase.co` |
| `SUPABASE_JWT_SECRET` | Secret used to decode incoming user sessions | `long-base64-encoded-string` |

### Generative AI (Groq)
| Variable | Description | Example / Allowed Values |
|----------|-------------|--------------------------|
| `AI_PROVIDER` | Defines the active LLM provider | `groq` |
| `GROQ_API_KEYS` | Comma-separated list of active API keys | `gsk_abc123,gsk_def456` |

### Core System
| Variable | Description | Example / Allowed Values |
|----------|-------------|--------------------------|
| `ENVIRONMENT` | Running mode | `development` or `production` |
| `CORS_ORIGINS` | Permitted frontend origins | `http://localhost:5173,https://codemeacademy.com` |
| `CRON_SECRET` | Secret authorizing background worker execution | `secure-random-string` |

## Frontend (`frontend/.env`)
*Note: Vite exposes variables prefixed with `VITE_` to the client browser.*

| Variable | Description | Example / Allowed Values |
|----------|-------------|--------------------------|
| `VITE_API_URL` | Public REST backend URL | `https://api.codemeacademy.com` |
| `VITE_SUPABASE_URL` | Public Supabase URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase Key for auth | `ey...` |

