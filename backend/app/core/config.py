from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Supabase
    SUPABASE_PROJECT_URL: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Web Push (VAPID)
    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""
    VAPID_SUBJECT: str = "mailto:admin@codemeacademy.com"

    # Secret for internal cron endpoints (X-Cron-Secret header)
    CRON_SECRET: str = ""

    # AI Tutor — provider and daily caps
    AI_PROVIDER: str = "mock"
    AI_DAILY_LIMIT: int = 20
    AI_REVIEW_DAILY_LIMIT: int = 120

    # Groq API keys — comma-separated list for round-robin fallback
    GROQ_API_KEYS: str = ""
    
    # CORS (comma-separated in .env, parsed into a list at runtime)
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://codeme-academy.vercel.app,https://frontend-beryl-psi-45.vercel.app"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # don't crash on unrecognised env vars

settings = Settings()
