# Landing Page Update - Implementation Workflow

**Date**: January 13, 2026
**Sprint Duration**: 3 weeks (Jan 13 - Feb 2, 2026)
**Team Size**: 1-2 developers
**Authoritative Reference**: [frutero-landing-page-update-scope.md](./frutero-landing-page-update-scope.md)

---

## 📋 Scope Document Reference

**⚠️ IMPORTANT**: This workflow implements the design specification defined in [frutero-landing-page-update-scope.md](./frutero-landing-page-update-scope.md). All implementation decisions MUST align with the scope document.

**Critical Rules from Scope Document**:
- 🚫 **NEVER USE `bg-muted`** or any muted background variants (Section 2.1)
- ✅ **PRESERVE rotated highlight spans** in hero section (Section 2.5, Section 4.1)
- ✅ **Use existing components** - `StatCard`, `BuildersShowcaseMarquee`, `AuthButtonPrivy` (Section 3)
- ✅ **Follow section structure pattern** - `page` → `page-content` → `section` (Section 2.4)
- ✅ **Use OKLCH color tokens** from `globals.css` (Section 2.1)

**Before implementing any task**, review the corresponding section in the scope document.

---

## Executive Summary

This workflow outlines the implementation plan for updating the Poktapok landing page while **preserving all existing brand elements** as defined in the scope document, particularly:
- ✅ Hero section with rotated highlight spans - `bg-accent` for "Crecimiento", `bg-secondary` for "IA y Cripto" (Scope: Section 2.5, 4.1)
- ✅ Current section structure and flow (Scope: Section 2.4)
- ✅ Existing components - `StatCard`, `BuildersShowcaseMarquee`, `AuthButtonPrivy` (Scope: Section 3)
- ✅ Brand color palette and typography (Scope: Section 2.1, 2.2)

**Implementation Approach**: Incremental enhancement with backward compatibility following scope document specifications

---

## Phase Breakdown

### Phase 1: Hero & Stats (Week 1 - Jan 13-19)
**Priority**: HIGH
**Effort**: 12-16 hours
**Risk**: LOW

### Phase 2: Content & Testimonials (Week 2 - Jan 20-26)
**Priority**: MEDIUM
**Effort**: 16-20 hours
**Risk**: MEDIUM (requires content gathering)

### Phase 3: Polish & Optimize (Week 3 - Jan 27-Feb 2)
**Priority**: MEDIUM
**Effort**: 8-12 hours
**Risk**: LOW

---

## Phase 1: Hero & Stats Enhancement (Week 1)

### 🎯 Goals
- Add trust indicators to hero
- Enhance stats section with featured stat
- Improve CTA section with urgency
- Maintain existing hero structure 100%

### Task 1.1: Hero Section Copy & Enhancement Update
**File**: `src/components/landing/hero-section.tsx`
**Estimated Time**: 5 hours
**Dependencies**: None
**Scope Reference**: Section 4.1 (Hero Section Enhancements)

#### Implementation Steps

1. **Update hero copy with new messaging** (1.5 hours)

   **New Copy from Scope Document** (Section 4.1):

   **Headline**: "Aprende a **ganar más** con IA"
   - CRITICAL: Use rotated span for "ganar más" with `bg-accent`
   - Remove second rotated span (no longer "IA y Cripto")

   **Subheadline**: "La comunidad donde desarrollas habilidades reales, conectas con mentores activos, y ganas mientras aprendes."

   ```tsx
   {/* Update hero title - PRESERVE rotated spans styling */}
   <h1 className="text-4xl leading-tight font-semibold text-foreground md:text-5xl">
     Aprende a{' '}
     <span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
       ganar más
     </span>{' '}
     con IA
   </h1>

   {/* Update subheadline */}
   <p className="text-2xl text-foreground md:text-3xl md:font-medium lg:text-2xl lg:font-medium">
     La comunidad donde desarrollas habilidades reales, <br />
     conectas con mentores activos, y ganas mientras aprendes.
   </p>
   ```

2. **Add proof metrics as pill badges** (1 hour)

   **Pattern from Scope Document** (Section 4.1):
   ```tsx
   {/* Add after subheadline, before CTAs - use Badge component */}
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
   ```

3. **Add secondary CTA button** (1 hour)

   **Pattern from Scope Document** (Section 4.1):
   ```tsx
   {/* Update CTA section */}
   <div className="flex flex-col sm:flex-row justify-center gap-4">
     <AuthButtonPrivy size="lg" className="text-2xl font-medium lg:px-14 lg:py-6">
       Únete a la Comunidad <SparklesIcon className="ml-2 h-5 w-5 fill-background" />
     </AuthButtonPrivy>

     {/* NEW: Secondary CTA */}
     <Button
       variant="outline"
       size="lg"
       className="text-2xl font-medium lg:px-14 lg:py-6"
       asChild
     >
       <Link href="#programs-section">Explora Programas</Link>
     </Button>
   </div>
   ```

4. **Import required components** (0.5 hour)

   ```tsx
   // Add to imports:
   import { Badge } from '@/components/ui/badge'
   import Link from 'next/link'
   ```

