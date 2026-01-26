---
path: /home/scarf/frutero/poktapok/src/app/admin/activities/page.tsx
type: component
updated: 2026-01-26
status: active
---

# page.tsx

## Purpose

Admin dashboard page for managing educational activities and bounties. Provides filtering, search, and CRUD operations for activities with status tracking and type categorization.

## Exports

- **default** - Next.js page component wrapped with AdminRoute protection
- **AdminActivitiesPage** - Main page component export
- **AdminActivitiesPageContent** - Internal component handling the activities table, filters, and navigation

## Dependencies

**External:**
- react (useState)
- next/navigation (useRouter)
- lucide-react (Loader2)

**Internal:**
- [[button]] - UI button component
- [[input]] - UI input component
- [[badge]] - UI badge component for status display
- [[select]] - UI select dropdown components
- [[table]] - UI table components for activity list
- [[card]] - UI card components for layout
- [[admin-route-wrapper]] - AdminRoute HOC for access control
- [[use-activities]] - Hook for fetching and filtering activities data

## Used By

TBD

## Notes

- Uses controlled filter state (status, type, search) passed to useActivities hook
- Status badges use variant mapping (draft→outline, active→default, paused/completed→secondary, cancelled→destructive)
- Activity types formatted from snake_case to Title Case for display
- "Create New Activity" button navigates to `/admin/activities/new`
- Activity rows clickable, navigate to `/admin/activities/[id]` detail view
- Protected route - only accessible to admin users via AdminRoute wrapper