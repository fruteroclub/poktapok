# Frutero Landing Page Update Scope

**Date**: January 13, 2026
**Status**: Planning
**Target**: Q1 2026 Marketing Campaign

---

## 1. Overview

This document outlines the design and technical specifications for updating the Poktapok (Frutero) landing page to align with Q1 2026 marketing initiatives. All updates must use existing design system components, brand colors, and established patterns.

### Goals
- Improve conversion rates for new user signups
- Better communicate value proposition to Latin American developers
- Showcase real success stories and community impact
- Maintain brand consistency across all sections
- Optimize for mobile-first experience

---

## 2. Brand Guidelines & Design System

### 2.1 Color Palette

**Primary Colors** (from `src/styles/globals.css`):

```css
/* Light Mode */
--primary: oklch(0.7652 0.1752 62.57)        /* Yellow/Gold - Main CTA */
--secondary: oklch(0.6519 0.2118 22.71)      /* Orange/Red - Accents */
--accent: oklch(0.7989 0.1902 126.36)        /* Green - Success/Growth */
--background: oklch(0.9895 0.009 78.28)      /* Cream/Off-white */
--foreground: oklch(0.0969 0 0)              /* Near-black text */

/* Dark Mode */
--primary: oklch(0.795 0.184 86.047)         /* Brighter yellow */
--secondary: oklch(0.274 0.006 286.033)      /* Muted */
--accent: oklch(0.274 0.006 286.033)         /* Muted */
--background: oklch(0.141 0.005 285.823)     /* Dark gray */
--foreground: oklch(0.985 0 0)               /* Near-white */
```

**Semantic Colors**:
- `text-primary` - Main brand color (yellow/gold)
- `text-secondary` - Secondary brand color (orange/red)
- `text-accent` - Accent color (green)
- `text-foreground` - Main text color
- `text-muted-foreground` - Secondary text
- `bg-background` - Page background
- `bg-card` - Card backgrounds

**🚫 NEVER USE**: `bg-muted` or any `muted` background variants (per CLAUDE.md guidelines)

### 2.2 Typography

**Font Stack**:
- **Primary**: `font-sans` (Raleway) - Body text, descriptions
- **Headings**: `font-sans` with `font-bold` or `font-semibold`
- **Monospace**: `font-mono` (Geist Mono) - Code snippets

**Text Sizes**:
```tsx
// Headings
<h1 className="text-4xl md:text-5xl font-semibold">    // Hero titles
<h2 className="text-3xl md:text-4xl font-bold">        // Section titles
<h3 className="text-xl font-bold">                     // Card titles

// Body
<p className="text-lg md:text-xl">                     // Large body
<p className="text-base">                              // Default body
<p className="text-sm text-muted-foreground">          // Small/secondary
```

### 2.3 Spacing & Layout

**Container Classes**:
```tsx
.page              // Full-width section container with padding
.page-content      // Max-width content wrapper (from page-wrapper.tsx)
.section           // Section spacing utility
```

**Spacing Utilities**:
- Use `space-y-{size}` for vertical spacing in flex containers
- Use `gap-{size}` for grid/flex gaps
- Never use manual `my-*` or `py-*` on individual items in stacked layouts

**Common Patterns**:
```tsx
<section className="page py-8 md:py-12">           // Section wrapper
  <div className="page-content gap-y-8">           // Content container
    <div className="flex flex-col gap-y-4">        // Stacked content
      {/* Section content */}
    </div>
  </div>
</section>
```

### 2.4 Interactive Elements

**Buttons**:
```tsx
// Primary CTA (from auth-button-privy.tsx)
<AuthButtonPrivy size="lg" className="text-2xl font-medium lg:px-14 lg:py-6">
  {text} <SparklesIcon className="ml-2 h-5 w-5 fill-background" />
</AuthButtonPrivy>

// Link with arrow
<Link href={url} className="flex items-center gap-2 hover:underline text-primary">
  {text} <ArrowRightIcon className="h-4 w-4" />
</Link>
```

**Cards**:
```tsx
// From shadcn/ui components
<Card className="border-2 border-border bg-background">
  <CardHeader>
    <CardTitle className="text-lg">Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 2.5 Visual Accents

**Highlighted Text** (from hero-section.tsx):
```tsx
<span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
  Crecimiento
</span>

<span className="inline-block rotate-2 transform rounded-lg bg-secondary px-4 py-2 text-white">
  IA y Cripto
