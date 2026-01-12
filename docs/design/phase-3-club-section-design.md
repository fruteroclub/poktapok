# Phase 3: Club Section Design

**Date:** January 11, 2026
**Status:** Design Phase
**Dependencies:** Phase 1 APIs, Phase 2 patterns

## Overview

Club section showcases the community, members, projects, and social proof. This document specifies all pages, components, layouts, and interactions for the Club section.

---

## Page 1: `/club` - Club Landing Page

### Purpose
Community showcase and engagement hub. Highlight members, projects, events, and success stories.

### Route Configuration
```typescript
// src/app/club/page.tsx
export const metadata = {
  title: 'Club - Comunidad Web3 | Frutero Club',
  description: 'Conoce a nuestra comunidad de desarrolladores Web3. Explora portfolios, proyectos destacados, y eventos de la comunidad.',
}
```

### Layout Structure

```
┌─────────────────────────────────────┐
│         Navbar (shared)             │
├─────────────────────────────────────┤
│                                     │
│  Hero Section                       │
│  - Headline                         │
│  - Community stats                  │
│  - CTA Button                       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Member Directory Preview           │
│  - Top 12 members                   │
│  - Filter preview                   │
│  - "Ver todos" CTA → /directory     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Projects Showcase Preview          │
│  - Top 6 projects                   │
│  - Skill tags                       │
│  - "Ver todos" CTA → /club/projects │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Event Calendar Preview             │
│  - Upcoming 3 events                │
│  - Date, title, type                │
│  - "Ver calendario" → /club/calendar│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Success Stories                    │
│  - 3 featured testimonials          │
│  - Member achievements              │
│                                     │
└─────────────────────────────────────┘
```

### Components Used

1. **ClubHero** (new)
   - Props: `stats { totalMembers, totalProjects, totalEarnings }`
   - Headline: "Construye tu carrera en Web3 con Frutero Club"
   - Stats display with visual appeal
   - CTA: "Únete al Club" (auth button)

2. **MemberDirectoryPreview** (new)
   - Props: `members: DirectoryProfile[], limit: number`
   - Reuses directory card components
   - Shows top 12 most active members
   - CTA: "Ver todos los miembros" → `/directory`

3. **ProjectsShowcasePreview** (new)
   - Props: `projects: PublicProject[], limit: number`
   - Grid of top 6 projects
   - ProjectCard component
   - CTA: "Ver todos los proyectos" → `/club/projects`

4. **EventCalendarPreview** (new)
   - Props: `events: Event[], limit: number`
   - List of upcoming 3 events
   - EventCard component
   - CTA: "Ver calendario completo" → `/club/calendar`

5. **SuccessStories** (new)
   - Props: `stories: Story[]`
   - Testimonial cards
   - Member highlights
   - Before/after stats

### Data Fetching

```typescript
export default function ClubPage() {
  const { data: directoryData } = useDirectory({
    limit: 12,
    // TODO: Add sorting by activity/reputation
  })

  const { data: projectsData } = usePublicProjects({
    limit: 6,
    // TODO: Add featured/trending filter
  })

  const { data: sessionsData } = usePublicSessions({
    upcoming: true,
    limit: 3,
  })

  const { data: activitiesData } = usePublicActivities({
    status: 'active',
    limit: 3,
  })

  // Merge sessions and activities into events
  const events = useMemo(() => {
    const sessionEvents = (sessionsData?.sessions || []).map(s => ({
      id: s.id,
      type: 'session' as const,
      title: s.title,
      date: s.scheduledAt,
      description: s.description,
    }))

    const activityEvents = (activitiesData?.activities || []).map(a => ({
      id: a.id,
      type: 'activity' as const,
      title: a.title,
      date: a.createdAt, // Or deadline if available
      description: a.description,
    }))

    return [...sessionEvents, ...activityEvents]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
  }, [sessionsData, activitiesData])

  // Calculate stats
  const stats = {
    totalMembers: directoryData?.pagination.total || 0,
    totalProjects: projectsData?.meta?.pagination.total || 0,
    totalEarnings: 0, // TODO: Add stats API
  }

  // Success stories (hardcoded for now)
  const stories: Story[] = [
    {
      id: '1',
      memberName: 'María García',
      memberAvatar: '/avatars/maria.jpg',
      before: 'Estudiante de ingeniería',
      after: 'Desarrolladora Web3 en startup',
      testimonial: 'Frutero Club me dio las herramientas y la comunidad...',
      earnings: '$5,000',
      projectsCompleted: 12,
    },
    // More stories...
  ]

  return (
    <PageWrapper>
      <ClubHero stats={stats} />
      <MemberDirectoryPreview members={directoryData?.profiles || []} limit={12} />
      <ProjectsShowcasePreview projects={projectsData?.projects || []} limit={6} />
      <EventCalendarPreview events={events} limit={3} />
      <SuccessStories stories={stories} />
    </PageWrapper>
  )
}
```

