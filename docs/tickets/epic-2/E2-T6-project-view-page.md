# E2-T6: Individual Project View Page

**Epic:** Epic 2 - Portfolio Showcase
**Story Points:** 3
**Status:** 🔴 Not Started
**Assignee:** Frontend Developer
**Dependencies:** E2-T1 (Project API), E2-T2 (Project structure)
**Priority:** High (Essential for portfolio showcase)

---

## Objective

Create a public-facing project detail page where users can view individual projects with full information, media, and skills.

---

## User Story

**As a** visitor or developer
**I want to** view detailed information about a specific project
**So that** I can understand the project's scope, technologies used, and see evidence of the developer's work

---

## Acceptance Criteria

### Project View Page
- [ ] Public route at `/portfolio/[id]` (accessible by anyone)
- [ ] Owner sees "Edit Project" button (authenticated)
- [ ] Increment view count on page load (anonymous tracking)
- [ ] 404 page for non-existent or deleted projects
- [ ] Draft projects only visible to owner
- [ ] Mobile responsive layout

### Project Information Display
- [ ] Project logo (large, prominent)
- [ ] Project title
- [ ] Project description (full 280 chars)
- [ ] Project type badge (personal/bootcamp/hackathon/work-related/freelance/bounty)
- [ ] Project status badge (draft/wip/completed/archived)
- [ ] Created date and last updated date
- [ ] View count display

### Links Section
- [ ] Repository URL with GitHub/GitLab icon
- [ ] Live demo URL with external link icon
- [ ] Video URL with play icon (embedded or link)
- [ ] All links open in new tab with security attributes

### Skills Section
- [ ] Display all linked skills as badges
- [ ] Skills clickable (future: filter directory by skill)
- [ ] Skill categories visually grouped (language/framework/tool/blockchain)

### Images/Media
- [ ] Project images gallery (up to 5 images from E2-T3)
- [ ] Image lightbox/modal for full-screen view
- [ ] Responsive image grid layout
- [ ] Video embed support (YouTube, Vimeo)

### Owner Actions
- [ ] "Edit Project" button (visible to owner only)
- [ ] "Delete Project" button (visible to owner only, with confirmation)
- [ ] "Publish/Unpublish" toggle for draft projects

### SEO & Sharing
- [ ] Open Graph meta tags (title, description, image)
- [ ] Twitter Card meta tags
- [ ] Canonical URL
- [ ] Structured data (JSON-LD) for projects

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Portfolio                    [Edit Project]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  DeFi Yield Aggregator                   │
│  │  LOGO    │  [Completed] [Work-related]               │
│  │  IMAGE   │                                            │
│  └──────────┘  Built a multi-chain yield farming...    │
│                 (full description)                       │
│                                                          │
│  📊 3,421 views • Created Dec 15, 2024                  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  🔗 Links                                               │
│  [GitHub Repo] [Live Demo] [Video Demo]                │
├─────────────────────────────────────────────────────────┤
│  🏷️ Technologies Used                                  │
│  [Solidity] [React] [TypeScript] [Ethers.js]           │
│  [Hardhat] [Next.js]                                    │
├─────────────────────────────────────────────────────────┤
│  🖼️ Project Images                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                     │
│  │ IMG │ │ IMG │ │ IMG │ │ IMG │                     │
│  └─────┘ └─────┘ └─────┘ └─────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### File Structure
```
src/
├── app/
│   └── portfolio/
│       └── [id]/
│           └── page.tsx              # Individual project view
├── components/
│   └── portfolio/
│       ├── project-header.tsx        # Title, badges, owner actions
│       ├── project-links.tsx         # Repository, demo, video links
│       ├── project-skills.tsx        # Skills badges display
│       ├── project-images.tsx        # Image gallery
│       └── image-lightbox.tsx        # Full-screen image viewer
├── services/
│   └── projects.ts                   # Add fetchProject(id) service
└── hooks/
    └── use-projects.ts               # Add useProject(id) hook
```

### Page Component

```typescript
// src/app/portfolio/[id]/page.tsx
import { notFound } from 'next/navigation';
import { ProjectHeader } from '@/components/portfolio/project-header';
import { ProjectLinks } from '@/components/portfolio/project-links';
import { ProjectSkills } from '@/components/portfolio/project-skills';
import { ProjectImages } from '@/components/portfolio/project-images';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch project server-side for SEO
  const project = await fetchProjectForSSR(id);

  if (!project) {
    notFound();
  }

  return (
    <PageWrapper>
      <ProjectHeader project={project} />
      <ProjectLinks
        repositoryUrl={project.repositoryUrl}
        liveUrl={project.liveUrl}
        videoUrl={project.videoUrl}
      />
      <ProjectSkills skills={project.skills} />
      {project.imageUrls.length > 0 && (
        <ProjectImages images={project.imageUrls} />
      )}
    </PageWrapper>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await fetchProjectForSSR(id);

  if (!project) return {};

  return {
    title: `${project.title} - Poktapok Portfolio`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.logoUrl || '/default-project.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.logoUrl || '/default-project.png'],
    },
  };
}
```

