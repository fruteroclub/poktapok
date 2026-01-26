---
path: /home/scarf/frutero/poktapok/src/app/jam/programs/[id]/program-detail-content.tsx
type: component
updated: 2026-01-26
status: active
---

# program-detail-content.tsx

## Purpose

Client component that displays comprehensive program details including stats, activities, and sessions. Handles loading states, error states, and conditional rendering based on authentication status.

## Exports

- `ProgramDetailContent` - Main component that fetches and displays program details with activities and sessions, includes enrollment/dashboard navigation

## Dependencies

lucide-react, next/link, next/navigation, [[page-wrapper]], [[button]], [[card]], [[badge]], [[skeleton]], [[use-programs]], @privy-io/react-auth, date-fns, date-fns/locale

## Used By

TBD

## Notes

Displays different CTAs based on user authentication and enrollment status. Uses Spanish locale for date formatting. Shows stats (enrolled users, activities, sessions), activity list with tags, and upcoming sessions with calendar integration.