### Responsive Behavior
- Mobile: Single column, stacked sections
- Tablet: 2-column grids for members/projects
- Desktop: 3-column grids for members, 2-column for projects

### Loading States
- Skeleton loaders for each section
- Progressive loading (hero → members → projects → events → stories)

---

## Page 2: `/club/projects` - Projects Showcase

### Purpose
Browse all public projects with filtering and search.

### Route Configuration
```typescript
// src/app/club/projects/page.tsx
export const metadata = {
  title: 'Proyectos - Club | Frutero Club',
  description: 'Explora proyectos destacados de nuestra comunidad. Portfolios, dApps, y creaciones Web3.',
}
```

### Layout Structure

```
┌─────────────────────────────────────┐
│  Page Header                        │
│  - Title: "Proyectos de la Comunidad"│
│  - Description                      │
├─────────────────────────────────────┤
│  Filters Card                       │
│  - Learning track filter            │
│  - Skills filter (multi-select)     │
│  - Search input                     │
├─────────────────────────────────────┤
│  Projects Grid                      │
│  - All public projects              │
│  - Project cards                    │
│  - Pagination                       │
│  - Click → /portfolio/[id]          │
└─────────────────────────────────────┘
```

### Components Used

1. **ProjectCard** (new)
2. **Filters** (new inline component)
3. **Pagination** (shadcn/ui)

### ProjectCard Component Spec

```typescript
interface ProjectCardProps {
  project: {
    id: string
    title: string
    description: string
    imageUrl: string | null
    username: string
    avatarUrl: string | null
    skills: Array<{
      id: string
      name: string
      category: string
    }>
    createdAt: string
  }
  onClick: (id: string) => void
}

// Visual structure:
┌──────────────────────────────┐
│  Project Image               │
│  (16:9 aspect ratio)         │
├──────────────────────────────┤
│  Project Title               │
│                              │
│  Description (3 lines max)   │
│                              │
│  [Skill] [Skill] [Skill]     │
│                              │
│  👤 @username                │
└──────────────────────────────┘
```

### Data Fetching

```typescript
export default function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilters>({
    learningTrack: undefined,
    skills: [],
    search: '',
    page: 1,
    limit: 20,
  })

  const { data, isLoading } = usePublicProjects(filters)

  // Fetch skills for filter dropdown
  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkills, // TODO: Create skills service
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1>Proyectos de la Comunidad</h1>
          <p>Explora las creaciones de nuestros miembros</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Select
                value={filters.learningTrack || 'all'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    learningTrack: value === 'all' ? undefined : value as LearningTrack,
                  })
                }
              >
                <SelectItem value="all">Todas las áreas</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="crypto">Crypto/DeFi</SelectItem>
                <SelectItem value="privacy">Privacy</SelectItem>
              </Select>

              <MultiSelect
                options={skillsData?.skills.map(s => ({
                  value: s.id,
                  label: s.name,
                })) || []}
                selected={filters.skills}
                onChange={(skills) => setFilters({ ...filters, skills })}
                placeholder="Selecciona habilidades..."
              />

              <Input
                placeholder="Buscar proyectos..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <ProjectsGridSkeleton />
        ) : data?.projects.length === 0 ? (
          <EmptyState message="No se encontraron proyectos" />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data?.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={(id) => router.push(`/portfolio/${id}`)}
                />
              ))}
            </div>

            {data?.meta && (
              <Pagination
                currentPage={filters.page}
                totalPages={data.meta.pagination.totalPages}
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            )}
          </>
        )}
      </div>
    </PageWrapper>
  )
}
```

### Notes
- Project detail pages already exist at `/portfolio/[id]` (reuse)
- Skills filter uses multi-select dropdown (new component)
- Image handling: Next.js Image with fallback for missing images

---

## Page 3: `/club/calendar` - Event Calendar

### Purpose
Calendar view of all upcoming sessions, activities, and community events.

### Route Configuration
```typescript
// src/app/club/calendar/page.tsx
export const metadata = {
  title: 'Calendario - Club | Frutero Club',
  description: 'Calendario de eventos de la comunidad. Sesiones en vivo, workshops, y actividades especiales.',
}
```

### Layout Structure

