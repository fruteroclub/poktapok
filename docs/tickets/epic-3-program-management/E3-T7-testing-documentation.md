# E3-T7: Testing & Documentation

> **Epic**: E3 - Program Management
> **Status**: 🎯 Todo
> **Priority**: 🔴 Critical
> **Effort**: L (3 days - comprehensive testing + docs)
> **Dependencies**: E3-T1 through E3-T6 (ALL previous tickets)

## 📋 Overview

Comprehensive testing and documentation for the entire Program Management epic. This ticket ensures quality, reliability, and maintainability of all features implemented in E3-T1 through E3-T6.

**Scope:**
- End-to-end testing of complete user journeys
- Integration testing of all API endpoints
- Unit testing of critical business logic
- Performance testing of database queries
- Security testing of access controls
- Complete feature documentation
- Admin guides and user guides

## 🎯 Objectives

1. Write comprehensive E2E tests for all user journeys
2. Create integration tests for all API endpoints
3. Write unit tests for business logic
4. Performance test database queries
5. Security audit of guest/member access controls
6. Document all features and workflows
7. Create admin and user guides

## 📦 Deliverables

### Testing
- [ ] E2E test suite (Playwright)
- [ ] API integration tests (Jest)
- [ ] Unit tests for business logic
- [ ] Database performance tests
- [ ] Security access control tests

### Documentation
- [ ] Feature documentation
- [ ] API endpoint reference
- [ ] Admin workflow guide
- [ ] User onboarding guide
- [ ] Troubleshooting guide

## 🔧 Test Coverage

### E2E Tests

**1. Complete Onboarding Journey**
```typescript
// tests/e2e/onboarding-journey.spec.ts
test('user completes full onboarding and gets approved as guest', async ({ page }) => {
  // Step 1: Login with Privy
  await page.goto('/')
  await page.click('text=Login')
  // ... Privy auth flow

  // Step 2: Complete profile
  await page.fill('[id=username]', 'newuser123')
  await page.fill('[id=displayName]', 'New User')
  await page.click('text=Siguiente')

  // Step 3: Select program
  await page.click('text=De Cero a Chamba')
  await page.click('text=Siguiente')

  // Step 4: Set goal
  const goal = 'Complete portfolio with 3 projects and land first client in next month'
  await page.fill('[id=goal]', goal)
  await page.click('text=Siguiente')

  // Step 5: Link social accounts
  await page.fill('[id=githubUsername]', 'newuser123')
  await page.click('text=Siguiente')

  // Step 6: Review and submit
  await expect(page.locator('text=@newuser123')).toBeVisible()
  await page.click('text=Enviar Aplicación')

  // Verify pending status
  await expect(page).toHaveURL('/profile')
  await expect(page.locator('text=En Revisión')).toBeVisible()

  // Admin approves as guest
  await loginAsAdmin(page)
  await page.goto('/admin/applications')
  await page.click('text=newuser123')
  await page.click('text=Approve as Guest')

  // Verify guest status
  await loginAsUser(page, 'newuser123')
  await page.goto('/profile')
  await expect(page.locator('text=Club Guest')).toBeVisible()
})
```

**2. Guest to Member Promotion**
```typescript
test('guest user gets promoted to member after meeting criteria', async ({ page }) => {
  await loginAsGuest(page)

  // Simulate participation
  // - 6 sessions attended (marked by admin)
  // - 4 quality submissions

  // Admin checks eligibility
  await loginAsAdmin(page)
  await page.goto('/admin/users/guest-user-id')
  await expect(page.locator('text=Elegible')).toBeVisible()

  // Promote to member
  await page.click('text=Promover a Miembro')
  await expect(page.locator('text=promovido exitosamente')).toBeVisible()

  // Verify member status
  await loginAsUser(page, 'guestuser')
  await page.goto('/profile')
  await expect(page.locator('text=Miembro')).toBeVisible()
})
```

