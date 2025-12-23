# E1-T3: Public Directory Page

**Epic:** Epic 1 - Talent Directory
**Story Points:** 5
**Status:** 🟢 Completed
**Assignee:** Frontend Developer
**Dependencies:** E1-T2 (Profile Creation Flow)
**Completed:** 2025-12-22

---

## Objective

Build browsable directory with search, filters, and pagination.

---

## Tasks

1. [ ] Create directory page with card grid layout
2. [ ] Implement search bar (username, display name, bio)
3. [ ] Add filters (learning track, availability, location)
4. [ ] Build pagination (24 profiles per page)
5. [ ] Optimize query performance (indexed searches)
6. [ ] Add skeleton loaders for better UX
7. [ ] Implement infinite scroll on mobile

---

## Layout Specifications

### Desktop (≥768px)
- 3-column card grid
- Sidebar filters (left or right)
- Search bar at top
- 24 profiles per page
- "Load More" button pagination

### Mobile (<768px)
- 1-column stacked cards
- Collapsible filter drawer
- Fixed search bar
- Infinite scroll
- 12 profiles per load

---

## Profile Card Design

Each card should display:

### Always Visible
1. **Avatar** (generated from username or uploaded)
   - Fallback to initials if no avatar
   - Circular, 64px on desktop, 48px on mobile

2. **Username + Display Name**
   - Username: `@carlos_dev` (gray, smaller)
   - Display name: `Carlos Rodriguez` (bold, larger)

3. **Bio** (truncated to 100 chars)
   - Add "..." if longer
   - Click to expand or view full profile

4. **Location** (city + country flag emoji)
   - Format: `Buenos Aires 🇦🇷`
   - Flag emoji from country code

5. **Learning Track Badge**
   - Colored pill: Code: AI (blue), Crypto/DeFi (purple), Privacy (green)
   - Icon + text

6. **Availability Indicator**
   - Colored dot: Learning (🟡), Building (🔵), Open to Bounties (🟢)
   - Text label

### On Hover (Desktop Only)
- Subtle card elevation
- "View Profile" button appears
- Slight scale animation

---

## Files to Create/Modify

### New Files
- `src/app/directory/page.tsx` - Directory page
- `src/components/directory/profile-card.tsx` - Profile card component
- `src/components/directory/filters.tsx` - Filter sidebar/drawer
- `src/components/directory/search-bar.tsx` - Search input
- `src/components/directory/directory-grid.tsx` - Card grid container
- `src/components/directory/skeleton-card.tsx` - Loading skeleton
- `src/lib/db/queries/profiles.ts` - `getDirectoryProfiles()` query
- `src/app/api/directory/route.ts` - GET /api/directory with filters
- `src/lib/hooks/useDirectoryFilters.ts` - Filter state management

---

## Implementation Details

### 1. Directory Query Function (`src/lib/db/queries/profiles.ts`)

```typescript
import { db } from '@/lib/db';
import { profiles, users } from '@/lib/db/schema';
import { and, or, like, eq, desc } from 'drizzle-orm';

export type DirectoryFilters = {
  search?: string;
  learningTrack?: 'ai' | 'crypto' | 'privacy';
  availabilityStatus?: 'learning' | 'building' | 'open-to-bounties';
  country?: string;
  page?: number;
  limit?: number;
};

export async function getDirectoryProfiles(filters: DirectoryFilters) {
  const { search, learningTrack, availabilityStatus, country, page = 1, limit = 24 } = filters;

  const conditions = [];

  // Visibility: only public profiles
  conditions.push(eq(profiles.visibility, 'public'));

  // Search
  if (search) {
    conditions.push(
      or(
        like(profiles.username, `%${search}%`),
        like(profiles.displayName, `%${search}%`),
        like(profiles.bio, `%${search}%`)
      )
    );
  }

  // Filters
  if (learningTrack) {
    conditions.push(eq(profiles.learningTrack, learningTrack));
  }
  if (availabilityStatus) {
    conditions.push(eq(profiles.availabilityStatus, availabilityStatus));
  }
  if (country) {
    conditions.push(eq(profiles.country, country));
  }

  const offset = (page - 1) * limit;

  const results = await db
    .select()
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(profiles.createdAt))
    .limit(limit)
    .offset(offset);

  return results.map((r) => r.profiles);
}
```