5. **Test responsive behavior** (0.5 hour)
   - Mobile (375px): Badge components stack, CTAs stack vertically
   - Tablet (768px): Badges wrap naturally, CTAs side-by-side
   - Desktop (1024px+): All elements in optimal layout

6. **Dark mode testing** (0.5 hour)
   - Check Badge component contrast
   - Test CTA button visibility
   - Verify rotated spans remain readable

#### Acceptance Criteria
- [ ] Badge components display correctly on all screen sizes
- [ ] Secondary CTA button uses Link component properly
- [ ] **CRITICAL**: Hero title with rotated span updated to new copy (Scope: Section 2.5)
  - "ganar más" uses `bg-accent` with same styling
  - Single rotated span only (removed second span)
  - Uses `transform`, `rounded-lg`, `px-4 py-2` classes
- [ ] BuildersShowcaseMarquee still renders below CTAs
- [ ] Dark mode displays correctly
- [ ] No `bg-muted` variants used anywhere (Scope: Section 2.1 critical rule)

#### Files Changed
- `src/components/landing/hero-section.tsx`

---

### Task 1.2: Stats Section Redesign
**File**: `src/components/landing/stats-section.tsx`
**Estimated Time**: 5 hours
**Dependencies**: None
**Scope Reference**: Section 4.2 (Stats Section Redesign)

#### Implementation Steps

1. **Create featured stat component** (2 hours)

   **Pattern from Scope Document** (Section 4.2):
   ```tsx
   // Add before stats grid - use Card component:
   <div className="mx-auto max-w-md">
     <Card className="border-2 border-primary transition-shadow hover:shadow-lg">
       <CardContent className="pt-6 text-center space-y-2">
         <Coins className="h-12 w-12 text-primary mx-auto" />
         <div className="text-6xl font-bold text-primary">$100k+</div>
         <p className="text-xl text-foreground">USD distribuidos a la comunidad</p>
         <p className="text-sm text-muted-foreground">
           En los últimos 12 meses
         </p>
       </CardContent>
     </Card>
   </div>
   ```

   **Component reuse** (Scope: Section 3): Uses existing `Card` and `CardContent` from shadcn/ui

2. **Adjust stats grid layout** (1 hour)
   - Change from 2x3 grid (6 stats) to featured + 2x2 grid (5 stats)
   - Move "$100k+ USD" from grid to featured
   - Keep remaining 5 stats in grid

3. **Add hover animations** (1 hour)
   ```tsx
   // Update StatCard with:
   className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
   ```

4. **Test all breakpoints** (1 hour)
   - Mobile: Featured stat full width, grid 2 columns
   - Tablet: Featured stat centered, grid 2 columns
   - Desktop: Featured stat centered, grid 3 columns with adjusted spacing

#### Acceptance Criteria
- [ ] Featured stat uses Card component (Scope: Section 4.2)
- [ ] No gradient backgrounds used on Card (removed `bg-primary/5`)
- [ ] Remaining 5 stats display in responsive grid using `StatCard` component (Scope: Section 3)
- [ ] Hover animations work smoothly (subtle, consistent with current styling)
- [ ] All icons from `lucide-react` (Scope: Section 2.3)
- [ ] Numbers and descriptions are legible on all backgrounds
- [ ] Color usage follows OKLCH tokens: `primary`, `foreground`, `muted-foreground` (Scope: Section 2.1)
- [ ] No `bg-muted` variants used (Scope: Section 2.1 critical rule)

#### Files Changed
- `src/components/landing/stats-section.tsx`
- Possibly `src/components/stats/stat-card.tsx` (if hover styles added)

---

### Task 1.3: CTA Section Enhancement
**File**: `src/components/landing/final-cta-section.tsx`
**Estimated Time**: 3 hours
**Dependencies**: None
**Scope Reference**: Section 4.6 (CTA Section Enhancements)

#### Implementation Steps

1. **Add urgency messaging** (1 hour)

   **Pattern from Scope Document** (Section 4.6):
   ```tsx
   // After AuthButtonPrivy:
   <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
     <Clock className="h-4 w-4 text-secondary" />
     Próxima cohorte inicia el 1 de febrero - Cupos limitados
   </p>
   ```

2. **Add next steps indicators using Card components** (1.5 hours)
   ```tsx
   // Add before trust badges - use Card component:
   <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
     {[
       { step: '1', title: 'Regístrate', desc: 'Crea tu cuenta en 30 segundos', icon: UserPlus },
       { step: '2', title: 'Aplica', desc: 'Cuéntanos sobre tus intereses', icon: FileText },
       { step: '3', title: 'Comienza', desc: 'Empieza a ganar y aprender', icon: Rocket },
     ].map((item) => {
       const Icon = item.icon
       return (
         <Card key={item.step}>
           <CardContent className="pt-6 text-center space-y-2">
             <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
               <Icon className="h-6 w-6 text-primary" />
             </div>
             <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
             <p className="text-sm text-muted-foreground">{item.desc}</p>
           </CardContent>
         </Card>
       )
     })}
   </div>
   ```

