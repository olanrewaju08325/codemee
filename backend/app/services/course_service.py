from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func, insert, delete
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime
import uuid
from app.models.course import Course, Module, Lesson, Assignment, StudentProgress, AssignmentSubmission
from app.models.enrollment import StudentEnrollment
from app.schemas.course import (
    CourseResponse,
    CourseCreate,
    CourseUpdate,
    ModuleResponse,
    ModuleCreate,
    ModuleUpdate,
    LessonResponse,
    LessonCreate,
    LessonUpdate,
    AssignmentResponse,
    AssignmentCreate,
    AssignmentUpdate,
    StudentProgressResponse,
    AssignmentSubmissionResponse,
    AssignmentSubmissionCreate,
    AssignmentSubmissionUpdate
)
from app.services.push_service import queue_push_many

def _course_response(c: Course) -> CourseResponse:
    return CourseResponse(
        id=c.id, title=c.title, description=c.description, is_active=c.is_active,
        whatsapp_group_cap=c.whatsapp_group_cap, platform_access_cap=c.platform_access_cap,
        total_batches=c.total_batches, single_batch_only=c.single_batch_only,
        price=float(c.price or 0), currency=c.currency, level=c.level,
        duration_weeks=c.duration_weeks, display_tag=c.display_tag, status=c.status,
        delivery_mode=c.delivery_mode, payment_required=c.payment_required, created_at=c.created_at,
    )

# Course functions
async def get_all_courses(db: AsyncSession) -> List[CourseResponse]:
    """Get all courses."""
    result = await db.execute(
        select(Course).order_by(Course.id)
    )
    courses = result.scalars().all()
    
    return [
        _course_response(c)
        for c in courses
    ]

async def get_course_by_id(db: AsyncSession, course_id: str) -> Optional[CourseResponse]:
    """Get a specific course by ID."""
    result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    
    if not course:
        return None
    
    return _course_response(course)

async def create_course(db: AsyncSession, course_data: CourseCreate) -> CourseResponse:
    """Create a new course."""
    course = Course(**course_data.model_dump())
    db.add(course)
    await db.commit()
    
    return _course_response(course)

async def update_course(db: AsyncSession, course_id: str, course_data: CourseUpdate) -> Optional[CourseResponse]:
    """Update an existing course."""
    update_data = {k: v for k, v in course_data.model_dump().items() if v is not None}
    
    await db.execute(
        update(Course).where(Course.id == course_id).values(**update_data)
    )
    await db.commit()
    
    return await get_course_by_id(db, course_id)

# Module functions
async def get_modules_by_course(db: AsyncSession, course_id: str) -> List[ModuleResponse]:
    """Get all modules for a course, ordered by index."""
    result = await db.execute(
        select(Module)
        .where(Module.course_id == course_id)
        .order_by(Module.order_index)
    )
    modules = result.scalars().all()
    
    return [
        ModuleResponse(
            id=str(m.id),
            course_id=m.course_id,
            title=m.title,
            order_index=m.order_index,
            project_scenario=m.project_scenario,
            project_instructions=m.project_instructions,
            project_solution=m.project_solution,
            is_published=m.is_published,
            created_at=m.created_at
        )
        for m in modules
    ]

async def get_module_by_id(db: AsyncSession, module_id: str) -> Optional[ModuleResponse]:
    """Get a specific module by ID."""
    result = await db.execute(
        select(Module).where(Module.id == module_id)
    )
    module = result.scalar_one_or_none()
    
    if not module:
        return None
    
    return ModuleResponse(
        id=str(module.id),
        course_id=module.course_id,
        title=module.title,
        order_index=module.order_index,
        project_scenario=module.project_scenario,
        project_instructions=module.project_instructions,
        project_solution=module.project_solution,
        is_published=module.is_published,
        created_at=module.created_at
    )

async def create_module(db: AsyncSession, module_data: ModuleCreate) -> ModuleResponse:
    """Create a new module."""
    module = Module(**module_data.model_dump())
    db.add(module)
    await db.commit()
    
    return ModuleResponse(
        id=str(module.id),
        course_id=module.course_id,
        title=module.title,
        order_index=module.order_index,
        project_scenario=module.project_scenario,
        project_instructions=module.project_instructions,
        project_solution=module.project_solution,
        is_published=module.is_published,
        created_at=module.created_at
    )