```
┌─────────────────────────────────────┐
│  Page Header                        │
│  - Title: "Calendario de Eventos"   │
│  - Description                      │
├─────────────────────────────────────┤
│  View Toggle                        │
│  [Month] [Week] [List]              │
├─────────────────────────────────────┤
│  Filters Card                       │
│  - Event type (session/activity/all)│
│  - Date range picker                │
├─────────────────────────────────────┤
│  Calendar View                      │
│  - Calendar component (month/week)  │
│  OR                                 │
│  - List view (upcoming events)      │
└─────────────────────────────────────┘
```

### Components Used

1. **CalendarView** (new)
   - Props: `events: Event[], view: 'month' | 'week' | 'list'`
   - Uses external calendar library or custom implementation
   - Event click → detail modal or page

2. **EventCard** (new)
   - Props: `event: Event`
   - Display: date badge, title, type badge, description

3. **Filters** (new inline component)

### EventCard Component Spec

```typescript
interface EventCardProps {
  event: {
    id: string
    type: 'session' | 'activity'
    title: string
    description: string | null
    date: string // ISO 8601
    programName?: string | null
  }
  onClick: (id: string, type: 'session' | 'activity') => void
}

// Visual structure:
┌─────────────────────────────────┐
│ [Date Badge]  [Type Badge]      │
│                                 │
│ Event Title                     │
│                                 │
│ Description (2 lines max)       │
│                                 │
│ 📅 Program Name (if linked)     │
│                                 │
│ "Ver detalles" →                │
└─────────────────────────────────┘
```

### Calendar Library Options

**Option 1: react-big-calendar**
- Pros: Feature-rich, customizable
- Cons: Larger bundle size

**Option 2: Custom Implementation**
- Pros: Lightweight, full control
- Cons: More dev time

**Recommendation:** Start with list view (Phase 1), add calendar view later (Phase 2)

### Data Fetching

```typescript
export default function CalendarPage() {
  const [view, setView] = useState<'month' | 'week' | 'list'>('list')
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: {
      start: new Date(),
      end: addMonths(new Date(), 3), // Next 3 months
    },
  })

  // Fetch sessions
  const { data: sessionsData } = usePublicSessions({
    upcoming: true,
    // TODO: Add date range filter to API
  })

  // Fetch activities
  const { data: activitiesData } = usePublicActivities({
    status: 'active',
    // TODO: Add date range filter to API
  })

  // Merge and filter events
  const events = useMemo(() => {
    let allEvents: Event[] = []

    if (filters.type === 'all' || filters.type === 'session') {
      const sessionEvents = (sessionsData?.sessions || []).map(s => ({
        id: s.id,
        type: 'session' as const,
        title: s.title,
        description: s.description,
        date: s.scheduledAt,
        programName: s.programName,
      }))
      allEvents = [...allEvents, ...sessionEvents]
    }

    if (filters.type === 'all' || filters.type === 'activity') {
      const activityEvents = (activitiesData?.activities || []).map(a => ({
        id: a.id,
        type: 'activity' as const,
        title: a.title,
        description: a.description,
        date: a.createdAt, // Or deadline if available
        programName: null,
      }))
      allEvents = [...allEvents, ...activityEvents]
    }

    // Filter by date range
    return allEvents
      .filter(e => {
        const eventDate = new Date(e.date)
        return eventDate >= filters.dateRange.start && eventDate <= filters.dateRange.end
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [sessionsData, activitiesData, filters])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Calendario de Eventos</h1>
            <p>Sesiones, workshops, y actividades de la comunidad</p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              onClick={() => setView('month')}
              disabled // Phase 2
            >
              Mes
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              onClick={() => setView('week')}
              disabled // Phase 2
            >
              Semana
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
            >
              Lista
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectItem value="all">Todos los eventos</SelectItem>
                <SelectItem value="session">Solo sesiones</SelectItem>
                <SelectItem value="activity">Solo actividades</SelectItem>
              </Select>

              {/* Date range picker - Phase 2 */}
              <div className="text-sm text-muted-foreground">
                Mostrando próximos 3 meses
              </div>
            </div>
          </CardContent>
        </Card>

        {view === 'list' ? (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard
                key={`${event.type}-${event.id}`}
                event={event}
                onClick={(id, type) => {
                  if (type === 'session') {
                    router.push(`/jam/sessions/${id}`)
                  } else {
                    router.push(`/activities/${id}`)
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground space-y-2">
              <p>Vista de calendario próximamente</p>
              <p className="text-sm">Por ahora, usa la vista de lista</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
```

### Notes
- Start with list view only (simpler implementation)
- Add calendar view in Phase 2 (optional enhancement)
- Date range filtering can be done client-side initially
- Consider pagination for list view if events exceed 50

