# Phase 2: Jam Section Design

**Date:** January 11, 2026
**Status:** Design Phase
**Dependencies:** Phase 1 APIs, Services, Hooks

## Overview

Jam section showcases learning opportunities through programs, sessions, and activities. This document specifies all pages, components, layouts, and interactions for the Jam section.

---

## Page 1: `/jam` - Jam Landing Page

### Purpose
Central hub for learning opportunities. Showcase active programs, upcoming sessions, and featured activities.

### Route Configuration
```typescript
// src/app/jam/page.tsx
export const metadata = {
  title: 'Jam - Aprende y Gana | Frutero Club',
  description: 'Explora programas de aprendizaje, sesiones en vivo, y actividades para ganar $PULPA tokens mientras construyes tu carrera en Web3.',
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
│  - Stats (programs/sessions/rewards)│
│  - CTA Button                       │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Active Programs Grid               │
│  - All active programs              │
│  - Program cards                    │
│  - "Ver detalles" CTAs              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Upcoming Sessions Preview          │
│  - Next 6 sessions                  │
│  - Session cards                    │
│  - "Ver todas" CTA                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Featured Activities Preview        │
│  - Top 6 by reward                  │
│  - Activity cards (reuse existing)  │
│  - "Ver todas" CTA → /activities    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Mentorship CTA Section             │
│  - Placeholder for future           │
│                                     │
└─────────────────────────────────────┘
```

### Components Used

1. **JamHero** (new)
   - Props: `stats { activePrograms, upcomingSessions, totalRewardsDistributed }`
   - Headline: "Aprende, construye y gana $PULPA"
   - Stats display with icons
   - CTA: "Explora programas" → `/jam/programs`

2. **ProgramsGrid** (new)
   - Props: `programs: Program[]`
   - Grid layout: 1 col mobile, 2 col tablet, 3 col desktop
   - Uses ProgramCard component

3. **SessionsPreview** (new)
   - Props: `sessions: PublicSession[], limit: number`
   - List/grid of upcoming sessions
   - CTA: "Ver todas las sesiones" → `/jam/sessions`

4. **ActivitiesPreview** (new)
   - Props: `activities: Activity[], limit: number`
   - Reuses existing activity card styles
   - CTA: "Ver todas las actividades" → `/activities`

5. **MentorshipCTA** (new)
   - Placeholder section
   - "Solicita mentoría" headline
   - Future: form or contact link

### Data Fetching

```typescript
export default function JamPage() {
  const { data: programsData } = useActivePrograms()
  const { data: sessionsData } = usePublicSessions({
    upcoming: true,
    limit: 6,
  })
  const { data: activitiesData } = usePublicActivities({
    status: 'active',
    limit: 6,
  })

  // Calculate stats
  const stats = {
    activePrograms: programsData?.programs.length || 0,
    upcomingSessions: sessionsData?.sessions.length || 0,
    totalRewardsDistributed: 0, // TODO: Add stats API
  }

  return (
    <PageWrapper>
      <JamHero stats={stats} />
      <ProgramsGrid programs={programsData?.programs || []} />
      <SessionsPreview sessions={sessionsData?.sessions || []} limit={6} />
      <ActivitiesPreview activities={activitiesData?.activities || []} limit={6} />
      <MentorshipCTA />
    </PageWrapper>
  )
}
```

### Responsive Behavior
- Mobile: Single column, stacked sections
- Tablet: 2-column grids
- Desktop: 3-column grids for cards

### Loading States
- Skeleton loaders for each section
- Progressive loading (hero → programs → sessions → activities)

---

## Page 2: `/jam/programs` - Programs Directory

### Purpose
Browse all active programs with filtering capabilities.

### Route Configuration
```typescript
// src/app/jam/programs/page.tsx
export const metadata = {
  title: 'Programas - Jam | Frutero Club',
  description: 'Explora todos los programas de aprendizaje disponibles. Cohorts estructurados y programas abiertos para aprender Web3.',
}
```

### Layout Structure

