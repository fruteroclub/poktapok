# Sales Decks Web Pages — Implementation Plan

**Feature Branch:** `feat/sales-decks-1-casa-frutero-2-frutero-devrel-services`
**Created:** 2026-02-09
**Owner:** K7 (Kukulcán)
**Status:** Planning

---

## Overview

Develop static web pages for sales decks that can be shared with partners, sponsors, and potential clients. These pages will be bilingual (English/Spanish) and optimized for professional presentation.

### Pages to Create

| Path | Content Source | Priority |
|------|---------------|----------|
| `/casa-frutero/ethereum-deck` | `docs/marketing/sales-decks/casa-frutero-ethereum-deck.md` | P0 |
| `/casa-frutero/partner-deck` | `docs/marketing/sales-decks/casa-frutero-sponsor-one-pager.md` | P1 |
| `/devrel/services-and-events-deck` | DevRel service offering (to be defined) | P2 |

---

## Research: Best Practices for Static Sales Deck Pages

### Next.js Static Generation

1. **Static Site Generation (SSG)** — Use `generateStaticParams` for pre-rendering at build time
2. **Incremental Static Regeneration (ISR)** — Optional for content that may update
3. **MDX Support** — For rich markdown with React components

### Multi-Language (i18n) Strategy

**Recommended: Route-based i18n with `next-intl`**

```
/en/casa-frutero/ethereum-deck  (English)
/es/casa-frutero/ethereum-deck  (Spanish)
```

**Alternative: Subdomain-based**
```
en.frutero.club/casa-frutero/ethereum-deck
es.frutero.club/casa-frutero/ethereum-deck
```

**Implementation:**
- Use `next-intl` library for locale routing and translations
- Store translations in `/messages/{locale}.json`
- Default locale: Spanish (`es`)
- Secondary locale: English (`en`)

### Sales Deck Page Design Principles

1. **Scannable sections** — Clear visual hierarchy
2. **Data visualization** — Tables, stats, metrics prominently displayed
3. **Mobile-responsive** — Partners view on phones too
4. **Print-friendly** — CSS print styles for PDF export
5. **Social sharing** — Open Graph meta for link previews
6. **Brand consistency** — Frutero visual identity (cypherpunk aesthetic, fruit mascots)

### Performance Optimization

- Pre-render all deck pages at build time
- Optimize images with `next/image`
- Minimal JS — content is static
- Cache headers for CDN

---

## Technical Architecture

### Directory Structure

```
src/app/
├── [locale]/                          # Locale wrapper
│   ├── casa-frutero/
│   │   ├── ethereum-deck/
│   │   │   └── page.tsx
│   │   └── partner-deck/
│   │       └── page.tsx
│   └── devrel/
│       └── services-and-events-deck/
│           └── page.tsx
├── layout.tsx                         # Add LocaleProvider
└── ...

src/components/
├── decks/
│   ├── DeckLayout.tsx                 # Shared layout for all decks
│   ├── DeckSection.tsx                # Section wrapper with styling
│   ├── DeckTable.tsx                  # Styled table for data
│   ├── DeckStats.tsx                  # Stats/metrics display
│   ├── DeckCTA.tsx                    # Call-to-action section
│   └── DeckHeader.tsx                 # Hero/header with title
└── ...

messages/
├── en.json                            # English translations
└── es.json                            # Spanish translations

content/
├── casa-frutero/
│   ├── ethereum-deck.en.mdx
│   └── ethereum-deck.es.mdx
├── partner-deck/
│   ├── partner-deck.en.mdx
│   └── partner-deck.es.mdx
└── devrel/
    ├── services.en.mdx
    └── services.es.mdx
```

### Dependencies to Add

```bash
bun add next-intl @next/mdx @mdx-js/loader @mdx-js/react
```

---

## Implementation Tickets

### Ticket 1: Setup i18n Infrastructure
**Priority:** P0 | **Estimate:** 2h

- [ ] Install `next-intl`
- [ ] Configure locale routing in `next.config.ts`
- [ ] Create `/messages/en.json` and `/messages/es.json`
- [ ] Add `LocaleProvider` to root layout
- [ ] Add locale switcher component
- [ ] Test with existing pages

### Ticket 2: Create Deck Component Library
**Priority:** P0 | **Estimate:** 3h

- [ ] Create `DeckLayout.tsx` — full-page deck container
- [ ] Create `DeckHeader.tsx` — hero section with title/subtitle
- [ ] Create `DeckSection.tsx` — section with heading and content
- [ ] Create `DeckTable.tsx` — styled data tables
- [ ] Create `DeckStats.tsx` — metric cards/highlights
- [ ] Create `DeckCTA.tsx` — contact/action section
- [ ] Apply Frutero brand styles (colors, typography)
- [ ] Add print styles for PDF export

