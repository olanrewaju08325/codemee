# Compatibility shim — StudentProgress lives in app.models.course
from app.models.course import StudentProgress

__all__ = ["StudentProgress"]