### 2. API Endpoint (`src/app/api/directory/route.ts`)

```typescript
import { NextRequest } from 'next/server';
import { getDirectoryProfiles } from '@/lib/db/queries/profiles';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters = {
    search: searchParams.get('search') || undefined,
    learningTrack: searchParams.get('track') as any,
    availabilityStatus: searchParams.get('status') as any,
    country: searchParams.get('country') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '24'),
  };

  try {
    const profiles = await getDirectoryProfiles(filters);
    return Response.json({ profiles, page: filters.page });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch directory' }, { status: 500 });
  }
}
```

### 3. Filter State Hook (`src/lib/hooks/useDirectoryFilters.ts`)

```typescript
import { useSearchParams, useRouter } from 'next/navigation';

export function useDirectoryFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete('page');

    router.push(`/directory?${params.toString()}`);
  };

  return {
    search: searchParams.get('search') || '',
    track: searchParams.get('track') || null,
    status: searchParams.get('status') || null,
    country: searchParams.get('country') || null,
    page: parseInt(searchParams.get('page') || '1'),
    updateFilter,
  };
}
```

### 4. Profile Card Component

```typescript
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function ProfileCard({ profile }) {
  const truncatedBio = profile.bio.length > 100
    ? `${profile.bio.substring(0, 100)}...`
    : profile.bio;

  return (
    <Link href={`/profile/${profile.username}`}>
      <div className="card hover:shadow-lg transition-all">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="font-bold">{profile.displayName}</h3>
            <p className="text-sm text-muted">@{profile.username}</p>
            <p className="text-sm mt-2">{truncatedBio}</p>

            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm">
                {profile.city} {getCountryFlag(profile.country)}
              </span>

              <Badge variant={getLearningTrackVariant(profile.learningTrack)}>
                {profile.learningTrack}
              </Badge>

              <AvailabilityDot status={profile.availabilityStatus} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

---

## Search & Filter Requirements

### Search Bar
- **Placeholder:** "Search by name or bio..."
- **Debounce:** 300ms delay before triggering search
- **Minimum length:** 2 characters
- **Clear button:** X icon to reset search
- **Search icon:** Magnifying glass on left

### Filters

#### Learning Track
- Radio buttons (single select)
- Options: All, Code: AI, Crypto/DeFi, Privacy
- Default: All

#### Availability Status
- Radio buttons (single select)
- Options: All, Learning, Building, Open to Bounties
- Default: All

#### Location (Country)
- Dropdown select
- Options: All, [list of countries with profiles]
- Sorted alphabetically
- Show country flags

### Filter Behavior
- Changes update URL query params
- Page resets to 1 when filter changes
- Filters persist on page refresh
- "Clear All" button resets to defaults

---

## Pagination & Performance

### Desktop Pagination
- 24 profiles per page
- Show "Load More" button at bottom
- Display: "Showing 1-24 of 156 builders"
- Button loads next page, appends to list

### Mobile Infinite Scroll
- Initial load: 12 profiles
- Intersection Observer triggers load when scrolling near bottom
- Show loading spinner while fetching
- "No more profiles" message when exhausted

### Performance Optimizations
1. **Database Indexes**
   - Index on `profiles.visibility`
   - Index on `profiles.learningTrack`
   - Index on `profiles.country`
   - Full-text index on `username`, `displayName`, `bio`

2. **Query Optimization**
   - Limit SELECT to needed fields only
   - Use prepared statements
   - Cache country list (static)

3. **Frontend Optimization**
   - Skeleton loaders during fetch
   - Image lazy loading
   - Virtual scrolling for long lists (future)

---

## Sorting Options

### Default: Recently Joined
- `ORDER BY createdAt DESC`

### Future Options (not in Epic 1)
- Alphabetical (A-Z)
- Most Active (requires activity tracking)
- Reputation Score (requires reputation system)

---

## Acceptance Criteria

- [ ] Search returns results in < 500ms (tested with 1000 profiles)
- [ ] Filters update results without full page reload
- [ ] Cards render in < 2s on 3G connection
- [ ] Pagination shows "Load More" button (infinite scroll on mobile)
- [ ] Default sort: Recently joined (newest first)
- [ ] Empty state: "No builders found" with clear filters button
- [ ] Loading state: Skeleton cards (3 on desktop, 2 on mobile)
- [ ] Mobile filters accessible via drawer/modal
- [ ] URL reflects current search/filter state
- [ ] Responsive design works on 375px to 1920px viewports

---

## Testing

### Manual Testing Checklist

```bash
# Test 1: Search Functionality
1. Type "carlos" in search bar
2. Wait 300ms
3. Should show profiles matching "carlos" in name/username/bio
4. Type "xyz12345" (unlikely match)
5. Should show "No builders found"

