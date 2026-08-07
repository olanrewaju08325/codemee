from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.security import require_role
import time

router = APIRouter(prefix="/api/teacher/ai", tags=["Teacher Operations"])

@router.post("/draft")
def ai_draft_content(prompt: str = Body(..., embed=True), user=Depends(require_role(["teacher", "admin"]))):
    """
    Simulates calling the Groq AI service to draft lesson outlines or quiz questions.
    In a real implementation, this would call the Groq API.
    """
    time.sleep(1) # Simulate network delay
    return {
        "suggestion": f"## AI Draft based on: {prompt}\n\nThis is a suggested outline. Please review and edit before saving.\n\n1. Introduction\n2. Core Concepts\n3. Practical Application\n4. Conclusion"
    }