</span>
```

**Decorative Elements** (from solution-section.tsx):
```tsx
// Vertical accent line
<div className="absolute top-0 -left-4 h-32 w-1 bg-primary" />

// Horizontal accent line
<div className="mx-auto h-1 w-24 rounded-full bg-primary" />

// Gradient background
<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />
```

---

## 3. Existing Landing Page Structure

### Current Sections (src/app/page.tsx):
1. **HeroSection** - Main header with CTA
2. **PainPointsSection** - Problem statement
3. **SolutionSection** - Value proposition
4. **DifferentiatorSection** - What makes us unique
5. **JourneySection** - User journey/process
6. **TestimonialsSection** - Social proof
7. **StatsSection** - Impact metrics
8. **CustomersPartnersSection** - Logos/partnerships
9. **FAQSection** - Common questions
10. **FinalCTASection** - Bottom CTA

### Existing Components to Reuse:

**Layout**:
- `PageWrapper` - Main page container
- `Section` - Section wrapper component

**Landing**:
- `StatCard` - For displaying metrics ([src/components/stats/stat-card.tsx](../../src/components/stats/stat-card.tsx))
- `BuildersShowcaseMarquee` - Scrolling builder showcase
- `CustomersPartnersMarquee` - Partner logos

**Buttons**:
- `AuthButtonPrivy` - Primary CTA button with Privy auth

**Icons**:
- Use `lucide-react` for all icons
- Common icons: `SparklesIcon`, `ArrowRightIcon`, `Users`, `Rocket`, `Trophy`, etc.

---

## 4. Proposed Updates

### 4.1 Hero Section Enhancements

**Current** ([src/components/landing/hero-section.tsx](../../src/components/landing/hero-section.tsx)):
```tsx
<h1 className="text-4xl font-semibold md:text-5xl">
  Acelera tu <span className="bg-accent">Crecimiento</span> con
  oportunidades en <span className="bg-secondary">IA y Cripto</span>
</h1>
```

**New Copy** (from original-landing-page-update-scope.md):

**Headline (ES)**:
> Aprende a ganar más con IA

**Subheadline (ES)**:
> La comunidad donde desarrollas habilidades reales, conectas con mentores activos, y ganas mientras aprendes.

**Proof Metrics** (Display as pill badges):
- 32.7% tasa de completación (6x promedio industria)
- 25+ victorias en hackathones
- 6 ganadores ETHDenver 2025

**Primary CTA**: Únete a la Comunidad
**Secondary CTA**: Explora Programas

**Proposed Updates**:
- Update headline to "Aprende a ganar más con IA"
- Update subheadline with value proposition
- Add proof metrics as pill badges below subheadline
- Add animated gradient background using existing color tokens
- Include trust indicators (member count, earnings distributed)
- Add secondary CTA for "Explora Programas"
- **CRITICAL**: Preserve rotated highlight spans structure (update text only)

**Implementation Pattern**:
```tsx
<section className="page min-h-[70svh] w-full pt-12 pb-8 md:pt-20">
  <div className="page-content space-y-8 text-center">
    {/* Hero title - PRESERVE rotated spans structure */}
    <div className="mx-auto max-w-4xl">
      <h1 className="text-4xl leading-tight font-semibold text-foreground md:text-5xl">
        Aprende a{' '}
        <span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
          ganar más
        </span>{' '}
        con IA
      </h1>
    </div>

    {/* Subheadline */}
    <p className="text-2xl text-foreground md:text-3xl md:font-medium lg:text-2xl lg:font-medium">
      La comunidad donde desarrollas habilidades reales, <br />
      conectas con mentores activos, y ganas mientras aprendes.
    </p>

    {/* Proof metrics as pill badges using Badge component */}
    <div className="flex flex-wrap justify-center gap-4">
      <Badge variant="secondary" className="bg-accent/10 text-accent">
        32.7% tasa de completación (6x promedio)
      </Badge>
      <Badge variant="secondary" className="bg-primary/10 text-primary">
        25+ victorias en hackathones
      </Badge>
      <Badge variant="secondary" className="bg-secondary/10 text-secondary">
        6 ganadores ETHDenver 2025
      </Badge>
    </div>

    {/* Primary CTA */}
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <AuthButtonPrivy size="lg" className="text-2xl font-medium lg:px-14 lg:py-6">
        Únete a la Comunidad <SparklesIcon className="ml-2 h-5 w-5 fill-background" />
      </AuthButtonPrivy>

      {/* Secondary CTA */}
      <Button
        variant="outline"
        size="lg"
        className="text-2xl font-medium lg:px-14 lg:py-6"
        asChild
      >
        <Link href="#programs-section">Explora Programas</Link>
      </Button>
    </div>

    {/* Builders Showcase */}
    <BuildersShowcaseMarquee />
  </div>