```
┌─────────────────────────────────────┐
│  Page Header                        │
│  - Title: "Programas de Aprendizaje"│
│  - Description                      │
├─────────────────────────────────────┤
│  Filters Card                       │
│  - Type filter (all/cohort/evergreen)│
│  - Search input                     │
├─────────────────────────────────────┤
│  Programs Grid                      │
│  - All active programs              │
│  - Program cards with stats         │
│  - Click → program detail           │
└─────────────────────────────────────┘
```

### Components Used

1. **ProgramsGrid** (reuse from landing)
2. **ProgramCard** (new)
3. **Filters** (new inline component)

### ProgramCard Component Spec

```typescript
interface ProgramCardProps {
  program: {
    id: string
    name: string
    description: string
    type: 'cohort' | 'evergreen'
    stats: {
      enrollments: number
      sessions: number
      activities: number
    }
  }
  onClick: (id: string) => void
}

// Visual structure:
┌─────────────────────┐
│ Program Name        │
│ Type Badge          │
├─────────────────────┤
│ Description         │
│ (3 lines max)       │
├─────────────────────┤
│ Stats Row           │
│ 👥 X  📅 Y  ⚡ Z    │
├─────────────────────┤
│ "Ver detalles" →    │
└─────────────────────┘
```

### Data Fetching

```typescript
export default function ProgramsPage() {
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
  })

  const { data, isLoading } = useActivePrograms()

  // Filter programs locally
  const filteredPrograms = useMemo(() => {
    let result = data?.programs || []

    if (filters.type !== 'all') {
      result = result.filter(p => p.type === filters.type)
    }

    if (filters.search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    return result
  }, [data, filters])

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1>Programas de Aprendizaje</h1>
          <p>Explora cohorts estructurados y programas abiertos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({...filters, type: value})}
              >
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cohort">Cohorts</SelectItem>
                <SelectItem value="evergreen">Abiertos</SelectItem>
              </Select>

              <Input
                placeholder="Buscar programas..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <ProgramsGrid programs={filteredPrograms} />
      </div>
    </PageWrapper>
  )
}
```

---

## Page 3: `/jam/programs/[id]` - Program Detail

### Purpose
Detailed program view with two-tier access: public info for all, dashboard for enrolled users.

### Route Configuration
```typescript
// src/app/jam/programs/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  // Fetch program name for dynamic meta title
  return {
    title: `${programName} - Programas | Frutero Club`,
    description: programDescription,
  }
}
```

### Layout Structure (Two-Tier Access)

#### Unauthenticated View
```
┌─────────────────────────────────────┐
│  Program Overview                   │
│  - Name, description                │
│  - Type badge                       │
│  - Stats (enrollments, sessions)    │
├─────────────────────────────────────┤
│  Sessions List                      │
│  - Date, title, description         │
│  - No meeting URLs                  │
├─────────────────────────────────────┤
│  Activities List                    │
│  - Title, description, reward       │
│  - Difficulty badge                 │
├─────────────────────────────────────┤
│  CTA: "Únete al programa"           │
│  (Auth required)                    │
└─────────────────────────────────────┘
```

#### Authenticated + Enrolled View
```
┌─────────────────────────────────────┐
│  Program Overview (same as public)  │
├─────────────────────────────────────┤
│  Participation Dashboard            │
│  (Reuse existing components)        │
│  - ParticipationStatsCard           │
│  - PromotionProgressCard (guests)   │
├─────────────────────────────────────┤
│  Sessions List                      │
│  - WITH meeting URLs                │
│  - Attendance status                │
├─────────────────────────────────────┤
│  Activities List                    │
│  - WITH submission links            │
│  - Submission status                │
└─────────────────────────────────────┘
```

### Components Used

1. **ProgramDetailPublic** (new)
   - Props: `program, sessions, activities`
   - Always visible
   - Clean, informative layout

2. **ProgramDetailAuth** (new)
   - Props: `programId, userEnrollment`
   - Conditional wrapper
   - Shows dashboard + enhanced session/activity info