**3. Admin Application Review Workflow**
```typescript
test('admin reviews and processes applications efficiently', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('/admin/applications')

  // Filter to pending
  await page.selectOption('[name=status]', 'pending')

  // Review first application
  await page.click('tbody tr:first-child')
  await expect(page.locator('text=Application Review')).toBeVisible()

  // Add review notes
  await page.fill('[name=reviewNotes]', 'Strong application with clear goals')

  // Approve as member
  await page.click('text=Approve as Member')
  await expect(page.locator('text=processed successfully')).toBeVisible()
})
```

**4. Guest Access Restrictions**
```typescript
test('guest user has limited access', async ({ page }) => {
  await loginAsGuest(page)

  // Can access: directory, activities, submissions
  await page.goto('/directory')
  await expect(page).toHaveURL('/directory')

  await page.goto('/activities')
  await expect(page).toHaveURL('/activities')

  // Cannot access: admin routes
  await page.goto('/admin')
  await expect(page.locator('text=Guest users do not have access')).toBeVisible()
})
```

### Integration Tests

```typescript
// src/app/api/__tests__/applications.test.ts
describe('Applications API', () => {
  describe('POST /api/applications', () => {
    it('creates application with valid data', async () => {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-id',
        },
        body: JSON.stringify({
          programId: 'program-id',
          goal: 'A'.repeat(150),
          githubUsername: 'testuser',
        }),
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.application.status).toBe('pending')
    })

    it('rejects duplicate applications', async () => {
      // Create first application
      await createApplication('test-user-id', 'program-id')

      // Try to create second application
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-id',
        },
        body: JSON.stringify({
          programId: 'program-id',
          goal: 'A'.repeat(150),
        }),
      })

      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.error.code).toBe('DUPLICATE_APPLICATION')
    })
  })
})
```

### Unit Tests

```typescript
// src/lib/promotion/__tests__/eligibility.test.ts
describe('Promotion Eligibility', () => {
  it('calculates eligibility correctly', async () => {
    const result = await calculatePromotionEligibility('user-id', 'enrollment-id')

    expect(result.isEligible).toBe(true)
    expect(result.criteria.attendanceCount).toBeGreaterThanOrEqual(5)
    expect(result.criteria.submissionCount).toBeGreaterThanOrEqual(3)
    expect(result.criteria.qualityScore).toBeGreaterThanOrEqual(70)
  })

  it('identifies insufficient attendance', async () => {
    // Mock 3 attendance records
    const result = await calculatePromotionEligibility('user-id', 'enrollment-id')

    expect(result.isEligible).toBe(false)
    expect(result.reasons).toContain('Need 2 more attended sessions')
  })
})
```

### Performance Tests

```typescript
// tests/performance/database-queries.test.ts
describe('Database Performance', () => {
  it('applications list query completes in <500ms', async () => {
    const start = Date.now()
    await fetchApplications({ status: 'pending', page: 1, limit: 20 })
    const duration = Date.now() - start

    expect(duration).toBeLessThan(500)
  })

  it('eligibility calculation completes in <1s', async () => {
    const start = Date.now()
    await calculatePromotionEligibility('user-id', 'enrollment-id')
    const duration = Date.now() - start

    expect(duration).toBeLessThan(1000)
  })
})
```

### Security Tests

```typescript
// tests/security/access-control.test.ts
describe('Access Control', () => {
  it('prevents guest access to admin routes', async () => {
    const response = await fetch('/api/admin/applications', {
      headers: {
        'x-user-id': 'guest-user-id',
        'x-user-role': 'user',
        'x-user-status': 'guest',
      },
    })

    expect(response.status).toBe(403)
  })

  it('prevents non-admin from approving applications', async () => {
    const response = await fetch('/api/admin/applications/app-id/approve', {
      method: 'POST',
      headers: {
        'x-user-id': 'user-id',
        'x-user-role': 'user',
      },
    })

    expect(response.status).toBe(401)
  })
})
```

## 📚 Documentation

### Feature Documentation

**File**: `docs/features/program-management.md`