</section>
```

### 4.2 Stats Section Redesign

**Current** ([src/components/landing/stats-section.tsx](../../src/components/landing/stats-section.tsx)):
- Grid of 6 stats using `StatCard` component
- Simple icon + number + description

**Proposed Updates**:
- Add visual hierarchy with featured stat (largest)
- Include mini-chart or progress indicators
- Add hover animations for interactivity
- Group related stats (e.g., "Community" vs "Impact")

**Implementation Pattern**:
```tsx
<section className="page py-12">
  <div className="page-content space-y-8">
    {/* Section header */}
    <div className="text-center">
      <h2 className="text-3xl font-bold md:text-4xl">
        Nuestro <span className="text-primary">impacto</span> en números
      </h2>
    </div>

    {/* Featured stat using Card component */}
    <div className="mx-auto max-w-md">
      <Card className="border-2 border-primary">
        <CardContent className="pt-6 text-center space-y-2">
          <div className="text-6xl font-bold text-primary">$100k+</div>
          <p className="text-xl text-foreground">USD distribuidos</p>
        </CardContent>
      </Card>
    </div>

    {/* Regular stats grid using StatCard component */}
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard {...stat} key={stat.description} />
      ))}
    </div>
  </div>
</section>
```

### 4.3 Testimonials Enhancement

**Current Pattern**:
- Simple testimonial cards in a grid

**Proposed Updates**:
- Add profile photos (avatars from existing users)
- Include user role/title (e.g., "Full-stack Developer", "Estudiante UNAM")
- Add visual variety with different card backgrounds
- Link to user profiles when available

**Implementation Pattern**:
```tsx
<Card className="group transition-all hover:border-primary/30">
  <CardContent className="pt-6 space-y-4">
    {/* Avatar */}
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-xl font-bold text-primary">{initials}</span>
      </div>
      <div>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>

    {/* Quote */}
    <p className="text-foreground/80 italic">"{quote}"</p>

    {/* Optional: Link to profile */}
    {profileUrl && (
      <Link href={profileUrl} className="flex items-center gap-2 text-sm text-primary hover:underline">
        Ver perfil <ArrowRightIcon className="h-3 w-3" />
      </Link>
    )}
  </CardContent>