---

## Component Specifications

### File Structure

```
src/components/club/
├── club-hero.tsx                     # Hero section with stats
├── member-directory-preview.tsx      # Top 12 members preview
├── projects-showcase-preview.tsx     # Top 6 projects preview
├── project-card.tsx                  # Individual project card
├── event-calendar-preview.tsx        # Upcoming 3 events preview
├── event-card.tsx                    # Individual event card
├── success-stories.tsx               # Testimonials section
├── calendar-view.tsx                 # Calendar component (Phase 2)
└── multi-select.tsx                  # Multi-select dropdown (reusable)
```

### Shared Styles and Patterns

**Project Card Styles:**
```css
/* Image container */
aspect-video overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800

/* Card hover */
transition-shadow hover:shadow-lg cursor-pointer

/* Skill badges */
bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-full
```

**Event Type Badge Colors:**
- Session: `bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`
- Activity: `bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`

**Date Badge:**
```tsx
<Badge variant="outline" className="text-xs">
  {format(new Date(date), 'MMM dd, yyyy', { locale: es })}
</Badge>
```

**Success Story Card:**
```
┌─────────────────────────────────┐
│  [Avatar]  Member Name          │
│                                 │
│  "Testimonial quote..."         │
│                                 │
│  Before: Role                   │
│  After: Role                    │
│                                 │
│  💰 $X earned  |  📦 Y projects │
└─────────────────────────────────┘
```

---

## Reusable Components

### MultiSelect Component

```typescript
interface MultiSelectProps {
  options: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  maxDisplay?: number // Show "X selected" after this many
}

// Implementation:
// - Use shadcn/ui Select + Checkbox pattern
// - Display selected count if > maxDisplay
// - Clear all button
// - Search within options
```

### EmptyState Component

```typescript
interface EmptyStateProps {
  message: string
  submessage?: string
  action?: {
    label: string
    onClick: () => void
  }
}

// Visual:
┌─────────────────────────────────┐
│          [Icon]                 │
│                                 │
│  Message                        │
│  Submessage                     │
│                                 │
│  [Action Button]                │
└─────────────────────────────────┘
```

---

## Directory Page Strategy

**Reuse Existing `/directory` Page:**
- Already implemented with full filtering
- Member cards with all required data
- Pagination and search functional
- No need to rebuild

**Strategy:**
- Link `/club/directory` → redirect to `/directory`
- OR: Display directory at `/club` and link "Ver todos" to `/directory`
- Maintain single source of truth

**Decision:** Redirect `/club/directory` → `/directory` (cleaner URL structure)

---

## Responsive Breakpoints

- **Mobile (< 640px):** 1 column for all grids
- **Tablet (640px - 1024px):** 2 columns for members/projects
- **Desktop (> 1024px):** 3 columns for members, 2-3 for projects

---

## Loading States

**Hero Skeleton:**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-12 bg-gray-200 rounded w-2/3" />
  <div className="h-6 bg-gray-200 rounded w-1/2" />
  <div className="flex gap-8">
    <div className="h-16 bg-gray-200 rounded w-32" />
    <div className="h-16 bg-gray-200 rounded w-32" />
    <div className="h-16 bg-gray-200 rounded w-32" />
  </div>
</div>
```

**Project Card Skeleton:**
```tsx
<Card className="animate-pulse">
  <div className="aspect-video bg-gray-200" />
  <CardContent className="space-y-2 pt-4">
    <div className="h-6 bg-gray-200 rounded" />
    <div className="h-4 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </CardContent>
</Card>
```

Use `<Suspense>` boundaries around data-dependent sections.

---

## Error States

**Empty Projects:**
```tsx
<EmptyState
  message="No se encontraron proyectos"
  submessage="Ajusta los filtros o vuelve más tarde"
  action={{
    label: 'Limpiar filtros',
    onClick: () => setFilters(defaultFilters),
  }}
/>
```

**API Errors:**
```tsx
<Card className="border-destructive">
  <CardContent className="py-8 text-center space-y-4">
    <p className="text-destructive">Error al cargar proyectos</p>
    <Button onClick={refetch} variant="outline">
      Reintentar
    </Button>
  </CardContent>