async def update_module(db: AsyncSession, module_id: str, module_data: ModuleUpdate) -> Optional[ModuleResponse]:
    """Update an existing module."""
    update_data = {k: v for k, v in module_data.model_dump().items() if v is not None}
    
    await db.execute(
        update(Module).where(Module.id == module_id).values(**update_data)
    )
    
    return await get_module_by_id(db, module_id)

async def toggle_module_publish(db: AsyncSession, module_id: str) -> Optional[ModuleResponse]:
    """Toggle module publish status."""
    result = await db.execute(
        select(Module).where(Module.id == module_id)
    )
    module = result.scalar_one_or_none()
    
    if not module:
        return None
    
    await db.execute(
        update(Module)
        .where(Module.id == module_id)
        .values(is_published=not module.is_published)
    )
    
    return await get_module_by_id(db, module_id)

async def delete_module(db: AsyncSession, module_id: str) -> bool:
    """Delete a module."""
    await db.execute(
        delete(Module).where(Module.id == module_id)
    )
    return True

# Lesson functions
async def get_lessons_by_module(db: AsyncSession, module_id: str) -> List[LessonResponse]:
    """Get all lessons for a module, ordered by index."""
    result = await db.execute(
        select(Lesson)
        .where(Lesson.module_id == module_id)
        .order_by(Lesson.order_index)
    )
    lessons = result.scalars().all()
    
    return [
        LessonResponse(
            id=str(l.id),
            module_id=str(l.module_id),
            title=l.title,
            content=l.content,
            video_url=l.video_url,
            pdf_url=l.pdf_url,
            order_index=l.order_index,
            created_at=l.created_at
        )
        for l in lessons
    ]

async def get_lessons_by_modules(db: AsyncSession, module_ids: List[str]) -> List[LessonResponse]:
    """Get lessons for multiple modules (for course view)."""
    result = await db.execute(
        select(Lesson)
        .where(Lesson.module_id.in_(module_ids))
        .order_by(Lesson.order_index)
    )
    lessons = result.scalars().all()
    
    return [
        LessonResponse(
            id=str(l.id),
            module_id=str(l.module_id),
            title=l.title,
            content=l.content,
            video_url=l.video_url,
            pdf_url=l.pdf_url,
            order_index=l.order_index,
            created_at=l.created_at
        )
        for l in lessons
    ]

async def get_lesson_by_id(db: AsyncSession, lesson_id: str) -> Optional[LessonResponse]:
    """Get a specific lesson by ID with module data."""
    result = await db.execute(
        select(Lesson, Module)
        .join(Module, Lesson.module_id == Module.id)
        .where(Lesson.id == lesson_id)
    )
    lesson_data = result.first()
    
    if not lesson_data:
        return None
    
    lesson, module = lesson_data
    
    return LessonResponse(
        id=str(lesson.id),
        module_id=str(lesson.module_id),
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        pdf_url=lesson.pdf_url,
        order_index=lesson.order_index,
        created_at=lesson.created_at
    )

async def create_lesson(db: AsyncSession, lesson_data: LessonCreate) -> LessonResponse:
    """Create a new lesson."""
    lesson = Lesson(**lesson_data.model_dump())
    db.add(lesson)
    await db.commit()
    
    return LessonResponse(
        id=str(lesson.id),
        module_id=str(lesson.module_id),
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        pdf_url=lesson.pdf_url,
        order_index=lesson.order_index,
        created_at=lesson.created_at
    )

async def update_lesson(db: AsyncSession, lesson_id: str, lesson_data: LessonUpdate) -> Optional[LessonResponse]:
    """Update an existing lesson."""
    update_data = {k: v for k, v in lesson_data.model_dump().items() if v is not None}
    
    await db.execute(
        update(Lesson).where(Lesson.id == lesson_id).values(**update_data)
    )
    
    return await get_lesson_by_id(db, lesson_id)

async def delete_lesson(db: AsyncSession, lesson_id: str) -> bool:
    """Delete a lesson."""
    await db.execute(
        delete(Lesson).where(Lesson.id == lesson_id)
    )
    return True

# Assignment functions
async def get_assignments_by_module(db: AsyncSession, module_id: str) -> List[AssignmentResponse]:
    """Get all assignments for a module."""
    result = await db.execute(
        select(Assignment).where(Assignment.module_id == module_id)
    )
    assignments = result.scalars().all()
    
    return [
        AssignmentResponse(
            id=str(a.id),
            module_id=str(a.module_id),
            title=a.title,
            description=a.description,
            rubric_url=a.rubric_url,
            created_at=a.created_at
        )
        for a in assignments
    ]