3. **Add trust badges using Badge component** (0.5 hour)
   ```tsx
   // Add at bottom - use Badge component:
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
   ```

#### Acceptance Criteria
- [ ] Urgency message displays clearly (Scope: Section 4.6)
- [ ] Next steps use Card components (Scope: Section 3)
- [ ] Next steps show in 1 column (mobile), 3 columns (desktop) per responsive guidelines (Scope: Section 7)
- [ ] Trust badges use Badge component (Scope: Section 3)
- [ ] Trust badges wrap appropriately on narrow screens
- [ ] All icons from `lucide-react` (Scope: Section 2.3)
- [ ] No gradient backgrounds used
- [ ] Uses `primary`, `secondary`, `accent`, `foreground` color tokens only (Scope: Section 2.1)
- [ ] No `bg-muted` variants used (Scope: Section 2.1 critical rule)

#### Files Changed
- `src/components/landing/final-cta-section.tsx`

---

### Phase 1 Testing Checklist

**Visual QA**:
- [ ] Hero section clean without gradients
- [ ] Badge components legible on all backgrounds
- [ ] Featured stat Card stands out visually
- [ ] Stats grid balanced and aligned
- [ ] CTA section Card components display properly
- [ ] Next steps Cards aligned and consistent

**Responsive QA**:
- [ ] Mobile (375px): All elements stack correctly
- [ ] Tablet (768px): Grid layouts work at 2 columns
- [ ] Desktop (1440px): Full layout displays correctly
- [ ] No horizontal scroll on any breakpoint

**Dark Mode QA**:
- [ ] All text readable in dark mode
- [ ] Badge components maintain proper contrast
- [ ] Icons maintain proper contrast
- [ ] Card components use appropriate backgrounds

**Functional QA**:
- [ ] All CTAs link to auth flow
- [ ] No console errors
- [ ] No layout shifts on load

---

## Phase 2: Content & Testimonials (Week 2)

### 🎯 Goals
- Enhance testimonials with user context
- Create new success stories section
- Gather real member data
- Maintain existing testimonials structure

### Task 2.1: Gather Success Story Content
**Estimated Time**: 4 hours
**Dependencies**: Access to member data
**Blocker Risk**: HIGH (requires real data)
**Scope Reference**: Section 4.4 (Success Stories Section - NEW)

#### Content Requirements

For **3-5 success stories**, gather:

1. **Member Profile**
   - Full name (or alias if preferred)
   - Current role/title
   - Profile photo or avatar
   - Link to profile page (if exists)

2. **Story Data**
   - Brief description (2-3 sentences) of achievement
   - Total earnings from platform
   - Number of projects completed
   - Primary learning track (AI, Crypto, Privacy)

3. **Optional**
   - Project screenshot or visual
   - Quote from member
   - Timeline (e.g., "3 months from joining to first paid project")

#### Content Template

```typescript
interface SuccessStory {
  id: string
  member: {
    name: string
    role: string
    avatarUrl?: string
    profileUrl?: string
  }
  achievement: {
    title: string
    description: string
    earnings: string        // e.g., "$5,000"
    projects: number
    timeline?: string       // e.g., "3 meses"
  }
  visual?: {
    imageUrl: string
    alt: string
  }
  track: 'ai' | 'crypto' | 'privacy'
}
```

#### Data Sources
- [ ] Check profiles table for top earners
- [ ] Review completed bounties
- [ ] Contact members for permission
- [ ] Prepare anonymized versions if needed

---

### Task 2.2: Create Success Stories Component
**File**: `src/components/landing/success-stories-section.tsx` (new)
**Estimated Time**: 6 hours
**Dependencies**: Task 2.1 content
**Scope Reference**: Section 4.4 (Success Stories Section)

#### Implementation Steps

