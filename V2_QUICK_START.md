# 🚀 Landing Page V2 - Quick Start

## View the New Design

```bash
# Start dev server
bun dev

# Visit the new landing page
open http://localhost:3000/v2
```

## What's New

✨ **8 brand new sections** following the Rootstock + OrangeDAO aesthetic:

1. **Hero** - Bold headline with social proof badge
2. **Problem** - Pain point narrative with dual CTAs
3. **Who We Are** - Impact stats + DNA badges
4. **Team** - Mentor showcase grid
5. **Partners** - Logo row with hover effects
6. **Projects** - Startup/project cards
7. **Hub** - Physical space + "¿Eres Hacker?" filter
8. **Events** - Timeline format with dates + pricing

## Current vs V2

| Current (`/`) | V2 (`/v2`) |
|---------------|------------|
| 10 sections | 10 sections (8 new + 2 reused) |
| Testimonials + FAQ | ✅ Kept same |
| Different narrative flow | New problem-solution flow |

## Files Created

```
src/app/v2/page.tsx                              # Test route
src/components/landing/hero-v2-section.tsx
src/components/landing/problem-v2-section.tsx
src/components/landing/who-we-are-v2-section.tsx
src/components/landing/team-v2-section.tsx
src/components/landing/partners-v2-section.tsx
src/components/landing/projects-v2-section.tsx
src/components/landing/hub-v2-section.tsx
src/components/landing/events-v2-section.tsx
```

## Make it Live

When ready to replace the current landing page:

```bash
# Backup current page
mv src/app/page.tsx src/app/page-old.tsx

# Promote V2 to main
cp src/app/v2/page.tsx src/app/page.tsx

# Update function name in src/app/page.tsx
# Change: export default function V2Page()
# To:     export default function Home()
```

## Design System Notes

- ✅ Uses existing colors (primary/orange, secondary/red, accent/green)
- ✅ Follows `page` and `page-content` layout classes
- ✅ All Spanish copy as specified
- ✅ Responsive mobile-first design
- ✅ shadcn/ui components throughout
- ✅ Hover effects and transitions

## Need Help?

See [docs/design/landing-page-v2-implementation.md](docs/design/landing-page-v2-implementation.md) for complete documentation.
