# CodeMe Academy Teacher Dashboard Guide

## Goal
Empower instructors to manage their assigned cohorts effectively without exposing them to global system settings.

## Data Partitioning
The `teacher_dashboard.py` router strictly filters data. Teachers only see:
- Courses where `Course.teacher_id == current_user.id`.
- Submissions for those specific courses.
- Students enrolled in those specific courses.

## Analytics
Teachers are provided with pass-rate analytics and engagement drop-offs to help them identify struggling students in their cohorts.