3. **ParticipationStatsCard** (existing - reuse)
4. **PromotionProgressCard** (existing - reuse)
5. **SessionsList** (new)
6. **ActivitiesList** (new)

### Data Fetching Strategy

```typescript
export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const { data: authData } = useAuth()
  const { data: publicData } = usePublicProgram(params.id)
  const { data: dashboardData } = useProgramDashboard(params.id, {
    enabled: !!authData?.isAuthenticated,
  })

  const isEnrolled = dashboardData?.enrollment !== null

  return (
    <PageWrapper>
      {/* Public view - always shown */}
      <ProgramDetailPublic
        program={publicData?.program}
        sessions={publicData?.sessions}
        activities={publicData?.activities}
        stats={publicData?.stats}
      />

      {/* Auth-only features */}
      {authData?.isAuthenticated && isEnrolled && (
        <ProgramDetailAuth
          programId={params.id}
          enrollment={dashboardData?.enrollment}
          participation={dashboardData?.participation}
        />
      )}

      {/* CTA for unauthenticated or non-enrolled */}
      {(!authData?.isAuthenticated || !isEnrolled) && (
        <Card>
          <CardContent className="text-center py-8">
            <h3>¿Listo para comenzar?</h3>
            {!authData?.isAuthenticated ? (
              <AuthButton>Únete al Club</AuthButton>
            ) : (
              <Button>Inscríbete al Programa</Button>
            )}
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  )
}
```

### SessionsList Component Spec

```typescript
interface SessionsListProps {
  sessions: Array<{
    id: string
    title: string
    description: string | null
    scheduledAt: string
    activityCount: number
    meetingUrl?: string | null // Only if enrolled
  }>
  showMeetingUrls: boolean
}

// Visual structure:
┌──────────────────────────────────┐
│ Próximas Sesiones                │
├──────────────────────────────────┤
│ [Date Badge] Session Title       │
│ Description...                   │
│ 🎯 X actividades                 │
│ [🔗 Unirse] (if meetingUrl)      │
├──────────────────────────────────┤
│ [Date Badge] Session Title       │
│ ...                              │
└──────────────────────────────────┘
```

---

## Page 4: `/jam/sessions` - Sessions Directory

### Purpose
Browse all sessions (standalone and program-linked) with filtering.

### Route Configuration
```typescript
// src/app/jam/sessions/page.tsx
export const metadata = {
  title: 'Sesiones - Jam | Frutero Club',
  description: 'Explora todas las sesiones de aprendizaje. Sesiones en vivo, workshops, y eventos especiales.',
}
```

### Layout Structure

```
┌─────────────────────────────────────┐
│  Page Header                        │
│  - Title: "Sesiones de Aprendizaje" │
│  - Description                      │
├─────────────────────────────────────┤
│  Filters Card                       │
│  - Time filter (upcoming/past/all)  │
│  - Program filter (dropdown)        │
│  - Standalone toggle                │
├─────────────────────────────────────┤
│  Sessions List/Grid                 │
│  - Session cards                    │
│  - Pagination                       │
└─────────────────────────────────────┘
```

### Components Used

1. **SessionCard** (new)
2. **Filters** (new inline component)
3. **Pagination** (shadcn/ui)

### SessionCard Component Spec

```typescript
interface SessionCardProps {
  session: {
    id: string
    title: string
    description: string | null
    scheduledAt: string
    programId: string | null
    programName: string | null
    activityCount: number
  }
  onClick: (id: string) => void
}

// Visual structure:
┌─────────────────────────────────┐
│ [Date Badge]  [Program Badge]   │
│                                 │
│ Session Title                   │
│                                 │
│ Description (3 lines max)       │
│                                 │
│ 🎯 X actividades vinculadas     │
│                                 │
│ "Ver detalles" →                │
└─────────────────────────────────┘
```

### Data Fetching

