---
path: /home/scarf/frutero/poktapok/src/app/activities/page.tsx
type: component
updated: 2026-01-26
status: active
---

# page.tsx

## Purpose

Public-facing activities listing page that displays available educational activities and bounties with filtering capabilities. Provides admin quick-access panel for activity management and submission review.

## Exports

- `ActivitiesPage` (default): Client component that renders the activities listing with search, type, and difficulty filters. Shows admin panel for users with admin role.

## Dependencies

- [[page-wrapper]]: Layout wrapper component
- [[use-auth]]: Authentication hook for user role checking
- [[use-activities]]: Data fetching hook for public activities list
- [[activities]]: Activity type definitions
- `@/components/ui/*`: shadcn/ui components (Button, Badge, Input, Select, Card)
- `next/navigation`: Router for navigation
- `lucide-react`: Icon components

## Used By

TBD

## Notes

- Filters activities by type (all/bounty/challenge/tutorial/workshop), difficulty (all/beginner/intermediate/advanced), and search query
- Displays "FULL" badge when activity reaches max submissions (totalAvailableSlots)
- Admin panel provides quick links to activity management and submissions review
- Uses client-side filtering with `usePublicActivities` hook