1. **Create component file using Card components** (3 hours)

   **Pattern from Scope Document** (Section 4.4 - alternating layout using Card):
   ```bash
   touch src/components/landing/success-stories-section.tsx
   ```

   ```tsx
   import { ArrowRightIcon } from 'lucide-react'
   import Link from 'next/link'
   import Image from 'next/image'

   interface SuccessStoryData {
     member: { name: string; role: string; avatarUrl?: string; profileUrl?: string }
     achievement: { title: string; description: string; earnings: string; projects: number }
     visual?: { imageUrl: string; alt: string }
   }

   const successStories: SuccessStoryData[] = [
     // Data from Task 2.1
   ]

   export default function SuccessStoriesSection() {
     return (
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

           {/* Success story cards - alternating layout using Card */}
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
                       {story.visual ? (
                         <div className="aspect-square rounded-2xl overflow-hidden">
                           <Image
                             src={story.visual.imageUrl}
                             alt={story.visual.alt}
                             width={400}
                             height={400}
                             className="object-cover w-full h-full"
                           />
                         </div>
                       ) : (
                         <div className="aspect-square rounded-2xl bg-card border-2 border-border flex items-center justify-center">
                           <p className="text-6xl">🚀</p>
                         </div>
                       )}
                     </div>

                     {/* Content side */}
                     <div className="flex flex-col justify-center space-y-4">
                   <h3 className="text-2xl font-bold text-foreground">
                     {story.achievement.title}
                   </h3>
                   <p className="text-lg text-foreground/80">
                     {story.achievement.description}
                   </p>

                   {/* Member info */}
                   <div className="flex items-center gap-3 pt-4 border-t border-border">
                     {story.member.avatarUrl ? (
                       <Image
                         src={story.member.avatarUrl}
                         alt={story.member.name}
                         width={40}
                         height={40}
                         className="rounded-full"
                       />
                     ) : (
                       <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                         <span className="font-bold text-primary">
                           {story.member.name[0]}
                         </span>
                       </div>
                     )}
                     <div>
                       <p className="font-semibold text-foreground">{story.member.name}</p>
                       <p className="text-sm text-muted-foreground">{story.member.role}</p>
                     </div>
                   </div>

                     {/* Metrics */}
                     <div className="flex gap-6">
                       <div>
                         <p className="font-bold text-primary text-2xl">
                           {story.achievement.earnings}
                         </p>
                         <p className="text-sm text-muted-foreground">Ganado</p>
                       </div>
                       <div>
                         <p className="font-bold text-secondary text-2xl">
                           {story.achievement.projects}
                         </p>
                         <p className="text-sm text-muted-foreground">Proyectos</p>
                       </div>
                     </div>

                     {/* Link to profile */}
                     {story.member.profileUrl && (
                       <Link
                         href={story.member.profileUrl}
                         className="flex items-center gap-2 text-primary hover:underline"
                       >
                         Ver perfil completo <ArrowRightIcon className="h-4 w-4" />
                       </Link>
                     )}
                   </div>
                 </div>
               </CardContent>
             </Card>
             ))}
           </div>
         </div>
       </section>
     )
   }
   ```

2. **Add to landing page** (0.5 hour)
   ```tsx
   // In src/app/page.tsx, add after TestimonialsSection:
   import SuccessStoriesSection from '@/components/landing/success-stories-section'

   <TestimonialsSection />
   <SuccessStoriesSection />  // NEW
   <StatsSection />
   ```

3. **Test layout** (1 hour)
   - Mobile: Cards stack vertically
   - Tablet: Grid layout with proper gap
   - Desktop: Alternating image/content sides

4. **Optimize images** (1.5 hours)
   - Use Next.js Image with proper sizes
   - Add loading="lazy" for below-fold images
   - Compress images to < 200KB each

#### Acceptance Criteria
- [ ] Card components used for success stories (Scope: Section 3)
- [ ] 3-5 success stories display correctly (Scope: Section 4.4)
- [ ] Alternating layout works on desktop (Scope: Section 4.4 layout pattern)
- [ ] Cards stack on mobile per responsive guidelines (Scope: Section 7)
- [ ] Member avatars display (or fallback initials using `bg-primary/10`)
- [ ] Links to profiles work using `text-primary hover:underline` (Scope: Section 2.6)
- [ ] Images load efficiently using Next.js Image component
- [ ] No gradient backgrounds used (removed `bg-primary/5`)
- [ ] Section structure follows `page` → `page-content` pattern (Scope: Section 2.4)
- [ ] Color usage: `primary`, `secondary`, `accent`, `foreground` only (Scope: Section 2.1)
- [ ] No `bg-muted` variants used (Scope: Section 2.1 critical rule)

#### Files Changed
- `src/components/landing/success-stories-section.tsx` (new)
- `src/app/page.tsx`

---

### Task 2.3: Enhance Testimonials Section
**File**: `src/components/landing/testimonials-section.tsx`
**Estimated Time**: 4 hours
**Dependencies**: None
**Scope Reference**: Section 4.3 (Testimonials Enhancement)

#### Implementation Steps

1. **Update testimonial data structure** (1 hour)

   **Data structure from Scope Document** (Section 4.3):
   ```tsx
   interface Testimonial {
     quote: string
     author: {
       name: string
       role: string
       avatarUrl?: string
       initials: string
       profileUrl?: string
     }
   }
   ```

2. **Add avatar display** (1.5 hours)

   **Pattern from Scope Document** (Section 4.3):
   ```tsx
   // Update testimonial card - use Card component:
   <Card className="group transition-all hover:border-primary/30">
     <CardContent className="pt-6 space-y-4">
       {/* Avatar */}
       <div className="flex items-center gap-4">
         {testimonial.author.avatarUrl ? (
           <Image
             src={testimonial.author.avatarUrl}
             alt={testimonial.author.name}
             width={48}
             height={48}
             className="rounded-full"
           />
         ) : (
           <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
             <span className="text-xl font-bold text-primary">
               {testimonial.author.initials}
             </span>
           </div>
         )}
         <div>
           <p className="font-semibold text-foreground">{testimonial.author.name}</p>
           <p className="text-sm text-muted-foreground">{testimonial.author.role}</p>
         </div>
       </div>

       {/* Quote */}
       <p className="text-foreground/80 italic">"{testimonial.quote}"</p>

       {/* Optional: Profile link */}
       {testimonial.author.profileUrl && (
         <Link href={testimonial.author.profileUrl} className="flex items-center gap-2 text-sm text-primary hover:underline">
           Ver perfil <ArrowRightIcon className="h-3 w-3" />
         </Link>
       )}
     </CardContent>
   </Card>
   ```