```typescript
export default function SessionsPage() {
  const [filters, setFilters] = useState({
    upcoming: true,
    programId: undefined,
    standalone: false,
    page: 1,
  })

  const { data, isLoading } = usePublicSessions(filters)
  const { data: programsData } = useActivePrograms()

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1>Sesiones de Aprendizaje</h1>
          <p>Sesiones en vivo, workshops, y eventos especiales</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Select
                value={filters.upcoming ? 'upcoming' : 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, upcoming: value === 'upcoming' })
                }
              >
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="upcoming">Próximas</SelectItem>
              </Select>

              <Select
                value={filters.programId || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, programId: value === 'all' ? undefined : value })
                }
              >
                <SelectItem value="all">Todos los programas</SelectItem>
                {programsData?.programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </Select>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={filters.standalone}
                  onCheckedChange={(checked) =>
                    setFilters({ ...filters, standalone: !!checked })
                  }
                />
                <label>Solo sesiones independientes</label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={(id) => router.push(`/jam/sessions/${id}`)}
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
      </div>
    </PageWrapper>
  )
}
```

---

## Page 5: `/jam/sessions/[id]` - Session Detail

### Purpose
Detailed session view with conditional meeting URL access.

### Route Configuration
```typescript
// src/app/jam/sessions/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `${sessionTitle} - Sesiones | Frutero Club`,
    description: sessionDescription,
  }
}
```

### Layout Structure

```
┌─────────────────────────────────────┐
│  Session Header                     │
│  - Date badge                       │
│  - Title                            │
│  - Program badge (if linked)        │
│  - Description                      │
├─────────────────────────────────────┤
│  Meeting Access (conditional)       │
│  - Meeting URL button (if access)   │
│  - OR "Enrollment required" message │
├─────────────────────────────────────┤
│  Linked Activities                  │
│  - Activity cards                   │
│  - Submission links (if enrolled)   │
└─────────────────────────────────────┘
```

### Components Used

1. **SessionDetailPublic** (new)
   - Session info display
   - Always visible

2. **SessionDetailAuth** (new)
   - Meeting URL access
   - Conditional features

3. **LinkedActivitiesList** (new)
   - Display activities
   - Conditional submission links

### Data Fetching

```typescript
export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const { data: authData } = useAuth()
  const { data: sessionData } = useSessionDetail(params.id)

  const canAccessMeeting = sessionData?.userCanAccess

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Session Info (public) */}
        <SessionDetailPublic session={sessionData?.session} />

        {/* Meeting Access (conditional) */}
        <Card>
          <CardHeader>
            <CardTitle>Acceso a la Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            {canAccessMeeting && sessionData?.session.meetingUrl ? (
              <Button asChild className="w-full">
                <a
                  href={sessionData.session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 Unirse a la Sesión
                </a>
              </Button>
            ) : authData?.isAuthenticated ? (
              <div className="text-center text-muted-foreground space-y-4">
                <p>Esta sesión requiere inscripción al programa.</p>
                {sessionData?.session.programId && (
                  <Button asChild variant="outline">
                    <Link href={`/jam/programs/${sessionData.session.programId}`}>
                      Ver Programa
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Únete al club para acceder a las sesiones
                </p>
                <AuthButton>Únete al Club</AuthButton>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Linked Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Actividades Vinculadas</CardTitle>
            <CardDescription>
              Completa estas actividades durante o después de la sesión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkedActivitiesList
              activities={sessionData?.activities || []}
              showSubmitLinks={!!authData?.isAuthenticated}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
```

---

## Component Specifications

### File Structure

```
src/components/jam/
├── jam-hero.tsx                    # Hero section with stats
├── programs-grid.tsx               # Grid layout for programs
├── program-card.tsx                # Individual program card
├── sessions-preview.tsx            # Upcoming sessions preview
├── session-card.tsx                # Individual session card
├── activities-preview.tsx          # Featured activities preview
├── mentorship-cta.tsx              # Mentorship section
├── program-detail-public.tsx       # Public program info
├── program-detail-auth.tsx         # Auth-only program features
├── sessions-list.tsx               # List of sessions
├── session-detail-public.tsx       # Public session info
├── session-detail-auth.tsx         # Auth-only session features
└── linked-activities-list.tsx      # Activities for a session
```