---

## Service Layer

```typescript
// src/services/projects.ts

// Add to existing services
export async function fetchProject(id: string): Promise<GetProjectResponse> {
  return apiFetch<GetProjectResponse>(`/api/projects/${id}`);
}

// Server-side fetch for SSR (no auth needed for public projects)
export async function fetchProjectForSSR(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${id}`, {
      cache: 'no-store', // Always fresh data
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data.project;
  } catch (error) {
    return null;
  }
}
```

---

## Hooks

```typescript
// src/hooks/use-projects.ts

// Add to existing hooks
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => fetchProject(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## View Count Tracking

### Client-Side (Anonymous)
```typescript
// Increment view count on page mount (once per session)
useEffect(() => {
  const viewKey = `project-viewed-${id}`;
  const hasViewed = sessionStorage.getItem(viewKey);

  if (!hasViewed) {
    incrementViewCount(id);
    sessionStorage.setItem(viewKey, 'true');
  }
}, [id]);

async function incrementViewCount(projectId: string) {
  await fetch(`/api/projects/${projectId}/view`, {
    method: 'POST',
  });
}
```

### API Route
```typescript
// src/app/api/projects/[id]/view/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Increment view count (no auth required)
  await db
    .update(projects)
    .set({ viewCount: sql`${projects.viewCount} + 1` })
    .where(eq(projects.id, id));

  return apiSuccess({ viewCount: true });
}
```

---

## Draft Project Access Control

```typescript
// Server-side check in page.tsx
async function fetchProjectForSSR(id: string) {
  const project = await fetchProject(id);

  // If draft, check ownership
  if (project.projectStatus === 'draft') {
    const session = await getServerSession();

    if (!session || session.user.id !== project.userId) {
      return null; // Return 404 for non-owners
    }
  }

  return project;
}
```

---

## Image Lightbox

```typescript
// src/components/portfolio/image-lightbox.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function ImageLightbox({ images, initialIndex = 0 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isOpen, setIsOpen] = useState(false);

  const goToNext = () => setCurrentIndex((i) => (i + 1) % images.length);
  const goToPrevious = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-7xl">
        <div className="relative">
          <img src={images[currentIndex]} alt="" className="w-full h-auto" />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2">
                <ChevronLeft />
              </button>
              <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2">
                <ChevronRight />
              </button>
            </>
          )}

          {/* Close button */}
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
            <X />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Testing Checklist

### Access Control
- [ ] Public project visible to anyone
- [ ] Draft project only visible to owner
- [ ] Non-existent project returns 404
- [ ] Deleted project returns 404

### Content Display
- [ ] All project information displayed correctly
- [ ] Badges show correct project type and status
- [ ] Skills displayed with correct categories
- [ ] Links open in new tab with security attributes
- [ ] View count increments once per session

### Owner Actions
- [ ] Edit button visible to owner only
- [ ] Delete button visible to owner only
- [ ] Edit button redirects to edit page
- [ ] Delete requires confirmation

### Media
- [ ] Images display in responsive grid
- [ ] Image lightbox opens on click
- [ ] Lightbox navigation works (prev/next)
- [ ] Video embeds work correctly

### SEO
- [ ] Meta tags present (OG, Twitter Card)
- [ ] Page title includes project name
- [ ] Canonical URL set correctly
- [ ] Structured data valid (JSON-LD)

### Mobile
- [ ] Layout responsive on mobile
- [ ] Touch gestures work in lightbox
- [ ] Links easily tappable
- [ ] Images scale correctly

---

## Success Criteria

- ✅ Projects viewable by anyone via direct link
- ✅ All project information displayed clearly
- ✅ Owner can edit/delete from view page
- ✅ Draft projects only visible to owner
- ✅ View count tracking works
- ✅ Images displayed with lightbox
- ✅ SEO meta tags present
- ✅ Mobile responsive

---

## Notes

- View count is anonymous (no user tracking)
- Draft projects return 404 to non-owners (not 403 to avoid revealing existence)
- Image gallery from E2-T3 (will be empty until E2-T3 complete)
- Skills clickable for future directory filtering (E2-T5)
- Video embeds support YouTube, Vimeo URLs

---

**Estimated Time:** 2 days
**Complexity:** Medium (SSR + SEO + access control)
**Priority:** High (Essential for portfolio showcase)
