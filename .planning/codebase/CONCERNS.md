# Codebase Concerns

**Analysis Date:** 2026-01-26

## Tech Debt

### API Response Pattern Duplication

**Issue:** Multiple response transformation patterns exist across API endpoints and client services, leading to inconsistent transformation logic.

**Files:**
- `src/app/api/auth/me/route.ts` (lines 35-51, 165-182)
- `src/components/profile/editable-profile-card.tsx` (lines 66-74)
- Multiple API endpoints with manual profile/social links transformation

**Impact:**
- Bugs in one transformation are not automatically caught in others
- Future changes to API response shapes require updates in multiple places
- Higher likelihood of data inconsistencies between endpoints

**Fix approach:**
- Create a centralized transformation utility: `src/lib/api/transformers.ts` with functions like `transformDatabaseProfileToApi()`
- Reuse across all API routes and client services
- Establish single source of truth for data shape conversions

### Multiple Upload Handler Implementations

**Issue:** File upload logic is duplicated across different features with subtle differences in validation and error handling.

**Files:**
- `src/components/portfolio/images-upload.tsx` (lines 57-150) - Image upload with preview management
- `src/app/api/projects/[id]/images/route.ts` (lines 27-126) - Server-side image upload
- `src/components/onboarding/multi-step-onboarding-form-enhanced.tsx` - Avatar handling (implied)

**Impact:**
- Inconsistent file validation logic across features
- Different error handling strategies make debugging difficult
- Preview URL management in client can leak memory if cleanup fails

**Fix approach:**
- Extract common upload logic to `src/lib/upload/upload-manager.ts`
- Consolidate validation rules in single validation service
- Implement consistent error recovery patterns

### Incomplete Data Migration Path

**Issue:** Migration from old to new social account format (URL → username) was applied via migration file but no data transformation script exists for existing records.

**Files:** `drizzle/migrations/E3-T2-MIGRATION-README.md` (lines 63-72)

**Impact:**
- Old data (full URLs like `https://github.com/username`) will be stored in fields now intended for usernames only
- Application-level logic expects usernames only, creating data format inconsistency
- Future queries on social fields may fail or require defensive coding

**Fix approach:**
- Create `scripts/migrate-social-urls-to-usernames.ts` to extract and normalize existing data
- Run as part of deployment checklist
- Add documentation to migration README about data transformation requirements

## Known Issues

### Database Connection Pool Not Closed on Shutdown

**Issue:** The database pool in `src/lib/db/index.ts` exports a `closeDatabase()` function but it's never called during application shutdown.

**Files:** `src/lib/db/index.ts` (lines 35-38)

**Trigger:** Application exits (deployment shutdown, process termination)

**Symptoms:**
- Connection pool may not drain properly
- Pending queries could timeout or fail
- Resource cleanup incomplete on shutdown

**Workaround:** None currently - graceful shutdown requires explicit pool closure

**Fix approach:**
- Call `closeDatabase()` in Next.js shutdown hooks
- Add to API route middleware or application exit handler
- Document in CLAUDE.md shutdown procedures

### Multiple useEffect Redirects in Profile Page

**Issue:** Three separate useEffect hooks control routing logic in `src/app/profile/page.tsx` (lines 30-50), creating potential race conditions.

**Files:** `src/app/profile/page.tsx` (lines 30-50)

**Symptoms:**
- User may briefly see UI before being redirected
- Multiple redirects could fire in quick succession
- Race condition if data fetch completes while redirecting

**Workaround:** Pages load slowly but usually redirect correctly before content renders

**Fix approach:**
- Consolidate all routing logic into single effect with combined dependencies
- Move redirect logic to higher-level wrapper component
- Consider using Next.js middleware for auth-based routing instead

### Missing Query Cache Management

**Issue:** TanStack Query hooks use short `staleTime` values (2-5 minutes) but no explicit `gcTime` configuration, causing memory buildup with rapid page navigation.

**Files:**
- `src/hooks/use-admin.ts` (lines 56, 67) - `staleTime` set but no `gcTime`
- `src/hooks/use-auth.ts` (line 74) - `staleTime: 5 * 60 * 1000` without `gcTime`

**Impact:**
- Queries remain in garbage collection queue for default 5 minutes
- Heavy admin dashboard usage with pagination creates memory pressure
- Longer sessions show noticeable performance degradation

**Fix approach:**
- Add explicit `gcTime` configuration to all query hooks: `gcTime: 1 * 60 * 1000` (1 minute)
- Monitor memory usage in production
- Document cache strategy in CONVENTIONS.md

## Security Considerations

### Insufficient Input Validation on Social Links

**Risk:** Social account usernames accepted from user input without validation of safe characters.

