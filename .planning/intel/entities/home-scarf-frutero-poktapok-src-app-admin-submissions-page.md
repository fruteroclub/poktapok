---
path: /home/scarf/frutero/poktapok/src/app/admin/submissions/page.tsx
type: component
updated: 2026-01-26
status: active
---

# page.tsx

## Purpose

Admin page for reviewing and managing activity submissions. Provides a table view with filtering, approval/rejection workflows, and review note functionality for processing user-submitted work.

## Exports

- `default` (AdminSubmissionsPage) - Wrapped page component with admin route protection
- `AdminSubmissionsPageContent` - Core page component with submission management UI

## Dependencies

**Internal:**
- [[admin-route-wrapper]] - AdminRoute component for admin access control
- [[use-submissions]] - React Query hooks for fetching and managing submissions
- [[submissions]] - Submission type definitions and service functions

**External:**
- react, @/components/ui/*, lucide-react, sonner

## Used By

TBD

## Notes

- Uses filter state for pending/approved/rejected/distributed submissions
- Dialog-based review workflow with required review notes for rejection
- Table displays submission details including username, activity title, content link, and status
- Mutations trigger toast notifications and close dialog on success