</Card>
```

---

## SEO Considerations

1. **Static Meta Tags:**
   - Club landing: Generic community description
   - Projects page: Showcase focus
   - Calendar page: Events focus

2. **Semantic HTML:**
   - Use `<article>` for project/event cards
   - Use `<time>` for dates
   - Proper heading hierarchy (h1 → h2 → h3)

3. **Open Graph Tags:**
   - Add OG images for social sharing
   - Include OG:type as "website"

---

## Accessibility

1. **Keyboard Navigation:**
   - All cards focusable and clickable
   - Tab order logical (hero → sections → cards)

2. **Screen Readers:**
   - Image alt text descriptive
   - "View details" aria-labels include item name
   - Loading states announced

3. **Color Contrast:**
   - All text meets WCAG AA standards
   - Badge colors have sufficient contrast
   - Dark mode fully supported

---

## Performance Optimization

1. **Image Optimization:**
   - Next.js `<Image>` for all project images
   - Blur placeholders during load
   - Lazy loading for below-fold images

2. **Code Splitting:**
   - Lazy load success stories section
   - Dynamic import for calendar view (Phase 2)

3. **Data Fetching:**
   - Parallel queries for independent data
   - React Query caching (5min staleTime)
   - Prefetch project details on card hover

---

## Testing Checklist

### Functionality
- [ ] All sections load on landing page
- [ ] Member preview links to directory correctly
- [ ] Project cards navigate to portfolio pages
- [ ] Filters work on projects page
- [ ] Events merge correctly (sessions + activities)
- [ ] Success stories display properly

### Responsive
- [ ] Mobile: 1 column layouts work
- [ ] Tablet: 2 column layouts work
- [ ] Desktop: 3 column layouts work
- [ ] Images scale appropriately

### Accessibility
- [ ] Keyboard navigation complete
- [ ] Screen reader friendly
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible

### Performance
- [ ] Images load optimally
- [ ] No layout shift
- [ ] API calls cached
- [ ] Page loads < 2s on 3G

---

## Implementation Priority

1. **MVP (Launch Phase):**
   1. `/club` landing page
   2. `/club/projects` page
   3. `/club/calendar` (list view only)

2. **Enhancement Phase:**
   - Success stories with real data (API endpoint)
   - Calendar month/week views
   - Advanced project filtering
   - Featured projects algorithm

3. **Future Enhancements:**
   - Project upvoting/likes
   - Calendar export (iCal)
   - Member reputation system
   - Featured member spotlight rotation

---

## Dependencies

**Phase 1 Must Be Complete:**
- ✅ API endpoints (`/api/projects`)
- ✅ Services (`services/projects.ts`)
- ✅ Hooks (`hooks/use-projects.ts`)
- ✅ Type definitions

**External Dependencies:**
- `date-fns` for date formatting (existing)
- `date-fns/locale/es` for Spanish dates (existing)
- Optional: `react-big-calendar` (Phase 2 - calendar view)

---

## Success Stories Data Structure

### Initial Approach: Hardcoded
```typescript
interface Story {
  id: string
  memberName: string
  memberAvatar: string
  before: string // Previous role
  after: string // Current role
  testimonial: string // Quote (200 chars max)
  earnings: string // e.g., "$5,000"
  projectsCompleted: number
}

// Store in constants file
const SUCCESS_STORIES: Story[] = [
  {
    id: '1',
    memberName: 'María García',
    memberAvatar: '/images/success-stories/maria.jpg',
    before: 'Estudiante de ingeniería',
    after: 'Desarrolladora Web3 en startup',
    testimonial: 'Frutero Club me dio las herramientas y la comunidad necesaria para hacer la transición a Web3. En 6 meses pasé de cero experiencia a mi primer trabajo.',
    earnings: '$5,000',
    projectsCompleted: 12,
  },
  // Add 2-3 more stories
]
```

### Future: Database-Backed
- Add `success_stories` table
- Admin UI for managing stories
- User opt-in for featuring
- Automatic stat computation

---

## Content Guidelines

### Success Stories
- **Length:** Testimonial max 200 characters
- **Tone:** Inspiring but authentic
- **Stats:** Real numbers (earnings, projects)
- **Images:** Professional headshots preferred

### Project Descriptions
- **Length:** 150-200 characters (enforced in project creation)
- **Tone:** Technical but accessible
- **Required:** Tech stack tags

### Event Descriptions
- **Length:** 100-150 characters
- **Tone:** Clear and action-oriented
- **Required:** Date, time, type

---

## Next Steps After Completion

1. Content creation for success stories
2. User testing with real projects
3. Performance profiling
4. SEO audit and optimization
5. Analytics integration
6. Launch and monitor

---

## Final Notes

- Club section emphasizes **community and social proof**
- Reuse existing components/pages wherever possible
- Focus on **visual appeal** and **member engagement**
- Success stories are **critical for conversion**
- Calendar view can be **phased** (list first, calendar later)
