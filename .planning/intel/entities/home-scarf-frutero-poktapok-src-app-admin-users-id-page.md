---
path: /home/scarf/frutero/poktapok/src/app/admin/users/[id]/page.tsx
type: component
updated: 2026-01-26
status: active
---

# page.tsx

## Purpose

Admin page for viewing and managing detailed user information, including role changes, account status updates (suspend/ban), and profile data display.

## Exports

- `UserDetailPage` (default) - Page component that displays user details with management actions for admins

## Dependencies

Internal:
- [[use-user-management]] - Custom hooks for user data fetching and mutations
- [[use-auth]] - Authentication hook for current user context
- [[card]] - UI component for content containers
- [[badge]] - UI component for role and status indicators
- [[avatar]] - UI component for user profile images
- [[button]] - UI component for actions
- [[dialog]] - UI component for confirmation modals
- [[select]] - UI component for role selection
- [[label]] - UI component for form labels
- [[textarea]] - UI component for reason input
- [[section]] - Layout component for page structure

External:
- react - State management and hooks
- next/navigation - Router for navigation
- lucide-react - Icon components
- sonner - Toast notifications

## Used By

TBD

## Notes

- Uses helper functions `getRoleVariant` and `getStatusVariant` to map role/status to Badge variants
- Requires admin authentication (checked via `useAuth`)
- Implements three action dialogs: role change, suspend, and ban with reason tracking
- Uses Next.js 16 async params pattern with `use()` hook to unwrap params Promise
- Prevents self-modification (admin cannot change own role or suspend/ban themselves)