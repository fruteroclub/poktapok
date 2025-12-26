# E1-T4-partial: Profile Page - Deferred Features

**Original Ticket:** [E1-T4: Individual Profile Page](../epic-1/E1-T4-profile-page.md)
**Status:** ✅ MVP Complete (5/7 tasks)
**Completion Date:** 2025-12-24
**Deferred:** 2/7 tasks moved post-MVP

---

## Completed Features (MVP)

✅ **Core Functionality:**
- Profile page at `/profile/[username]`
- Three-tier visibility system (public, members-only, private)
- Field-level permission controls
- Owner-only edit access
- SEO metadata (Open Graph + Twitter Cards)

✅ **Technical Implementation:**
- Server Components with SSR
- Zustand + React Query state management
- Privy server-side authentication
- Dynamic rendering for auth-protected pages
- Type-safe visibility rules

✅ **UI Components:**
- Profile header with avatar
- Profile info display
- Social links section
- Share button (Web Share API + clipboard fallback)
- Avatar upload with Vercel Blob Storage

---

## Deferred Features (Post-MVP)

### 1. Report/Abuse Modal

**Original Task:** "Add report button (spam/abuse reporting modal)"

**Why Deferred:**
- Community moderation feature not critical for MVP launch
- No moderation workload until profiles exist
- Report system requires admin dashboard integration
- Better to establish community norms before building safety tools

**Reactivation Criteria:**
- First abuse/spam report received via external channel (email, Discord)
- Community size exceeds 100 active profiles
- Manual moderation workload requires tooling support

**Implementation Scope (when reactivated):**
```typescript
// Components needed:
- ReportModal component (form + category selection)
- Report button in ProfileHeader
- /api/reports endpoint (create report)
- Admin dashboard view (/admin/reports)
- Email notification to admins

// Database:
- reports table (already planned in schema)
  - id, profileId, reporterId, category, description
  - status: pending/resolved/dismissed
  - reviewedBy, reviewedAt, resolution

// Categories:
- Spam/Scam
- Fake Profile
- Inappropriate Content
- Harassment
- Other
```

**Estimated Effort:** 8 hours (1 day)
- 3 hours: ReportModal component + API
- 2 hours: Admin dashboard integration
- 2 hours: Email notifications
- 1 hour: Testing

---

### 2. Custom 404 Page

**Original Task:** "Implement 404 page for non-existent profiles"

**Why Deferred:**
- Next.js default 404 page is functional for MVP
- Custom 404 adds minimal user value
- Polish feature better suited for post-launch refinement
- Profile discovery happens through directory, not direct URLs

**Current Behavior:**
- Non-existent username → Next.js default 404 page
- Works but lacks brand consistency

**Reactivation Criteria:**
- User feedback mentions 404 experience
- Traffic analytics show significant 404 hits
- Branding refinement phase

**Implementation Scope (when reactivated):**
```typescript
// Files needed:
- src/app/profile/[username]/not-found.tsx
- Custom NotFound component with:
  - "Profile not found" message
  - Search bar to find other profiles
  - Link back to directory
  - Brand-consistent styling

// Edge cases to handle:
- Deleted profiles (soft delete)
- Private profiles (vs non-existent)
- Typos in username (suggest similar names?)
```

**Estimated Effort:** 4 hours (half day)
- 2 hours: NotFound component + styling
- 1 hour: Similar username suggestions
- 1 hour: Testing edge cases

---

## Migration Path

### When Reactivating Report Feature:

1. **Database Migration:**
   ```sql
   CREATE TABLE reports (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     profile_id UUID NOT NULL REFERENCES profiles(id),
     reporter_id UUID REFERENCES users(id),
     category VARCHAR(50) NOT NULL,
     description TEXT NOT NULL,
     status VARCHAR(20) DEFAULT 'pending',
     reviewed_by UUID REFERENCES users(id),
     reviewed_at TIMESTAMP,
     resolution TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Component Integration:**
   - Add `<ReportButton />` to ProfileHeader
   - Create `<ReportModal />` with shadcn Dialog
   - Add report API endpoint with validation

3. **Admin Dashboard:**
   - Add `/admin/reports` page
   - List pending reports with filtering
   - Action buttons: Dismiss, Suspend Profile, Ban User

4. **Email Notifications:**
   - New report → Notify admins
   - Report resolved → Notify reporter
   - Profile suspended → Notify profile owner

### When Reactivating Custom 404:

1. **Create Component:**
   ```tsx
   // src/app/profile/[username]/not-found.tsx
   export default function ProfileNotFound() {
     return (
       <div className="page">
         <h1>Profile Not Found</h1>
         <p>The profile you're looking for doesn't exist.</p>
         <Link href="/directory">Browse Directory</Link>
       </div>
     )
   }
   ```

2. **Update Profile Page:**
   ```tsx
   // src/app/profile/[username]/page.tsx
   import { notFound } from 'next/navigation'

   const profile = await getProfileByUsername(username)
   if (!profile) notFound() // Triggers not-found.tsx
   ```

---

## Technical Debt Notes

**None.** These are intentionally deferred features, not technical shortcuts. The implemented MVP functionality is production-ready with no compromises to code quality.

---

## Testing Checklist (When Reactivated)

### Report Feature:
- [ ] Report modal opens and submits successfully
- [ ] Anonymous reporting blocked (auth required)
- [ ] Can't report own profile
- [ ] Duplicate reports detected (same profile + reporter)
- [ ] Admin receives email notification
- [ ] Reports appear in admin dashboard
- [ ] Suspended profiles hidden from directory
- [ ] Rate limiting prevents report spam

### Custom 404:
- [ ] Non-existent username shows custom 404
- [ ] 404 page is mobile-responsive
- [ ] Search bar works from 404 page
- [ ] "Browse Directory" link works
- [ ] SEO metadata appropriate for 404

---

**Last Updated:** 2025-12-26
**Original Ticket Reference:** [E1-T4](../epic-1/E1-T4-profile-page.md)
**Reactivation Epic:** Epic 2 (Quality & Growth) or Epic 3 (Community Safety)