async def get_assignments_by_modules(db: AsyncSession, module_ids: List[str]) -> List[AssignmentResponse]:
    """Get assignments for multiple modules (for course view)."""
    result = await db.execute(
        select(Assignment)
        .where(Assignment.module_id.in_(module_ids))
    )
    assignments = result.scalars().all()
    
    return [
        AssignmentResponse(
            id=str(a.id),
            module_id=str(a.module_id),
            title=a.title,
            description=a.description,
            rubric_url=a.rubric_url,
            created_at=a.created_at
        )
        for a in assignments
    ]

async def get_assignment_by_id(db: AsyncSession, assignment_id: str) -> Optional[AssignmentResponse]:
    """Get a specific assignment by ID."""
    result = await db.execute(
        select(Assignment).where(Assignment.id == assignment_id)
    )
    assignment = result.scalar_one_or_none()
    
    if not assignment:
        return None
    
    return AssignmentResponse(
        id=str(assignment.id),
        module_id=str(assignment.module_id),
        title=assignment.title,
        description=assignment.description,
        rubric_url=assignment.rubric_url,
        created_at=assignment.created_at
    )

async def create_assignment(db: AsyncSession, assignment_data: AssignmentCreate) -> AssignmentResponse:
    """Create a new assignment."""
    assignment = Assignment(**assignment_data.model_dump())
    db.add(assignment)
    await db.commit()

    await _push_assignment_posted(db, assignment)

    return AssignmentResponse(
        id=str(assignment.id),
        module_id=str(assignment.module_id),
        title=assignment.title,
        description=assignment.description,
        rubric_url=assignment.rubric_url,
        created_at=assignment.created_at
    )

async def _push_assignment_posted(db: AsyncSession, assignment: Assignment) -> None:
    """Fan out a web push to enrolled students when a new assignment is posted.

    Push-only wiring (no in-app notification): mirrors the other trigger points
    so assignment posting also reaches student devices.
    """
    try:
        module_result = await db.execute(
            select(Module).where(Module.id == assignment.module_id)
        )
        module = module_result.scalar_one_or_none()
        if not module:
            return

        enroll_result = await db.execute(
            select(StudentEnrollment.student_id).where(
                StudentEnrollment.course_id == module.course_id,
                StudentEnrollment.status == "enrolled",
                StudentEnrollment.has_platform_access == True,
            )
        )
        student_ids = enroll_result.scalars().all()
        if not student_ids:
            return

        queue_push_many(
            student_ids,
            "New Assignment Posted",
            f"New assignment: {assignment.title}",
            {"url": "/", "tag": f"assignment_posted:{assignment.id}"},
            category="assignment",
        )
    except Exception:
        # Push must never break assignment creation.
        pass

async def update_assignment(db: AsyncSession, assignment_id: str, assignment_data: AssignmentUpdate) -> Optional[AssignmentResponse]:
    """Update an existing assignment."""
    update_data = {k: v for k, v in assignment_data.model_dump().items() if v is not None}
    
    await db.execute(
        update(Assignment).where(Assignment.id == assignment_id).values(**update_data)
    )
    
    return await get_assignment_by_id(db, assignment_id)

async def delete_assignment(db: AsyncSession, assignment_id: str) -> bool:
    """Delete an assignment."""
    await db.execute(
        delete(Assignment).where(Assignment.id == assignment_id)
    )
    return True

# Progress functions
async def get_user_progress(db: AsyncSession, user_id: str) -> List[StudentProgressResponse]:
    """Get all progress records for a user."""
    result = await db.execute(
        select(StudentProgress).where(StudentProgress.student_id == user_id)
    )
    progress = result.scalars().all()
    
    return [
        StudentProgressResponse(
            id=str(p.id),
            student_id=str(p.student_id),
            lesson_id=str(p.lesson_id),
            completed_at=p.completed_at
        )
        for p in progress
    ]

async def get_lesson_progress(db: AsyncSession, user_id: str, lesson_id: str) -> Optional[StudentProgressResponse]:
    """Check if a user has completed a specific lesson."""
    result = await db.execute(
        select(StudentProgress)
        .where(StudentProgress.student_id == user_id)
        .where(StudentProgress.lesson_id == lesson_id)
    )
    progress = result.scalar_one_or_none()
    
    if not progress:
        return None
    
    return StudentProgressResponse(
        id=str(progress.id),
        student_id=str(progress.student_id),
        lesson_id=str(progress.lesson_id),
        completed_at=progress.completed_at
    )