### Shared Styles and Patterns

**Card Hover Effect:**
```css
transition-shadow hover:shadow-lg cursor-pointer
```

**Badge Colors:**
- Cohort: `bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`
- Evergreen: `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`
- Standalone: `bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`

**Date Badge:**
```tsx
<Badge variant="outline">
  {format(new Date(scheduledAt), 'MMM dd, yyyy • HH:mm', { locale: es })}
</Badge>
```

**Stats Icons:**
- 👥 Enrollments
- 📅 Sessions
- ⚡ Activities
- 🎯 Linked items

---

## Responsive Breakpoints

- **Mobile (< 640px):** 1 column, stacked layout
- **Tablet (640px - 1024px):** 2 columns for grids
- **Desktop (> 1024px):** 3 columns for grids

---

## Loading States

**Skeleton Components:**
```tsx
// Card skeleton
<Card className="animate-pulse">
  <CardHeader className="space-y-2">
    <div className="h-6 bg-gray-200 rounded w-3/4" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  </CardContent>
</Card>
```

Use `<Suspense>` boundaries around data-dependent sections.

---

## Error States

**Empty States:**
```tsx
<div className="text-center py-12 text-muted-foreground space-y-2">
  <p>No se encontraron programas activos.</p>
  <p className="text-sm">Vuelve pronto para nuevas oportunidades.</p>
</div>
```

**Error Boundaries:**
- Catch API errors gracefully
- Display user-friendly messages
- Provide retry actions

---

## SEO Considerations

1. **Dynamic Meta Tags:**
   - Use `generateMetadata` for dynamic pages
   - Include program/session names in titles

2. **Semantic HTML:**
   - Use `<article>` for cards
   - Use `<time>` for dates
   - Proper heading hierarchy

3. **Structured Data:**
   - JSON-LD for events (sessions)
   - JSON-LD for courses (programs)

---

## Accessibility

1. **Keyboard Navigation:**
   - All interactive elements focusable
   - Logical tab order

2. **Screen Readers:**
   - Meaningful `aria-label` attributes
   - Announce loading states

3. **Color Contrast:**
   - WCAG AA compliance
   - Dark mode support

---

## Performance Optimization

1. **Code Splitting:**
   - Lazy load preview sections
   - Dynamic imports for heavy components

2. **Image Optimization:**
   - Use Next.js `<Image>` component
   - Lazy loading with blur placeholders

3. **Data Fetching:**
   - React Query caching (5min staleTime)
   - Prefetch on hover for detail pages

---

## Testing Checklist

### Functionality
- [ ] All pages load without auth
- [ ] Auth-conditional features show/hide correctly
- [ ] Filters work on sessions and programs pages
- [ ] Pagination works correctly
- [ ] Meeting URL only visible to authorized users
- [ ] Links navigate correctly

### Responsive
- [ ] Mobile layout works (1 column)
- [ ] Tablet layout works (2 columns)
- [ ] Desktop layout works (3 columns)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast passes WCAG AA

### Performance
- [ ] No layout shift during loading
- [ ] Images load optimally
- [ ] API calls cached appropriately

---

## Implementation Priority

1. **Core Pages First:**
   1. `/jam` landing
   2. `/jam/programs`
   3. `/jam/programs/[id]`

2. **Secondary Pages:**
   4. `/jam/sessions`
   5. `/jam/sessions/[id]`

3. **Polish:**
   - Mentorship CTA
   - Advanced filtering
   - Performance optimization

---

## Dependencies

**Phase 1 Must Be Complete:**
- ✅ API endpoints live
- ✅ Service functions working
- ✅ React Query hooks ready
- ✅ Type definitions added

**External Dependencies:**
- `date-fns` for date formatting
- `date-fns/locale/es` for Spanish dates
- `sonner` for toast notifications (existing)
- `lucide-react` for icons (existing)

---

## Next Steps After Completion

1. User testing with real data
2. Performance profiling
3. SEO audit
4. Analytics integration
5. Move to Phase 3 (Club section)