3. **Update testimonial content** (1 hour)
   - Add roles to existing testimonials
   - Generate initials from names
   - Optional: Add real avatars if available

4. **Test responsive grid** (0.5 hour)
   - Mobile: 1 column
   - Tablet: 2 columns
   - Desktop: 3 columns

#### Acceptance Criteria
- [ ] Card component used for testimonials (Scope: Section 3)
- [ ] Avatars display for all testimonials (Scope: Section 4.3)
- [ ] Fallback initials show when no avatar using `bg-primary/10` (Scope: Section 4.3)
- [ ] Roles display below names with `text-muted-foreground` (Scope: Section 2.1)
- [ ] Card hover uses `border-primary/30` transition (Scope: Section 2.6)
- [ ] Grid responsive: 1 col (mobile), 2 cols (tablet), 3 cols (desktop) per Section 7
- [ ] No `bg-muted` variants used (Scope: Section 2.1 critical rule)
- [ ] Profile links work when available
- [ ] Hover effects work smoothly

#### Files Changed
- `src/components/landing/testimonials-section.tsx`

---

### Task 2.4: FAQ Content Update
**File**: `src/components/landing/faq-section.tsx`
**Estimated Time**: 2 hours
**Dependencies**: None
**Scope Reference**: Section 4.5 (FAQ Updates)

#### Implementation Steps

1. **Review current FAQ content** (0.5 hour)
   - Identify outdated answers
   - Check for missing common questions

2. **Add/update FAQ items** (1 hour)
   - Add "¿Cuánto puedo ganar?" if missing
   - Update "¿Es realmente gratis?" with specifics
   - Add "¿Cuánto tiempo toma la aplicación?"
   - Update any changed processes

3. **Test accordion functionality** (0.5 hour)
   - Verify expand/collapse works
   - Check mobile tap targets

#### Acceptance Criteria
- [ ] All FAQs have accurate answers
- [ ] Accordion component works on all devices
- [ ] No spelling/grammar errors
- [ ] Answers are concise (2-3 sentences max)

#### Files Changed
- `src/components/landing/faq-section.tsx`

---

### Phase 2 Testing Checklist

**Content QA**:
- [ ] Success stories have real data
- [ ] Testimonials have proper attribution
- [ ] FAQ answers are accurate
- [ ] No placeholder text remains

**Visual QA**:
- [ ] Success stories alternate layout correctly
- [ ] Testimonial avatars render properly
- [ ] All images optimized and load fast
- [ ] Member names and roles legible

**Responsive QA**:
- [ ] Success stories stack on mobile
- [ ] Testimonials grid adjusts to screen size
- [ ] FAQ accordion works on touch devices

**Performance QA**:
- [ ] Images lazy load below fold
- [ ] No layout shift during image load
- [ ] Page load time < 3 seconds

---

## Phase 3: Polish & Optimize (Week 3)

### 🎯 Goals
- Performance optimization
- Accessibility audit and fixes
- Analytics setup
- Final QA and launch prep

### Task 3.1: Performance Optimization
**Estimated Time**: 4 hours
**Dependencies**: Phases 1-2 complete
**Scope Reference**: Section 8 (Performance Optimization)

#### Implementation Steps

1. **Image optimization audit** (1 hour)
   ```bash
   # Check all images in landing sections
   find src/components/landing -name "*.tsx" -exec grep -l "Image\|img" {} \;
   ```
   - Verify all use Next.js `<Image>` component
   - Check `width` and `height` props set
   - Verify `loading="lazy"` on below-fold images
   - Set `priority={true}` only on hero image

2. **Code splitting** (1.5 hours)
   ```tsx
   // In src/app/page.tsx, lazy load below-fold sections:
   import dynamic from 'next/dynamic'

   const TestimonialsSection = dynamic(
     () => import('@/components/landing/testimonials-section'),
     { loading: () => <div className="h-96 animate-pulse bg-card" /> }
   )

   const SuccessStoriesSection = dynamic(
     () => import('@/components/landing/success-stories-section')
   )

   const FAQSection = dynamic(
     () => import('@/components/landing/faq-section')
   )
   ```

3. **Run Lighthouse audit** (1 hour)
   ```bash
   # Open Chrome DevTools → Lighthouse
   # Run audit for:
   # - Performance
   # - Accessibility
   # - Best Practices
   # - SEO
   ```
   - Target: Performance score > 90
   - Fix any issues identified

4. **Bundle size analysis** (0.5 hour)
   ```bash
   bun run build
   # Review bundle sizes in terminal output
   # Look for unexpectedly large chunks
   ```

