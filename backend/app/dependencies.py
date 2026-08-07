# Compatibility shim — re-exports from app.core.security
# analytics.py imports from app.dependencies; this module satisfies those imports.
from app.core.security import get_current_user, require_role, require_admin, require_teacher

def require_teacher_or_admin(user=None):
    """Alias that maps to require_teacher (admin is included via cascading access)."""
    pass

# Override with real dependency factory
require_teacher_or_admin = require_role(["teacher", "admin"])

__all__ = ["get_current_user", "require_role", "require_admin", "require_teacher", "require_teacher_or_admin"]
