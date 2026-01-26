---
path: /home/scarf/frutero/poktapok/src/lib/validators/activity.ts
type: util
updated: 2026-01-26
status: active
---

# activity.ts

## Purpose

Provides Zod validation schemas for activity and submission operations including creation, updates, evidence requirements, and PULPA token distributions. Ensures type-safe input validation across activity lifecycle management.

## Exports

- **evidenceRequirementsSchema** - Validates evidence submission requirements (URL, screenshot, text flags)
- **createActivitySchema** - Validates activity creation with title, description, type, difficulty, rewards, and time constraints
- **updateActivitySchema** - Partial schema for updating existing activities
- **updateActivityStatusSchema** - Validates activity status transitions with optional reason
- **evidenceFileSchema** - Validates uploaded evidence file metadata
- **submitActivitySchema** - Validates activity submissions with evidence (URL, screenshot, text)
- **approveSubmissionSchema** - Validates submission approval with quality score and feedback
- **rejectSubmissionSchema** - Validates submission rejection with required reason
- **requestRevisionSchema** - Validates revision requests with required feedback
- **createDistributionSchema** - Validates PULPA token distribution creation
- **updateDistributionSchema** - Validates distribution updates (status, transaction hash)
- **listActivitiesQuerySchema** - Query parameters for activity listings (pagination, filters)
- **listSubmissionsQuerySchema** - Query parameters for submission listings with status/user filters
- **listDistributionsQuerySchema** - Query parameters for distribution listings with status filter
- **CreateActivityInput** - TypeScript type inferred from createActivitySchema
- **UpdateActivityInput** - TypeScript type inferred from updateActivitySchema
- **UpdateActivityStatusInput** - TypeScript type inferred from updateActivityStatusSchema
- **SubmitActivityInput** - TypeScript type inferred from submitActivitySchema
- **ApproveSubmissionInput** - TypeScript type inferred from approveSubmissionSchema
- **RejectSubmissionInput** - TypeScript type inferred from rejectSubmissionSchema
- **RequestRevisionInput** - TypeScript type inferred from requestRevisionSchema
- **CreateDistributionInput** - TypeScript type inferred from createDistributionSchema
- **UpdateDistributionInput** - TypeScript type inferred from updateDistributionSchema
- **ListActivitiesQuery** - TypeScript type inferred from listActivitiesQuerySchema
- **ListSubmissionsQuery** - TypeScript type inferred from listSubmissionsQuerySchema
- **ListDistributionsQuery** - TypeScript type inferred from listDistributionsQuerySchema

## Dependencies

- zod (external validation library)

## Used By

TBD

## Notes

- PULPA amounts validated as decimal strings with max 8 decimal places matching blockchain precision
- Activity types include GitHub commits, X posts, photos, videos, blog posts, workshops, build-in-public, code reviews, and custom
- Evidence requirements are flexible combinations of URL, screenshot, and text submissions
- Quality scores range from 0-100 with minimum approval threshold of 70
- Verification types support manual, automatic, and hybrid workflows
- Submission statuses: pending, approved, rejected, revision_requested
- Distribution statuses: pending, processing, completed, failed
- All schemas follow standardized error messaging for user-facing validation