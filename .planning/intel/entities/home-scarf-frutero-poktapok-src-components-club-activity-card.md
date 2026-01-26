---
path: /home/scarf/frutero/poktapok/src/components/club/activity-card.tsx
type: component
updated: 2026-01-26
status: active
---

# activity-card.tsx

## Purpose

Reusable card component for displaying activity information in a consistent format across Club section pages. Provides visual presentation of activity metadata including title, description, difficulty level, reward amount, and participation stats.

## Exports

- **ActivityCard** - Card component that displays activity details with optional stats, wrapped in a link to the activity detail page

## Dependencies

- next/link
- lucide-react (Trophy, Users, Clock icons)
- [[card]] (Card component from ui)
- [[badge]] (Badge component from ui)
- [[activities]] (Activity type from services)

## Used By

TBD

## Notes

- Supports three difficulty levels (beginner, intermediate, advanced) with color-coded badges and Spanish labels
- Shows pulpa reward amount, submission count vs total slots, and activity status
- `showStats` prop allows toggling display of participation statistics
- Uses `line-clamp` utilities for text truncation to maintain consistent card heights
- Missing href value in Link component - needs to be populated with activity detail route