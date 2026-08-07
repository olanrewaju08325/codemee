# Compatibility shim — re-exports from app.core.database
# Several routers import from app.database; this module satisfies those imports.
from app.core.database import engine, Base, get_db, AsyncSessionLocal

__all__ = ["engine", "Base", "get_db", "AsyncSessionLocal"]