**Files:**
- `src/components/onboarding/social-accounts-form-enhanced.tsx`
- `src/app/api/applications/route.ts` (lines 20-23)
- Form validation schemas

**Current mitigation:** Basic regex patterns, no XSS escaping at display level

**Recommendations:**
- Add comprehensive regex validation: `^[a-zA-Z0-9_-]{1,50}$` for GitHub/Twitter usernames
- Sanitize on display using `next/sanitize` or similar
- Document username format restrictions in UI
- Add server-side whitelist validation for special characters

### Unvalidated File Upload Paths

**Risk:** File upload paths constructed from user ID and project ID without path traversal prevention.

**Files:** `src/app/api/projects/[id]/images/route.ts` (line 91)

**Current mitigation:** Vercel Blob Storage handles sanitization, but path construction is brittle

**Recommendations:**
- Use UUID suffix (already added via `addRandomSuffix: true`) consistently
- Never interpolate user input directly into paths
- Add path traversal tests to validation logic
- Document path construction assumptions

### Missing CSRF Protection on State-Changing Operations

**Risk:** No explicit CSRF token validation on POST/PATCH endpoints.

**Files:**
- `src/app/api/applications/route.ts`
- `src/app/api/profiles/route.ts`
- All state-changing API endpoints

**Current mitigation:** Next.js provides CSRF protection via SameSite cookies, but not explicitly documented

**Recommendations:**
- Document SameSite cookie strategy in security docs
- Add explicit CSRF token support for high-risk operations (approvals, profile changes)
- Implement middleware to validate origin headers on admin endpoints

## Performance Bottlenecks

### Query N+1 Pattern in Directory Search

**Problem:** Directory profile queries join with `userSkills` table to filter by skills, potentially causing multiple queries per result.

**Files:** `src/lib/db/queries/profiles.ts` (lines 115-120)

**Cause:** Subquery joins without proper aggregation, backend may run one query per skill filter

**Current performance:** Acceptable for < 10k users, degrades at scale

**Improvement path:**
- Benchmark current query execution with EXPLAIN ANALYZE
- Consider materialized view for skill-based profiles
- Implement Redis caching layer for common skill combinations
- Add pagination cursor-based approach instead of offset

### Large Admin Pages with No Pagination Optimization

**Problem:** Admin users/applications pages load full datasets before pagination.

**Files:**
- `src/app/admin/users/page.tsx` (725 lines)
- `src/app/admin/users/[id]/page.tsx` (695 lines)

**Cause:** Complex filtering/sorting UI with full result set loaded in React state

**Impact:** Page becomes sluggish with > 500 records, memory usage spikes

**Improvement path:**
- Implement server-side pagination in query helpers
- Use cursor-based pagination for large datasets
- Add request debouncing on filter changes
- Consider table virtualization for large result sets

### Image Compression Without Progress Tracking

**Problem:** `ImagesUpload` component compresses multiple images sequentially with toast notifications but no visible progress bar for large images.

**Files:** `src/components/portfolio/images-upload.tsx` (lines 80-84)

**Impact:** Users see spinner briefly then success message, unclear if compression succeeded

**Improvement path:**
- Add progress callback to `compressImage()` utility
- Display per-image compression progress
- Show total bytes saved from compression
- Add cancellation capability for long-running operations

## Fragile Areas

### Database Transaction Handling in Applications Endpoint

**Files:** `src/app/api/applications/route.ts` (lines 120-163)

**Why fragile:**
- Three separate operations (create application, update user, upsert profile) bundled in single transaction
- If profile upsert fails, entire application submission fails
- Profile already created via `onConflictDoUpdate` so failure recovery unclear

**Safe modification:**
- Add explicit error handling for each transaction step
- Log which step failed for debugging
- Consider separating profile update from application flow (create app, then update profile separately)
- Test failure scenarios: duplicate application, missing program, profile conflicts

**Test coverage gaps:**
- No test for concurrent application submissions from same user
- No test for application submission with missing program
- No test for profile upsert conflicts

### Onboarding Form State Management

**Files:** `src/components/onboarding/multi-step-onboarding-form-enhanced.tsx` (lines 47-87)

**Why fragile:**
- Large form data state object with 13 fields, error tracking across multiple steps
- Complex validation logic (validateUserInfoStep, validateGoalStep, etc.) spread throughout component
- Avatar preview management with potential URL leak if cleanup fails
- File storage in state for new projects (pendingFiles) with no size limits

**Safe modification:**
- Extract form validation to separate `src/lib/validators/onboarding.ts`
- Consider breaking into separate step-specific hooks/components
- Add form state reset after successful submission
- Implement file size limits for avatar and pending files