#### Acceptance Criteria
- [ ] Lighthouse Performance score > 90 (Scope: Section 8.1)
- [ ] All images optimized using Next.js Image component (Scope: Section 8.2)
- [ ] Below-fold sections lazy loaded with `dynamic` import (Scope: Section 8.3)
- [ ] No unnecessary bundle bloat
- [ ] Image formats: WebP for photos, SVG for icons (Scope: Section 8.2)
- [ ] Code splitting applied to heavy sections (Scope: Section 8.3)

#### Files Changed
- `src/app/page.tsx`
- Possibly image files (compression)

---

### Task 3.2: Accessibility Audit
**Estimated Time**: 3 hours
**Dependencies**: None
**Scope Reference**: Section 6 (Accessibility Requirements)

#### Implementation Steps

1. **Semantic HTML audit** (1 hour)
   - Verify proper heading hierarchy (h1 → h2 → h3)
   - Check landmark usage (`<section>`, `<nav>`, etc.)
   - Ensure lists use `<ul>`/`<ol>`

2. **ARIA labels audit** (1 hour)
   ```tsx
   // Check all interactive elements have labels:
   <button aria-label="Ver más detalles">
     <ArrowRight className="h-4 w-4" />
   </button>

   // Check all images have alt text:
   <Image src="..." alt="Descripción clara" />
   ```

3. **Keyboard navigation test** (0.5 hour)
   - Tab through entire page
   - Verify all interactive elements reachable
   - Check focus indicators visible

4. **Screen reader test** (0.5 hour)
   - Test with NVDA (Windows) or VoiceOver (Mac)
   - Verify all content announced correctly
   - Check section headings navigable

#### Acceptance Criteria
- [ ] Lighthouse Accessibility score > 95 (Scope: Section 6)
- [ ] WCAG AA compliance met (Scope: Section 6.1)
- [ ] All images have descriptive alt text (Scope: Section 6.2)
- [ ] All interactive elements keyboard accessible (Scope: Section 6.3)
- [ ] Focus indicators visible on all elements with ring utility classes (Scope: Section 6.3)
- [ ] Screen reader can navigate page with proper semantic HTML (Scope: Section 6.2)
- [ ] Color contrast ratios meet WCAG AA standards (4.5:1 for normal text) (Scope: Section 6.1)

#### Files Changed
- Various landing section files (aria-label additions)

---

### Task 3.3: Analytics Setup
**Estimated Time**: 1 hour
**Dependencies**: None

#### Implementation Steps

1. **Add conversion tracking** (0.5 hour)
   ```tsx
   // In AuthButtonPrivy component:
   const handleClick = () => {
     // Track CTA click
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', 'cta_click', {
         event_category: 'engagement',
         event_label: 'hero_cta',
       })
     }
     // ... existing click logic
   }
   ```

2. **Add scroll depth tracking** (0.5 hour)
   ```tsx
   // In src/app/page.tsx or layout:
   useEffect(() => {
     // Track when users reach success stories section
     const observer = new IntersectionObserver((entries) => {
       entries.forEach((entry) => {
         if (entry.isIntersecting) {
           window.gtag?.('event', 'scroll_depth', {
             section: entry.target.id,
           })
         }
       })
     })

     // Observe key sections
     document.querySelectorAll('[id$="-section"]').forEach((el) => {
       observer.observe(el)
     })

     return () => observer.disconnect()
   }, [])
   ```

#### Acceptance Criteria
- [ ] CTA clicks tracked
- [ ] Section views tracked
- [ ] No analytics errors in console

#### Files Changed
- `src/components/buttons/auth-button-privy.tsx`
- `src/app/page.tsx` or `src/app/layout.tsx`

---

### Task 3.4: Final QA & Launch Prep
**Estimated Time**: 2 hours
**Dependencies**: All previous tasks complete

#### Pre-Launch Checklist

**Visual QA** (30 min):
- [ ] Hero section displays correctly (Scope: Section 4.1)
- [ ] **CRITICAL**: All rotated highlight spans intact - "Crecimiento" with `bg-accent`, "IA y Cripto" with `bg-secondary` (Scope: Section 2.5, 4.1)
- [ ] Featured stat prominent (Scope: Section 4.2)
- [ ] Success stories alternate layout (Scope: Section 4.4)
- [ ] Testimonials with avatars (Scope: Section 4.3)
- [ ] CTA section with all enhancements (Scope: Section 4.6)
- [ ] FAQ section updated (Scope: Section 4.5)
- [ ] **No `bg-muted` variants anywhere** (Scope: Section 2.1 critical rule)

**Responsive QA** (30 min):
- [ ] Mobile (375px) - All sections stack correctly
- [ ] Tablet (768px) - Grid layouts at 2 columns
- [ ] Desktop (1440px) - Full layout displays
- [ ] Desktop (1920px) - No excessive whitespace

**Cross-Browser QA** (30 min):
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work

**Dark Mode QA** (15 min):
- [ ] All sections readable in dark mode
- [ ] Colors maintain proper contrast
- [ ] Gradients visible but subtle

**Performance QA** (15 min):
- [ ] Page loads in < 3 seconds
- [ ] No layout shifts
- [ ] Images load progressively
- [ ] No console errors

---

