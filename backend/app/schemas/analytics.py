from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class StudentAnalyticsResponse(BaseModel):
    learning_progress: Dict[str, Any]
    quiz_analytics: Dict[str, Any]
    learning_performance: Dict[str, Any]
    personal_productivity: Dict[str, Any]
    recent_activity: List[Dict[str, Any]]

class TeacherAnalyticsResponse(BaseModel):
    overview: Dict[str, Any]
    student_activity: Dict[str, Any]
    course_performance: List[Dict[str, Any]]
    quiz_averages: List[Dict[str, Any]]

class AdminAnalyticsResponse(BaseModel):
    platform_overview: Dict[str, Any]
    financial_dashboard: Dict[str, Any]
    enrollment_analytics: Dict[str, Any]
    learning_analytics: Dict[str, Any]
    operational_analytics: Dict[str, Any]
    ai_analytics: Dict[str, Any]

