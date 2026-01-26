---
path: /home/scarf/frutero/poktapok/src/app/admin/activities/new/page.tsx
type: component
updated: 2026-01-26
status: active
---

# page.tsx

## Purpose

Admin page for creating new learning activities and bounties. Provides a comprehensive form with validation for all activity fields including type, difficulty, rewards, evidence requirements, and scheduling.

## Exports

- `default` - Next.js page component wrapped with AdminRoute
- `NewActivityPage` - Main page component (wrapped export)
- `NewActivityPageContent` - Form component with state management and mutation handling

## Dependencies

- react (useState)
- next/navigation (useRouter)
- [[button]] - UI component
- [[input]] - UI component
- [[label]] - UI component
- [[textarea]] - UI component
- [[select]] - UI component
- [[checkbox]] - UI component
- [[admin-route-wrapper]] - AdminRoute HOC for access control
- [[use-activities]] - useCreateActivity mutation hook
- sonner (toast notifications)

## Used By

TBD

## Notes

- Form includes all activity fields: title, description, instructions, external_url, type, category, difficulty, rewards, evidence requirements, verification type, limits, scheduling, and status
- Uses controlled component pattern with single state object
- Handles optional fields by filtering out empty strings before submission
- Converts date inputs to ISO strings for API compatibility
- Redirects to /admin/activities on successful creation
- Missing external_url field in form UI but present in state - should be added to form