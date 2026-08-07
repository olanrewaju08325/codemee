import logging
import uuid
from typing import Optional
from fastapi import Request

# Configure basic Python logging (in a real app, this would route to a structured JSON formatter)
logger = logging.getLogger("codeme_academy")
logger.setLevel(logging.INFO)

def log_system_event(
    event_type: str, 
    severity: str = "info", 
    user_id: Optional[str] = None, 
    role: Optional[str] = None, 
    resource_affected: Optional[str] = None, 
    outcome: str = "success",
    request: Optional[Request] = None
):
    """
    Logs a structured system event. Does NOT log passwords or secrets.
    """
    req_id = getattr(request.state, "request_id", str(uuid.uuid4())) if request else str(uuid.uuid4())
    
    log_data = {
        "event_type": event_type,
        "severity": severity,
        "user_id": user_id,
        "role": role,
        "resource_affected": resource_affected,
        "outcome": outcome,
        "request_id": req_id
    }
    
    if severity == "critical" or severity == "error":
        logger.error(f"System Event: {log_data}")
    elif severity == "warning":
        logger.warning(f"System Event: {log_data}")
    else:
        logger.info(f"System Event: {log_data}")