## Risk Management

### High-Risk Items

1. **Content Gathering (Task 2.1)**
   - **Risk**: Real member data not available
   - **Mitigation**: Prepare anonymized versions or use composite examples
   - **Contingency**: Skip success stories section for v1, add in v1.1

2. **Performance Degradation**
   - **Risk**: New sections slow page load
   - **Mitigation**: Lazy load below-fold content, optimize images
   - **Contingency**: Remove least critical section (e.g., success stories)

### Medium-Risk Items

1. **Testimonial Content Updates**
   - **Risk**: Members don't respond for permission
   - **Mitigation**: Use existing approved testimonials with added roles
   - **Contingency**: Generate initials-only avatars for privacy

2. **Dark Mode Issues**
   - **Risk**: New gradients don't work in dark mode
   - **Mitigation**: Test dark mode throughout development
   - **Contingency**: Disable gradients in dark mode with media query

---

## Success Metrics

### Primary KPIs

**Conversion Rate**:
- **Baseline**: Current signup rate from landing page
- **Target**: +5% increase
- **Measurement**: Track CTA clicks → successful signups

**Time on Page**:
- **Baseline**: Current average session duration
- **Target**: +20% increase
- **Measurement**: Google Analytics average time

**Bounce Rate**:
- **Baseline**: Current bounce rate
- **Target**: -10% decrease
- **Measurement**: Google Analytics bounce rate

### Secondary KPIs

**Section Engagement**:
- **Success Stories Views**: Track scroll to section
- **FAQ Expansions**: Track accordion interactions
- **Stats Section Views**: Track visibility

**Mobile vs Desktop**:
- **Conversion Comparison**: Measure signup rate by device
- **Target**: < 10% difference between devices

---

## Rollout Plan

### Staging Deployment (Feb 1)

1. **Deploy to staging environment**
   ```bash
   git checkout -b feat/landing-page-update-q1
   git push origin feat/landing-page-update-q1
   # Vercel auto-deploys preview
   ```

2. **Internal review** (all team members)
   - Share staging URL
   - Gather feedback
   - Make minor adjustments

3. **Stakeholder review**
   - Product team approval
   - Marketing team approval
   - Design team approval

### Production Deployment (Feb 2)

1. **Create pull request**
   - Reference: docs/design/landing-page/frutero-landing-page-update-scope.md
   - Include screenshots (mobile, tablet, desktop)
   - List all changed files

2. **Code review**
   - Performance review
   - Accessibility review
   - Security review (if applicable)

3. **Merge and deploy**
   ```bash
   git checkout main
   git pull origin main
   git merge feat/landing-page-update-q1
   git push origin main
   # Vercel auto-deploys to production
   ```

4. **Post-deployment monitoring** (24 hours)
   - Monitor error logs
   - Check analytics for traffic drop
   - Verify all sections loading
   - Monitor Lighthouse scores

---

## Rollback Plan

### If Critical Issue Detected

1. **Identify issue severity**
   - **Critical**: Page won't load, broken auth flow
   - **Major**: Section missing, broken layout
   - **Minor**: Styling issue, typo

2. **Rollback procedure** (for Critical/Major)
   ```bash
   # Revert on Vercel dashboard
   # OR
   git revert <commit-hash>
   git push origin main
   ```

3. **Hot-fix procedure** (for Minor)
   - Create fix branch
   - Make minimal change
   - Fast-track review
   - Deploy fix

---

## Communication Plan

### Daily Updates (During Sprint)

**Format**: Slack message to #dev-team channel

**Template**:
```
🚀 Landing Page Update - Day X/15

✅ Completed Today:
- Task X.Y: [description]

🔄 In Progress:
- Task X.Z: [description] (X% complete)

⚠️ Blockers:
- [None / description of blocker]

📅 Tomorrow:
- Task A.B: [description]
```

### Weekly Review (End of Each Phase)

**Format**: 15-minute sync meeting

**Agenda**:
1. Demo completed work (5 min)
2. Review metrics/progress (3 min)
3. Discuss blockers (5 min)
4. Plan next phase (2 min)

### Launch Announcement

**Timing**: Feb 2 (production deployment)

**Channels**:
- Internal: Slack #general
- External: Twitter/X announcement (if applicable)
- Email: Newsletter to existing members

**Message Template**:
```
🎉 Landing Page Actualizada

Acabamos de lanzar mejoras a nuestra página principal:

✨ Historias reales de éxito de nuestra comunidad
📊 Estadísticas actualizadas de impacto
🚀 Proceso de inscripción más claro

Visítanos: [URL]

#Frutero #Poktapok #LandingPage
```

---

## Scope Document Compliance Checklist

**⚠️ MANDATORY**: Before merging any code, verify ALL of these compliance rules from the scope document:

### Critical Rules (MUST NEVER VIOLATE)

- [ ] **NO `bg-muted` variants used anywhere** (Scope: Section 2.1)
  - Search codebase: `grep -r "bg-muted" src/components/landing/`
  - Result MUST be zero matches