async def mark_lesson_complete(db: AsyncSession, user_id: str, lesson_id: str) -> StudentProgressResponse:
    """Mark a lesson as complete for a user."""
    # Check if already completed
    existing = await get_lesson_progress(db, user_id, lesson_id)
    if existing:
        return existing
    
    progress = StudentProgress(
        student_id=user_id,
        lesson_id=lesson_id
    )
    db.add(progress)
    await db.commit()
    
    return StudentProgressResponse(
        id=str(progress.id),
        student_id=str(progress.student_id),
        lesson_id=str(progress.lesson_id),
        completed_at=progress.completed_at
    )

# Assignment submission functions
async def get_user_assignment_submissions(db: AsyncSession, user_id: str) -> List[AssignmentSubmissionResponse]:
    """Get all assignment submissions for a user."""
    result = await db.execute(
        select(AssignmentSubmission).where(AssignmentSubmission.student_id == user_id)
    )
    submissions = result.scalars().all()
    
    return [
        AssignmentSubmissionResponse(
            id=str(s.id),
            assignment_id=str(s.assignment_id),
            student_id=str(s.student_id),
            submission_text=s.submission_text,
            submission_file=s.submission_file,
            status=s.status,
            feedback=s.feedback,
            graded_by=str(s.graded_by) if s.graded_by else None,
            graded_at=s.graded_at,
            created_at=s.created_at,
            is_ai_flagged=s.is_ai_flagged
        )
        for s in submissions
    ]

async def get_assignment_submission(db: AsyncSession, assignment_id: str, user_id: str) -> Optional[AssignmentSubmissionResponse]:
    """Get a specific assignment submission."""
    result = await db.execute(
        select(AssignmentSubmission)
        .where(AssignmentSubmission.assignment_id == assignment_id)
        .where(AssignmentSubmission.student_id == user_id)
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        return None
    
    return AssignmentSubmissionResponse(
        id=str(submission.id),
        assignment_id=str(submission.assignment_id),
        student_id=str(submission.student_id),
        submission_text=submission.submission_text,
        submission_file=submission.submission_file,
        status=submission.status,
        feedback=submission.feedback,
        graded_by=str(submission.graded_by) if submission.graded_by else None,
        graded_at=submission.graded_at,
        created_at=submission.created_at,
        is_ai_flagged=submission.is_ai_flagged
    )

async def create_assignment_submission(
    db: AsyncSession,
    assignment_id: str,
    user_id: str,
    submission_data: AssignmentSubmissionCreate
) -> AssignmentSubmissionResponse:
    """Create a new assignment submission."""
    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=user_id,
        **submission_data.model_dump()
    )
    db.add(submission)
    await db.commit()
    
    return AssignmentSubmissionResponse(
        id=str(submission.id),
        assignment_id=str(submission.assignment_id),
        student_id=str(submission.student_id),
        submission_text=submission.submission_text,
        submission_file=submission.submission_file,
        status=submission.status,
        feedback=submission.feedback,
        graded_by=str(submission.graded_by) if submission.graded_by else None,
        graded_at=submission.graded_at,
        created_at=submission.created_at,
        is_ai_flagged=submission.is_ai_flagged
    )

