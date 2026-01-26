---
path: /home/scarf/frutero/poktapok/src/app/club/activities/[id]/activity-detail-content.tsx
type: component
updated: 2026-01-26
status: active
---

# activity-detail-content.tsx

## Purpose

Client-side component that displays activity detail page with submission form. Handles activity information rendering, submission state management, and form validation for authenticated users.

## Exports

- **ActivityDetailContent** - Main component that renders activity details, metadata cards (difficulty, participants, reward), description, and submission form with URL and text inputs

## Dependencies

- [[page-wrapper]] - Layout wrapper component
- [[button]], [[card]], [[badge]], [[skeleton]], [[input]], [[textarea]], [[alert]] - UI components
- [[use-activities]] - Custom hooks for fetching activity details and submitting work
- @privy-io/react-auth - Authentication context
- sonner - Toast notifications
- next/navigation - Router for navigation
- lucide-react - Icon components

## Used By

TBD

## Notes

Implements loading skeleton states, error handling with user-friendly messages, and form validation (requires URL or text). Uses React Query mutations for submission with optimistic updates and error recovery.