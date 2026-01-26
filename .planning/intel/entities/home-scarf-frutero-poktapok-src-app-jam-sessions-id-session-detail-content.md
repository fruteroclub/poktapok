---
path: /home/scarf/frutero/poktapok/src/app/jam/sessions/[id]/session-detail-content.tsx
type: component
updated: 2026-01-26
status: active
---

# session-detail-content.tsx

## Purpose

Client component for rendering detailed session information with conditional meeting URL access based on authentication status. Handles session lifecycle states (past, present, future) and displays associated activities.

## Exports

- **SessionDetailContent** - Main client component that displays session details, meeting access controls, and associated activities with time-based UI states

## Dependencies

- lucide-react
- next/navigation
- [[page-wrapper]]
- button, card, badge, skeleton, alert from @/components/ui
- [[use-sessions]]
- @privy-io/react-auth
- date-fns, date-fns/locale

## Used By

TBD

## Notes

Implements three meeting access states: locked (future sessions >2hrs away), accessible (authenticated users within 2hrs), and completed (past sessions). Uses Privy authentication to gate meeting URL visibility. Displays warning alerts for unauthenticated users with login prompt.