async def update_assignment_submission(
    db: AsyncSession,
    submission_id: str,
    submission_data: AssignmentSubmissionUpdate
) -> Optional[AssignmentSubmissionResponse]:
    """Update an existing assignment submission."""
    update_data = {k: v for k, v in submission_data.model_dump().items() if v is not None}
    
    await db.execute(
        update(AssignmentSubmission)
        .where(AssignmentSubmission.id == submission_id)
        .values(**update_data)
    )
    
    result = await db.execute(
        select(AssignmentSubmission).where(AssignmentSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    
    if not submission:
        return None
    
    return AssignmentSubmissionResponse(
        id=str(submission.id),
        assignment_id=str(submission.assignment_id),
        student_id=str(submission.student_id),
        submission_text=submission.submission_text,
        submission_file=submission.submission_file,
        status=submission.status,
        feedback=submission.feedback,
        graded_by=str(submission.graded_by) if submission.graded_by else None,
        graded_at=submission.graded_at,
        created_at=submission.created_at,
        is_ai_flagged=submission.is_ai_flagged
    )

async def delete_course(db: AsyncSession, course_id: str) -> bool:
    """Delete a course completely."""
    await db.execute(
        delete(Course).where(Course.id == course_id)
    )
    return True

async def create_course_review(
    db: AsyncSession,
    course_id: str,
    student_id: str,
    rating: int,
    review_text: Optional[str]
) -> CourseReviewResponse:
    from app.models.course import CourseReview
    from app.schemas.course import CourseReviewResponse
    
    # Check if review already exists
    existing = await db.execute(
        select(CourseReview).where(CourseReview.course_id == course_id).where(CourseReview.student_id == student_id)
    )
    if existing.scalar_one_or_none():
        raise Exception("You have already reviewed this course.")
        
    new_review = CourseReview(
        course_id=course_id,
        student_id=student_id,
        rating=rating,
        review_text=review_text
    )
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    return CourseReviewResponse.model_validate(new_review)

async def get_course_reviews(db: AsyncSession, course_id: str):
    from app.models.course import CourseReview
    from app.schemas.course import CourseReviewResponse
    result = await db.execute(
        select(CourseReview).where(CourseReview.course_id == course_id).order_by(CourseReview.created_at.desc())
    )
    reviews = result.scalars().all()
    return [CourseReviewResponse.model_validate(r) for r in reviews]

async def create_video_qa(
    db: AsyncSession,
    lesson_id: str,
    student_id: str,
    timestamp_seconds: int,
    question_text: str
):
    from app.models.course import VideoQA
    from app.schemas.course import VideoQAResponse
    
    new_qa = VideoQA(
        lesson_id=lesson_id,
        student_id=student_id,
        timestamp_seconds=timestamp_seconds,
        question=question_text
    )
    db.add(new_qa)
    await db.commit()
    await db.refresh(new_qa)
    return VideoQAResponse.model_validate(new_qa)

async def get_video_qa(db: AsyncSession, lesson_id: str):
    from app.models.course import VideoQA
    from app.schemas.course import VideoQAResponse
    result = await db.execute(
        select(VideoQA).where(VideoQA.lesson_id == lesson_id).order_by(VideoQA.timestamp_seconds.asc())
    )
    qas = result.scalars().all()
    return [VideoQAResponse.model_validate(qa) for qa in qas]

async def create_study_group(
    db: AsyncSession,
    course_id: str,
    student_id: str,
    name: str,
    description: Optional[str]
):
    from app.models.course import StudyGroup, StudyGroupMember
    from app.schemas.course import StudyGroupResponse
    
    new_group = StudyGroup(
        course_id=course_id,
        created_by=student_id,
        name=name,
        description=description
    )
    db.add(new_group)
    await db.commit()
    await db.refresh(new_group)
    
    # Add creator as member
    new_member = StudyGroupMember(
        group_id=new_group.id,
        student_id=student_id
    )
    db.add(new_member)
    await db.commit()
    
    return StudyGroupResponse(
        id=str(new_group.id),
        course_id=new_group.course_id,
        name=new_group.name,
        description=new_group.description,
        created_by=str(new_group.created_by),
        created_at=new_group.created_at,
        member_count=1,
        is_member=True
    )

async def get_study_groups(db: AsyncSession, course_id: str, student_id: str):
    from app.models.course import StudyGroup, StudyGroupMember
    from app.schemas.course import StudyGroupResponse
    
    result = await db.execute(
        select(StudyGroup).where(StudyGroup.course_id == course_id).order_by(StudyGroup.created_at.desc())
    )
    groups = result.scalars().all()
    
    response = []
    for g in groups:
        # Get member count
        member_count_res = await db.execute(
            select(func.count()).select_from(StudyGroupMember).where(StudyGroupMember.group_id == g.id)
        )
        member_count = member_count_res.scalar() or 0
        
        # Check if current student is member
        is_member_res = await db.execute(
            select(StudyGroupMember).where(StudyGroupMember.group_id == g.id).where(StudyGroupMember.student_id == student_id)
        )
        is_member = is_member_res.scalar_one_or_none() is not None
        
        response.append(StudyGroupResponse(
            id=str(g.id),
            course_id=g.course_id,
            name=g.name,
            description=g.description,
            created_by=str(g.created_by),
            created_at=g.created_at,
            member_count=member_count,
            is_member=is_member
        ))
    return response

async def join_study_group(db: AsyncSession, group_id: str, student_id: str):
    from app.models.course import StudyGroupMember
    existing = await db.execute(
        select(StudyGroupMember).where(StudyGroupMember.group_id == group_id).where(StudyGroupMember.student_id == student_id)
    )
    if existing.scalar_one_or_none():
        return True # already joined
    
    new_member = StudyGroupMember(
        group_id=group_id,
        student_id=student_id
    )
    db.add(new_member)
    await db.commit()
    return True