### Ticket 3: Create Placeholder Pages
**Priority:** P0 | **Estimate:** 1h

- [ ] Create `/[locale]/casa-frutero/ethereum-deck/page.tsx`
- [ ] Create `/[locale]/casa-frutero/partner-deck/page.tsx`
- [ ] Create `/[locale]/devrel/services-and-events-deck/page.tsx`
- [ ] Add basic placeholder content
- [ ] Verify routing works for both locales

### Ticket 4: Ethereum Deck Page (Casa Frutero)
**Priority:** P0 | **Estimate:** 4h

**Source:** `docs/marketing/sales-decks/casa-frutero-ethereum-deck.md`

- [ ] Convert markdown content to page sections
- [ ] Implement bilingual content (ES primary, EN translation)
- [ ] Sections to implement:
  - [ ] Hero: "The First Ethereum Permanent Community Hub in Mexico"
  - [ ] The Opportunity (problem statement)
  - [ ] Alignment with EF Ecodev Priorities (table)
  - [ ] Who is Frutero? (credentials)
  - [ ] Track Record (metrics table)
  - [ ] The Hub (location, capacity, status)
  - [ ] Hub Programming (schedule table)
  - [ ] Founding Partner Opportunity
  - [ ] Partnership Request (budget table)
  - [ ] Team section
  - [ ] Contact CTA
- [ ] Add OG meta tags
- [ ] Test print styles

### Ticket 5: Partner Deck Page (Casa Frutero)
**Priority:** P1 | **Estimate:** 3h

**Source:** `docs/marketing/sales-decks/casa-frutero-sponsor-one-pager.md`

- [ ] Convert one-pager content to page
- [ ] Implement bilingual content
- [ ] Sections:
  - [ ] Hero with value proposition
  - [ ] Sponsorship tiers table
  - [ ] Benefits breakdown
  - [ ] Contact CTA
- [ ] Add OG meta tags

### Ticket 6: DevRel Services Deck
**Priority:** P2 | **Estimate:** 3h

**Source:** To be created based on:
- `docs/marketing/frutero-marketing-design-master-document-q1-2026.md` (DevRel-as-a-Service section)
- Monad contract model

- [ ] Define content structure:
  - [ ] Hero: "DevRel-as-a-Service for Web3 Protocols"
  - [ ] The Problem protocols face (builder retention)
  - [ ] Frutero's Solution (methodology)
  - [ ] Service Packages (pricing table)
  - [ ] Case Study: Monad engagement
  - [ ] Track record metrics
  - [ ] Contact CTA
- [ ] Write content in ES/EN
- [ ] Implement page

### Ticket 7: QA and Polish
**Priority:** P1 | **Estimate:** 2h

- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsiveness check
- [ ] Accessibility audit (headings, contrast, alt text)
- [ ] Print/PDF export testing
- [ ] Social share preview testing
- [ ] Performance check (Lighthouse)

---

## Brand Guidelines Reference

**From `frutero-marketing-design-master-document-q1-2026.md`:**

- **Tagline:** "Certified Fresh, Organic Quality"
- **North Star:** "AI is the opportunity. We're the connection."
- **Visual Identity:** Cypherpunk aesthetic, anthropomorphic fruit mascots
- **Voice:** Builder-first, raw/authentic (not corporate), Spanglish swagger
- **Colors:** Reference existing site styles
- **Typography:** Reference existing site fonts

---

## Timeline

| Day | Tasks |
|-----|-------|
| Day 1 | Tickets 1-3 (Infrastructure + Placeholders) |
| Day 2 | Ticket 4 (Ethereum Deck) |
| Day 3 | Tickets 5-6 (Partner + DevRel Decks) |
| Day 4 | Ticket 7 (QA + Polish) |

**Estimated Total:** 18 hours across 4 days

---

## Success Criteria

1. ✅ All 3 pages accessible at defined routes
2. ✅ Bilingual content (ES/EN) with language switcher
3. ✅ Responsive design (mobile + desktop)
4. ✅ Print-friendly (clean PDF export)
5. ✅ Brand-consistent styling
6. ✅ OG meta tags for social sharing
7. ✅ Lighthouse performance score > 90

---

## Notes

- The Ethereum deck content is comprehensive and well-structured — primary focus
- Partner deck is a one-pager format — simpler implementation
- DevRel services deck requires content creation — coordinate with Mel/Ian
- Consider adding analytics tracking for deck views (which pages, time on page)

---

*Document maintained by K7. Last updated: 2026-02-09*
