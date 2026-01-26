---
path: /home/scarf/frutero/poktapok/src/components/jam/activities-preview.tsx
type: component
updated: 2026-01-26
status: active
---

# activities-preview.tsx

## Purpose

Displays a preview grid of featured activities for the landing page with a configurable limit and "Ver todas" CTA button. Reuses activity card styles with difficulty badges, reward amounts, and activity types.

## Exports

- `ActivitiesPreview` - React component that renders a grid of activity cards with title, description, difficulty badge, reward amount (PULPA), activity type, and link to full details

## Dependencies

- next/link
- [[button]] (UI component)
- [[card]] (UI component)
- [[badge]] (UI component)
- lucide-react (ArrowRight, Coins icons)
- [[activities]] (Activity type from services)

## Used By

TBD

## Notes

- Default limit is 6 activities
- Returns null if no activities available
- Uses type-safe difficulty levels with Spanish labels and color coding (green/yellow/red)
- Reward amount is floored to integer display
- Grid is responsive: 1 column (mobile), 2 columns (sm), 3 columns (lg)
- Each card has hover shadow effect and links to `/activities/[id]`