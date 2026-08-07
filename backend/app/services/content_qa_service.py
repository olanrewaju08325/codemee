from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.course import Course, Module, Lesson
from typing import List, Dict, Any

async def validate_course_for_publishing(db: AsyncSession, course_id: str) -> Dict[str, Any]:
    """
    Quality Assurance validation to prevent publishing broken content.
    Returns a dict with 'is_valid' boolean and a list of 'errors'.
    """
    errors = []
    
    # 1. Fetch Course
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        return {"is_valid": False, "errors": ["Course not found."]}

    # 2. Fetch Modules
    modules_result = await db.execute(select(Module).where(Module.course_id == course_id))
    modules = modules_result.scalars().all()
    
    if not modules:
        errors.append("Course has no modules.")
        
    for module in modules:
        # 3. Fetch Lessons per module
        lessons_result = await db.execute(select(Lesson).where(Lesson.module_id == module.id))
        lessons = lessons_result.scalars().all()
        
        if not lessons:
            errors.append(f"Module '{module.title}' has no lessons.")
            
        for lesson in lessons:
            if not lesson.title or len(lesson.title.strip()) < 3:
                errors.append(f"Lesson in module '{module.title}' is missing a valid title.")
            if not lesson.content or len(lesson.content.strip()) < 10:
                errors.append(f"Lesson '{lesson.title}' is empty or too short.")
                
    return {
        "is_valid": len(errors) == 0,
        "errors": errors
    }