```markdown
# Program Management

## Overview
The Program Management system enables structured learning programs with application-based enrollment, progress tracking, and tiered membership (Guest → Member).

## User Journeys

### New User Onboarding
1. User logs in with Privy
2. Completes profile (username, display name, bio, avatar)
3. Selects program
4. Sets 1-month goal (1-280 characters)
5. Links social accounts (GitHub, X, LinkedIn, Telegram)
6. Submits application
7. Status changes to "pending"

### Admin Application Review
1. Admin navigates to Applications Queue
2. Filters by status (pending/approved/rejected)
3. Reviews application details
4. Decides: Approve as Guest, Approve as Member, or Reject
5. Adds review notes
6. Confirms action

### Guest User Journey
1. Guest explores platform with limited access
2. Participates in activities (marked as guest)
3. Attends sessions (admin marks attendance)
4. Submits work (tracked for promotion)
5. Builds participation history

### Member Promotion
1. Guest meets eligibility criteria (5 sessions, 3 submissions, 70% quality)
2. Admin reviews eligibility dashboard
3. Admin promotes guest to member
4. User gains full platform access

## Status Tiers

### Incomplete
- Authenticated but profile not completed
- No platform access

### Pending
- Application submitted
- Awaiting admin review
- Limited platform access

### Guest (Club Guest)
- Approved for limited platform access
- Can browse, view, submit, participate
- Cannot mark attendance or access admin features
- Building participation history for promotion

### Active (Full Member)
- Full platform access
- All guest capabilities plus voting, referrals, priority

## API Endpoints

See [API Reference](../api-reference.md) for complete documentation.
```

### Admin Guide

**File**: `docs/guides/admin-application-review.md`

```markdown
# Admin Guide: Application Review

## Accessing the Applications Queue

1. Navigate to **Admin > Applications**
2. View list of pending applications
3. Use filters to sort by status or program

## Reviewing Applications

### What to Look For
- Clear, specific goals (1-280 characters)
- Connected social accounts (GitHub strongly recommended)
- Profile completeness and quality
- Goal alignment with program objectives

### Approval Decisions

**Approve as Guest:**
- Default for new applicants
- User needs to prove commitment
- Limited platform access

**Approve as Member:**
- For returning users with history
- Exceptional applications
- Fast-track for demonstrated commitment

**Reject:**
- Spam or low-quality applications
- Goals not aligned with program
- Incomplete information

### Adding Review Notes
Always add notes explaining your decision, especially for rejections.

## Promoting Guests to Members

### Eligibility Criteria
- 5+ sessions attended
- 3+ quality submissions
- 70%+ average quality score
- Consistent participation

### Promotion Process
1. Navigate to user profile
2. View "Promotion Eligibility" card
3. Review progress metrics
4. Click "Promote to Member" if eligible
5. Confirm promotion
```

## ✅ Acceptance Criteria

### Testing
- [ ] E2E test coverage >80% for critical paths
- [ ] All API endpoints have integration tests
- [ ] Business logic has unit test coverage >90%
- [ ] Performance benchmarks documented
- [ ] Security access controls validated

### Documentation
- [ ] All features documented with examples
- [ ] API reference complete with request/response samples
- [ ] Admin guide covers all workflows
- [ ] User guide explains status tiers and progression
- [ ] Troubleshooting guide addresses common issues

## 📝 Implementation Notes

- Use Playwright for E2E tests (already configured)
- Use Jest for unit and integration tests
- Document all test helpers and utilities
- Keep documentation in sync with code changes
- Add inline code comments for complex business logic

## 📖 References

- [E3-T1: Database Schema](./E3-T1-database-schema-setup.md)
- [E3-T2: Onboarding Flow](./E3-T2-onboarding-flow-implementation.md)
- [E3-T3: Guest Status](./E3-T3-guest-status-implementation.md)
- [E3-T4: Admin Queue](./E3-T4-admin-applications-queue.md)
- [E3-T5: Attendance](./E3-T5-admin-attendance-management.md)
- [E3-T6: Dashboard](./E3-T6-program-dashboard.md)
