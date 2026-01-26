---
path: /home/scarf/frutero/poktapok/src/app/activities/[id]/page.tsx
type: component
updated: 2026-01-26
status: active
---

# page.tsx

## Purpose

Activity detail page that displays comprehensive activity information and provides a submission form for users to submit their work with URL and text evidence based on activity requirements.

## Exports

- `ActivityDetailPage` (default): Client component that renders activity details, evidence requirements, submission form, and handles submission validation and error states.

## Dependencies

- [[use-activities]]: `useActivityDetail`, `useSubmitActivity` hooks for data fetching and mutations
- [[activities]]: `ActivityDetail` type definition
- `@/components/ui/*`: UI primitives (Button, Input, Label, Textarea, Badge, Card, Checkbox)
- `@/components/layout/page-wrapper`: Layout wrapper component
- `sonner`: Toast notifications
- `next/navigation`: Router and params hooks

## Used By

TBD

## Notes

- Validates required evidence fields (URL/text) based on activity requirements before submission
- Handles expired activities and full capacity scenarios with disabled submission state
- Uses dynamic routing with `[id]` parameter for activity identification
- Displays submission checklist with interactive checkboxes for user guidance
- Formats activity types and difficulty levels with visual badges and color coding