</Card>
```

### 4.4 New Section: Success Stories

**Purpose**: Showcase real member achievements with visual proof

**Location**: After TestimonialsSection, before StatsSection

**Implementation Pattern**:
```tsx
<section className="page py-12">
  <div className="page-content space-y-8">
    {/* Section header */}
    <div className="text-center space-y-4">
      <h2 className="text-3xl font-bold md:text-4xl">
        Historias de <span className="text-primary">éxito</span>
      </h2>
      <p className="text-xl text-muted-foreground">
        Miembros que transformaron su carrera
      </p>
    </div>

    {/* Success story cards - alternating layout */}
    <div className="mx-auto max-w-4xl space-y-12">
      {successStories.map((story, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div
              className={`grid gap-8 md:grid-cols-2 md:gap-12 ${
                index % 2 === 1 ? 'md:grid-flow-dense' : ''
              }`}
            >
              {/* Image side */}
              <div className={`${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                <div className="aspect-square rounded-2xl bg-card border-2 border-border flex items-center justify-center">
                  {/* Project screenshot or member photo */}
                  <p className="text-6xl">🚀</p>
                </div>
              </div>

              {/* Content side */}
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">{story.title}</h3>
                <p className="text-lg text-foreground/80">{story.description}</p>

                {/* Member info */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{story.member[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{story.member}</p>
                    <p className="text-sm text-muted-foreground">{story.role}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex gap-6">
                  <div>
                    <p className="font-bold text-primary text-2xl">{story.earnings}</p>
                    <p className="text-sm text-muted-foreground">Ganado</p>
                  </div>
                  <div>
                    <p className="font-bold text-secondary text-2xl">{story.projects}</p>
                    <p className="text-sm text-muted-foreground">Proyectos</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>
```

### 4.5 CTA Section Improvements

**Current**: Simple final CTA at bottom

**Proposed Updates**:
- Add urgency/scarcity messaging ("Próxima cohorte inicia en...")
- Include mini-FAQ or objection handlers
- Show next steps clearly (1. Sign up → 2. Apply → 3. Start earning)
- Add trust badges (secure, privacy-focused, community-driven)

**Implementation Pattern**:
```tsx
<section className="page py-16">
  <div className="page-content space-y-12 text-center">
    {/* Main CTA */}
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-4xl font-bold md:text-5xl">
        ¿Listo para dar el <span className="text-primary">siguiente paso</span>?
      </h2>
      <p className="text-xl text-foreground/80">
        Únete a 100+ profesionales construyendo el futuro de la tecnología
      </p>

      <AuthButtonPrivy size="lg" className="text-2xl font-medium lg:px-14 lg:py-6">
        Comenzar ahora <SparklesIcon className="ml-2 h-5 w-5 fill-background" />
      </AuthButtonPrivy>

      {/* Urgency */}
      <p className="text-sm text-muted-foreground">
        🔥 Próxima cohorte inicia el 1 de febrero - Cupos limitados
      </p>
    </div>

    {/* Next steps using Card components */}
    <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
      {[
        { step: '1', title: 'Regístrate', desc: 'Crea tu cuenta en 30 segundos' },
        { step: '2', title: 'Aplica', desc: 'Cuéntanos sobre tus intereses' },
        { step: '3', title: 'Comienza', desc: 'Empieza a ganar y aprender' },
      ].map((item) => (
        <Card key={item.step}>
          <CardContent className="pt-6 text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{item.step}</span>
            </div>
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Trust badges using Badge component */}
    <div className="flex flex-wrap justify-center gap-4">
      <Badge variant="secondary" className="flex items-center gap-2">
        <Shield className="h-4 w-4" /> 100% Gratis
      </Badge>
      <Badge variant="secondary" className="flex items-center gap-2">
        <Lock className="h-4 w-4" /> Datos seguros
      </Badge>
      <Badge variant="secondary" className="flex items-center gap-2">
        <Heart className="h-4 w-4" /> Comunidad inclusiva
      </Badge>
    </div>
  </div>
</section>
```

---

## 5. Responsive Design Guidelines

### Mobile-First Approach

All sections must be fully functional on mobile before scaling up.

**Breakpoints** (from Tailwind defaults):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Common Patterns**:
```tsx
// Text scaling
className="text-3xl md:text-4xl lg:text-5xl"

// Grid responsiveness
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Spacing scaling
className="gap-4 md:gap-6 lg:gap-8"
className="py-8 md:py-12 lg:py-16"

// Visibility toggles
className="hidden md:block"        // Hide on mobile
className="md:hidden"              // Hide on desktop
```

### Touch Targets

Minimum touch target size: 44x44px for all interactive elements on mobile.

```tsx
// Good
<button className="px-6 py-3">    // Provides adequate touch area

// Bad
<button className="p-1">          // Too small for touch
```

---

## 6. Accessibility Requirements

### Semantic HTML

```tsx
// Use proper heading hierarchy
<h1> → <h2> → <h3>  // Never skip levels

// Use semantic landmarks
<header>, <main>, <section>, <footer>, <nav>

// Use proper list markup
<ul>, <ol>, <li>
```

### ARIA Labels

```tsx
// Images
<img src="..." alt="Descriptive text" />

// Icons without text
<button aria-label="Cerrar menú">
  <X className="h-4 w-4" />
</button>

// Interactive cards
<Link href="..." aria-label={`Ver perfil de ${name}`}>
  <Card>...</Card>
</Link>
```

### Color Contrast

All text must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18px+ or 14px+ bold): 3:1 minimum

**Tested combinations** (from globals.css):
- `text-foreground` on `bg-background` ✅
- `text-primary` on `bg-background` ✅
- `text-white` on `bg-secondary` ✅
- `text-foreground` on `bg-accent` ✅

### Focus States

All interactive elements must have visible focus indicators:

```tsx
// Button focus (handled by shadcn/ui)
<Button>  // Has default focus ring

// Custom interactive elements
<div
  tabIndex={0}
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  {/* Content */}
</div>
```

---

## 7. Performance Considerations

### Image Optimization

```tsx
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"          // Lazy load below fold
  priority={false}        // Only true for LCP images
/>
```

### Animation Performance

```tsx
// Use CSS transforms (GPU-accelerated)
className="transform hover:-translate-y-1 transition-transform"

// Avoid animating expensive properties
// ❌ width, height, padding, margin
// ✅ transform, opacity
```

### Code Splitting

```tsx
// Dynamic imports for below-the-fold sections
import dynamic from 'next/dynamic'

const TestimonialsSection = dynamic(
  () => import('@/components/landing/testimonials-section'),
  { loading: () => <div>Cargando...</div> }
)
```

---

## 8. Content Guidelines

### Tone & Voice

- **Friendly**: Use "tú" not "usted"
- **Action-oriented**: "Comienza ahora" not "Puede comenzar ahora"
- **Authentic**: Real stories, real numbers
- **Inclusive**: "Comunidad" not "club" or "elite"

### Key Messages

1. **Earn while you learn** - Core value prop
2. **Real projects, real pay** - Credibility
3. **Community-driven** - Differentiation
4. **Latin America focus** - Geographic specificity

### Micro-copy Examples

**CTAs**:
- ✅ "Quiero unirme", "Comenzar ahora", "Ver mi dashboard"
- ❌ "Registrarse", "Sign up", "Continuar"

**Descriptions**:
- ✅ "Gana mientras aprendes IA y cripto"
- ❌ "Aprende desarrollo de software"

---

## 9. Testing Checklist

### Visual QA

- [ ] All sections render correctly on mobile (375px width)
- [ ] All sections render correctly on tablet (768px)
- [ ] All sections render correctly on desktop (1440px)
- [ ] Dark mode displays correctly for all sections
- [ ] All colors match brand palette (no random colors)
- [ ] Typography is consistent (no font mixing)
- [ ] Spacing is consistent (no manual margin/padding)

### Functional QA

- [ ] All CTAs link to correct destinations
- [ ] All images have alt text
- [ ] All interactive elements have hover states
- [ ] All interactive elements have focus states
- [ ] Forms validate correctly
- [ ] Auth flow works end-to-end
- [ ] Page loads in < 3 seconds (lighthouse score > 90)

### Accessibility QA

- [ ] Keyboard navigation works (tab through all elements)
- [ ] Screen reader announces all content correctly (test with NVDA/JAWS)
- [ ] Color contrast passes WCAG AA (use Chrome DevTools)
- [ ] Focus indicators visible on all interactive elements
- [ ] Semantic HTML used throughout
- [ ] ARIA labels present where needed

---

## 10. Implementation Priority

### Phase 1: Critical Updates (Week 1)
1. Hero section enhancements (trust indicators, gradient)
2. Stats section redesign (featured stat, grouping)
3. CTA improvements (urgency, next steps)

### Phase 2: Content Updates (Week 2)
4. Testimonials enhancement (photos, roles, links)
5. Success stories section (new)
6. FAQ updates (based on common questions)

### Phase 3: Polish & Optimize (Week 3)
7. Performance optimization (image loading, code splitting)
8. Accessibility audit and fixes
9. A/B testing setup (hero CTA variations)

---

## 11. Success Metrics

### Primary KPIs
- **Conversion rate**: Sign-up clicks / page views
- **Time on page**: Average session duration
- **Bounce rate**: % of single-page sessions

### Secondary KPIs
- **CTA click rate**: Primary CTA clicks / page views
- **Section engagement**: Scroll depth, section views
- **Mobile vs desktop**: Conversion rate comparison

### Target Goals
- 5% increase in conversion rate
- 20% increase in time on page
- 10% decrease in bounce rate

---

## 12. Related Documentation

- [Hero Section Component](../../src/components/landing/hero-section.tsx)
- [Stats Section Component](../../src/components/landing/stats-section.tsx)
- [Solution Section Component](../../src/components/landing/solution-section.tsx)
- [Global Styles](../../src/styles/globals.css)
- [CLAUDE.md Project Guidelines](../../CLAUDE.md)

---

## 13. Questions & Decisions

### Open Questions
1. Should we add video testimonials?
2. Do we need localization for other Spanish-speaking countries?
3. Should we integrate live stats (real-time member count)?

### Design Decisions
- ✅ Maintain existing color palette (no new brand colors)
- ✅ Use existing shadcn/ui components (no custom components)
- ✅ Mobile-first approach for all new sections
- ✅ Prioritize performance over flashy animations

---

**Last Updated**: January 13, 2026
**Document Owner**: Design Team
**Reviewers**: Engineering Team, Product Team