- [ ] **Rotated highlight spans preserved in hero** (Scope: Section 2.5, 4.1)
  - "Crecimiento" uses: `inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground`
  - "IA y Cripto" uses: `inline-block rotate-2 transform rounded-lg bg-secondary px-4 py-2 text-white`

- [ ] **Only OKLCH color tokens used** (Scope: Section 2.1)
  - Allowed: `primary`, `secondary`, `accent`, `background`, `foreground`, `border`, `muted-foreground`
  - No hardcoded colors (hex, rgb, oklch values)

### Structural Patterns (MUST FOLLOW)

- [ ] **Section structure pattern** (Scope: Section 2.4)
  ```tsx
  <section className="page py-8 md:py-12">
    <div className="page-content gap-y-8">
      {/* Content */}
    </div>
  </section>
  ```

- [ ] **Existing components reused** (Scope: Section 3)
  - `StatCard` for stats display
  - `BuildersShowcaseMarquee` for builder showcase
  - `AuthButtonPrivy` for CTA buttons
  - Icons from `lucide-react` only

- [ ] **Responsive breakpoints** (Scope: Section 7)
  - Mobile: 640px (sm:)
  - Tablet: 768px (md:)
  - Desktop: 1024px (lg:)
  - Wide: 1280px (xl:)

### Accessibility Requirements (Scope: Section 6)

- [ ] WCAG AA compliance (color contrast 4.5:1)
- [ ] Semantic HTML with proper heading hierarchy
- [ ] All images have descriptive alt text
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels on icon-only buttons

### Performance Requirements (Scope: Section 8)

- [ ] Next.js Image component for all images
- [ ] Lazy loading for below-fold sections
- [ ] Code splitting with `dynamic` import
- [ ] Lighthouse Performance score > 90

### Content Guidelines (Scope: Section 4)

- [ ] Hero trust indicators added (Section 4.1)
- [ ] Featured stat prominently displayed (Section 4.2)
- [ ] Testimonials include avatars and roles (Section 4.3)
- [ ] Success stories use alternating layout (Section 4.4)
- [ ] CTA section has urgency and next steps (Section 4.6)

---

## Appendix

### A. File Reference

**Modified Files**:
```
src/app/page.tsx
src/components/landing/hero-section.tsx
src/components/landing/stats-section.tsx
src/components/landing/testimonials-section.tsx
src/components/landing/final-cta-section.tsx
src/components/landing/faq-section.tsx
src/components/buttons/auth-button-privy.tsx
```

**New Files**:
```
src/components/landing/success-stories-section.tsx
docs/design/landing-page/implementation-workflow.md (this file)
```

### B. Dependencies

**External**:
- None (all using existing dependencies)

**Internal**:
- `lucide-react` - Icons
- `next/image` - Image optimization
- `shadcn/ui` - Card components

### C. Environment Variables

**No new environment variables required.**

Existing variables remain:
- `NEXT_PUBLIC_ALCHEMY_API_KEY`
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `NEXT_PUBLIC_PRIVY_CLIENT_ID`
- `PRIVY_APP_SECRET`

### D. Code Pattern Validation

**Before implementing any code, verify it matches these exact patterns from scope document:**

#### Rotated Highlight Spans (Section 2.5)
**Scope Pattern**:
```tsx
<span className="inline-block -rotate-2 transform rounded-lg bg-accent px-4 py-2 text-foreground">
  Crecimiento
</span>

<span className="inline-block rotate-2 transform rounded-lg bg-secondary px-4 py-2 text-white">
  IA y Cripto
</span>
```
**Workflow Usage**: Task 1.1, Acceptance Criteria emphasize preservation

#### Section Structure (Section 2.4)
**Scope Pattern**:
```tsx
<section className="page py-8 md:py-12">
  <div className="page-content gap-y-8">
    <div className="flex flex-col gap-y-4">
      {/* Section content */}
    </div>
  </div>
</section>
```
**Workflow Usage**: All Phase 2 component creations (Tasks 2.2, 2.3)

#### Trust Indicators (Section 4.1)
**Scope Pattern**:
```tsx
<div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
  <span className="flex items-center gap-2">
    <Users className="h-4 w-4 text-primary" />
    100+ profesionales activos
  </span>
</div>
```
**Workflow Usage**: Task 1.1, Step 1

#### Card Hover Pattern (Section 2.6)
**Scope Pattern**:
```tsx
<Card className="border-2 border-border bg-background hover:border-primary/30 transition-all">
```
**Workflow Usage**: Task 2.3, testimonials enhancement

#### Avatar Fallback (Section 4.3)
**Scope Pattern**:
```tsx
<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
  <span className="text-xl font-bold text-primary">
    {initials}
  </span>
</div>
```
**Workflow Usage**: Tasks 2.2 and 2.3
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `DATABASE_URL`

---

## Changelog

- **v1.0** (Jan 13, 2026): Initial workflow created
- **v1.1** (TBD): Updates based on Phase 1 learnings

---

**Document Owner**: Engineering Team
**Reviewers**: Product, Design, Marketing
**Next Review**: After Phase 1 completion (Jan 19, 2026)

