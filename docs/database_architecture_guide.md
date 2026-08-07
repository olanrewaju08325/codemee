# CodeMe Academy Database Architecture Guide

## Overview
CodeMe Academy utilizes Supabase (PostgreSQL 15+) as its primary datastore. The architecture relies on declarative schemas (via SQLAlchemy) and strict foreign key constraints to ensure referential integrity.

## Core Entities
1. **Profiles (`profiles`)**: The central user table extending Supabase Auth.
2. **Courses (`courses`)**: The root of the educational content hierarchy.
3. **Enrollments (`enrollments`)**: Junction table connecting `profiles` to `courses`.
4. **Payments (`exam_payment_verification`)**: Financial ledger for course and retake purchases.

## Optimization Strategy
- Indexes are strictly applied to foreign keys and filtering columns (e.g., `student_id`, `status`).
- All queries fetching relationships (e.g., `get_courses_with_modules`) use eager loading (`joinedload`/`selectinload`) to eliminate N+1 queries.

## Raw SQL Execution
Direct raw SQL execution is heavily discouraged. SQLAlchemy Core (`db.execute(select(...))`) or ORM methods must be used to ensure type safety and parameter binding.

