---
path: /home/scarf/frutero/poktapok/src/lib/db/queries/activities.ts
type: model
updated: 2026-01-26
status: active
---

# activities.ts

## Purpose

Centralized database query layer for activities, submissions, and pulpa distributions. Provides type-safe CRUD operations and business logic for the bounty/learning activity system including filtering, pagination, stats aggregation, and user submission tracking.

## Exports

- `getActivities` - Fetch activities with filtering (type, category, difficulty, status, search), pagination, and optional expiration checks
- `getActivityById` - Fetch single activity by ID with soft-delete check
- `createActivity` - Create new activity with validation and admin check
- `updateActivity` - Update activity with validation and admin check
- `deleteActivity` - Soft delete activity (sets deletedAt timestamp)
- `incrementActivitySubmissionCount` - Atomic increment of submission counter
- `getSubmissions` - Fetch submissions with filters (activity, user, status, quality), pagination, and joins to user/profile data
- `getSubmissionById` - Fetch single submission by ID with user/profile/activity joins
- `hasUserSubmitted` - Check if user already submitted to activity
- `createSubmission` - Create new submission with duplicate check
- `updateSubmission` - Update submission with optional reviewer assignment
- `getUserSubmissionStats` - Aggregate user stats (total, approved, avg quality, pulpa earned)
- `getDistributions` - Fetch distributions with filters (submission, user, status, method), pagination, and joins
- `createDistribution` - Create new distribution record
- `updateDistribution` - Update distribution status with completion tracking
- `getPendingDistributions` - Fetch all distributions with status='pending'
- `updateUserPulpaStats` - Update user profile pulpa stats (earned, available, pending)

## Dependencies

[[db]] (database client), [[schema]] (activities, activitySubmissions, pulpaDistributions, profiles, users tables and type definitions), drizzle-orm (query builders: eq, and, desc, asc, sql, count, sum, isNull, or, gte, lte, ilike)

## Used By

TBD

## Notes

Uses type guards (isActivityType, isDifficulty, isActivityStatus, isSubmissionStatus, isDistributionStatus, isDistributionMethod) for runtime validation. All queries respect soft deletes via deletedAt checks. Submission queries include left joins to users and profiles for enriched data. Distribution queries track completion timestamps. Stats queries use SQL aggregations (count, sum, avg). Pagination uses offset/limit pattern with total count.