**Test coverage gaps:**
- No validation of regex patterns used for username/email
- No test for form state recovery after network error
- No test for avatar preview cleanup on component unmount

## Scaling Limits

### Database Connection Pool Hard Limit

**Current capacity:** 10 concurrent connections (set in `src/lib/db/index.ts` line 23)

**Limit:** 10 simultaneous database queries

**When it breaks:** Production with 100+ concurrent users, any slow query blocks pool

**Scaling path:**
- Monitor connection pool usage in production (add instrumentation)
- Increase `max` to 20-30 as interim fix
- Implement connection timeout handling (currently 10s)
- Add query optimization to reduce execution time
- Consider database read replicas for read-heavy workloads

### Blob Storage Path Structure

**Current:** `projects/{userId}/{projectId}/image-{timestamp}-{index}-{filename}`

**Limit:** Vercel Blob Storage handles unlimited files, but path organization becomes unwieldy at scale

**When it breaks:**
- 1000+ projects per user causes directory listing slowdown
- Manual file cleanup impossible without listing API
- No way to track which files belong to deleted projects

**Scaling path:**
- Implement soft-delete with deleted-flag in metadata instead of deleting files
- Add background job to clean up orphaned files monthly
- Use file expiration headers for automatic cleanup
- Track file costs and implement storage quotas per user

## Dependencies at Risk

### Privy SDK Tight Integration

**Risk:** Authentication tightly coupled to Privy SDK across 15+ components/hooks

**Files:**
- `src/providers/auth/privy-provider.tsx` (main integration)
- `src/hooks/use-auth.ts` (custom hook wrapping Privy)
- `src/components/buttons/` (auth buttons)
- `src/lib/privy/middleware.ts` (request authentication)

**Impact:** Switching auth providers requires refactoring majority of codebase

**Current mitigation:** Custom hooks abstract some details, but Privy still leaked into many components

**Migration plan:**
- Create `src/lib/auth/abstract-provider.ts` with provider-agnostic interface
- Implement adapter pattern to support multiple providers
- Gradually move Privy-specific code behind abstraction
- Priority: Medium (not urgent, but reduces future refactoring cost)

### Wagmi Wallet Integration Version Lock

**Risk:** Specific Wagmi version locked, custom chain configuration may break with updates

**Files:**
- `src/providers/onchain-config/index.tsx`
- `package.json` (wagmi version constraint)

**Current mitigation:** Alchemy API key fallback to public RPC

**Recommendations:**
- Test Wagmi major version updates quarterly
- Keep chain configuration in separate config file for easier updates
- Document custom Alchemy configuration assumptions
- Monitor breaking changes in wagmi releases

## Missing Critical Features

### No User Audit Trail

**Problem:** Admin actions (approvals, rejections, status changes) create no audit logs.

**Blocks:**
- Cannot debug approval decisions
- No way to track who approved a user or when
- Compliance risk for platforms in regulated jurisdictions

**Implementation:** Add `audit_logs` table with action, actor, target, and changes recorded

### No Rate Limiting on Public APIs

**Problem:** Directory search, user profiles, and session data are publicly accessible without rate limiting.

**Blocks:**
- Vulnerable to enumeration attacks (find all users, scrape emails)
- No protection against DOS on directory endpoint
- No cost control for high-volume API usage

**Implementation:** Add rate limiting middleware with Redis backend, 100 requests/minute per IP for public endpoints

## Test Coverage Gaps

### No API Integration Tests

**What's not tested:**
- Full transaction flow for application submission (create app → update user → create profile)
- Error paths in image upload (network failures, validation errors)
- Concurrent requests to same endpoints

**Files:**
- `src/app/api/applications/route.ts`
- `src/app/api/projects/[id]/images/route.ts`
- `src/app/api/auth/me/route.ts`

**Risk:** Medium - critical paths unverified, bugs discovered in production

**Priority:** High - add integration tests for onboarding flow and file uploads

### No Component Interaction Tests

**What's not tested:**
- Multi-step form navigation and state preservation
- Image upload with preview and reordering
- Admin approval modal interactions

**Files:**
- `src/components/onboarding/multi-step-onboarding-form-enhanced.tsx`
- `src/components/portfolio/images-upload.tsx`
- `src/components/admin/application-detail-drawer.tsx`

**Risk:** Medium - UI regressions not caught, user workflows break silently

**Priority:** Medium - add Vitest component tests for critical flows

### No Database Migration Tests

**What's not tested:**
- Migration compatibility with existing data
- Rollback procedures
- Concurrent migration execution

**Files:** `drizzle/migrations/`

**Risk:** High - failed migrations block deployments, data corruption possible

**Priority:** Critical - add migration validation tests before production use

---

*Concerns audit: 2026-01-26*
