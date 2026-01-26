---
path: /home/scarf/frutero/poktapok/src/app/api/admin/activities/route.ts
type: api
updated: 2026-01-26
status: active
---

# route.ts

## Purpose

Admin-only API endpoints for managing activities. Provides listing with comprehensive filtering (includes drafts and expired) and activity creation with validation.

## Exports

- `GET` - Lists all activities with filters (type, category, difficulty, status, search, pagination) and returns stats (total, active, draft, completed)
- `POST` - Creates new activity with full validation and sets creator to authenticated admin

## Dependencies

- next/server
- [[activities]] (queries)
- [[activity]] (validators)
- [[middleware]] (auth)

## Used By

TBD

## Notes

Admin endpoints bypass public restrictions: includes draft activities, expired activities, and all statuses. Stats calculation fetches all activities (limit 1000) to compute totals.