# Test 2: Filters
1. Select "Crypto/DeFi" learning track
2. Should show only crypto profiles
3. Select "Open to Bounties" status
4. Should show crypto profiles that are open to bounties
5. Select country "Argentina"
6. Should show subset matching all filters

# Test 3: Pagination (Desktop)
1. Load directory
2. Should show 24 profiles max
3. Scroll to bottom
4. Click "Load More"
5. Should append next 24 profiles

# Test 4: Infinite Scroll (Mobile)
1. Open on mobile (375px)
2. Should show 12 profiles
3. Scroll to 80% of page
4. Should auto-load next 12 profiles
5. Repeat until no more profiles

# Test 5: URL State
1. Apply filter: track=crypto&status=building
2. Copy URL
3. Open in new tab
4. Should show same filtered results

# Test 6: Empty States
1. Search for gibberish
2. Should show "No builders found" with clear button
3. Click clear → should reset to all profiles

# Test 7: Performance
1. Open Chrome DevTools Network tab
2. Set throttling to "Fast 3G"
3. Load directory
4. Cards should appear in < 2s
5. Search should respond in < 500ms
```

### API Testing

```bash
# Test basic directory fetch
curl "http://localhost:3000/api/directory"

# Test with filters
curl "http://localhost:3000/api/directory?track=crypto&status=building&country=AR"

# Test search
curl "http://localhost:3000/api/directory?search=carlos"

# Test pagination
curl "http://localhost:3000/api/directory?page=2&limit=24"
```

---

## Dependencies

### Before Starting
- [ ] E1-T2: Profile Creation Flow completed
- [ ] At least 10 test profiles in database
- [ ] Database indexes created

### Blocks
- E1-T4: Individual Profile Page (directory links to profiles)

---

## Notes & Questions

### Design Decisions
- **Why 24 profiles per page?** Divisible by 2, 3, 4, 6 (responsive grid flexibility)
- **Why infinite scroll on mobile?** Better UX for touch devices, less button tapping
- **Why truncate bio at 100 chars?** Keeps cards consistent height, encourages profile clicks

### Technical Notes
- Use React Query for data fetching and caching
- Implement optimistic UI updates where possible
- Consider using Algolia for search in future (full-text search at scale)

### Questions
- [ ] Should we show profile count by filter?
  - **Decision:** Yes, show "156 builders found" after applying filters
- [ ] What if user has no avatar?
  - **Decision:** Use initials in colored circle (like GitHub)
- [ ] Should we show "New Member" badge for profiles < 7 days old?
  - **Decision:** Yes, add small "New" badge next to username

### Future Enhancements (Not in Scope)
- Advanced search (semantic, skills-based)
- "Featured" profiles section
- Map view of builder locations
- Save/bookmark profiles
- Share directory with specific filters

---

**Created:** 2025-12-20
**Last Updated:** 2025-12-22
**Status Changes:**
- 2025-12-20: Created ticket
- 2025-12-22: ✅ Completed - All features implemented and working
