from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QuizQuestionResponse(BaseModel):
    id: str
    quiz_id: str
    question_text: str
    question_type: str  # multiple_choice, true_false, short_answer, fill_blank
    options: Optional[Any]  # JSON array of options for multiple choice / true_false
    correct_answer: Optional[str]
    blank_answer: Optional[str]
    order_index: int

    class Config:
        from_attributes = True

class QuizResponse(BaseModel):
    id: str
    module_id: str
    title: str
    scheduled_at: Optional[datetime] = None
    created_at: datetime
    questions: Optional[List[QuizQuestionResponse]] = None

    class Config:
        from_attributes = True

class QuizAttemptResponse(BaseModel):
    id: str
    quiz_id: str
    student_id: str
    score: int
    passed: bool
    attempt_number: int
    created_at: datetime
    quizzes: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class QuizSubmissionRequest(BaseModel):
    answers: Dict[str, str]  # question_id -> submitted answer

class QuizSubmissionResponse(BaseModel):
    attempt_id: str
    score: int
    passed: bool
    answers_correct: int
    total_questions: int

class QuizCreate(BaseModel):
    module_id: str
    title: str
    scheduled_at: Optional[datetime] = None

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    scheduled_at: Optional[datetime] = None

class QuizQuestionCreate(BaseModel):
    question_text: str
    question_type: str
    options: Optional[Any] = None
    correct_answer: str
    blank_answer: Optional[str] = None
    order_index: int = 0

class QuizQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[Any] = None
    correct_answer: Optional[str] = None
    blank_answer: Optional[str] = None
    order_index: Optional[int] = None
