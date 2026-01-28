# Onboarding Enhancement Implementation Guide

## Overview
This guide walks through implementing the enhanced onboarding flow with user information collection as the first step.

## Components Created

### 1. User Info Form (`user-info-form.tsx`)
- **Purpose**: Collects avatar, username, email, display name, and bio
- **Features**:
  - Avatar upload with preview
  - Real-time username availability checking
  - Email pre-filling from authentication
  - Character counter for bio
  - Form validation

### 2. Enhanced Social Accounts Form (`social-accounts-form-enhanced.tsx`)
- **Purpose**: Improved social account input with URL prefixes
- **Features**:
  - URL prefixes as visual labels
  - Username-only input (no full URLs)
  - Smart parsing if users paste full URLs
  - Clear visual hierarchy

### 3. Enhanced Multi-Step Form (`multi-step-onboarding-form-enhanced.tsx`)
- **Purpose**: Complete onboarding flow orchestration
- **Steps**: User Info → Program → Goal → Social → Review
- **Features**:
  - Progress tracking
  - Form validation
  - Avatar upload handling
  - Comprehensive review screen

## Implementation Steps

### Step 1: Install Required Dependencies
```bash
bun add lodash.debounce
bun add -D @types/lodash.debounce
```

### Step 2: Update API Endpoints (if needed)

#### Add Username Availability Check
Create `/api/auth/check-username/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ available: false })
  }

  try {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    return NextResponse.json({ available: existingUser.length === 0 })
  } catch (error) {
    console.error('Error checking username:', error)
    return NextResponse.json({ available: false }, { status: 500 })
  }
}
```

#### Update User Profile Update Endpoint
Update `/api/auth/me/route.ts` to handle PATCH requests:
```typescript
export async function PATCH(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return apiErrors.unauthorized()
  }

  const body = await request.json()
  const { username, email, displayName, bio, avatarUrl } = body

  try {
    await db
      .update(users)
      .set({
        username,
        email,
        displayName,
        bio,
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.privyDid, session.privyDid))

    return apiSuccess({ message: 'Profile updated successfully' })
  } catch (error) {
    return apiErrors.internal('Failed to update profile')
  }
}
```

### Step 3: Update Onboarding Page

Replace the current form in `/app/onboarding/page.tsx`:
```typescript
import MultiStepOnboardingFormEnhanced from '@/components/onboarding/multi-step-onboarding-form-enhanced'

export default function OnboardingPage() {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Bienvenido a Poktapok</h1>
      <MultiStepOnboardingFormEnhanced />
    </div>
  )
}
```

### Step 4: Database Schema Updates

Ensure the users table has all required fields:
- username (varchar, unique)
- email (varchar, unique)
- displayName (varchar, nullable)
- bio (text, nullable)
- avatarUrl (varchar, nullable)

The applications table should store social usernames:
- githubUsername (varchar, nullable)
- twitterUsername (varchar, nullable)
- linkedinUrl (varchar, nullable) - stores full URL
- telegramUsername (varchar, nullable)

### Step 5: Update Application Submission

Modify the application submission to convert LinkedIn username to URL:
```typescript
// In the submit handler
const linkedinUrl = formData.linkedinUsername
  ? `https://linkedin.com/in/${formData.linkedinUsername}`
  : undefined
```

### Step 6: Testing Checklist

#### Happy Path
- [ ] Complete all fields with valid data
- [ ] Upload avatar successfully
- [ ] Username availability check works
- [ ] Progress through all steps
- [ ] Review screen shows all data correctly
- [ ] Submission succeeds

#### Edge Cases
- [ ] Username already taken shows error
- [ ] Invalid email format rejected
- [ ] Bio character limit enforced
- [ ] Avatar file size limit (5MB) enforced
- [ ] Avatar format validation (JPEG/PNG/WebP)
- [ ] Social URL parsing (if user pastes full URL)
- [ ] Network failure handling
- [ ] Pre-filled email from authentication

#### Mobile Testing
- [ ] Responsive layout on mobile devices
- [ ] Touch-friendly inputs
- [ ] Avatar upload from camera
- [ ] Keyboard navigation works
- [ ] Progress indicator visible

### Step 7: Gradual Migration Strategy

If you want to gradually migrate from the old form:

1. **Feature Flag Approach**:
```typescript
const useEnhancedOnboarding = process.env.NEXT_PUBLIC_ENHANCED_ONBOARDING === 'true'

export default function OnboardingPage() {
  return useEnhancedOnboarding ? (
    <MultiStepOnboardingFormEnhanced />
  ) : (
    <MultiStepOnboardingForm />
  )
}
```

2. **A/B Testing**:
- Use a percentage rollout
- Track completion rates
- Monitor error rates
- Gather user feedback

3. **Parallel Running**:
- Keep both forms available
- Use enhanced for new users
- Allow existing users to update via profile

## Customization Options

### Theming
The forms use standard shadcn/ui components and respect your theme:
- Update colors in `globals.css`
- Modify component variants in UI components
- Adjust spacing and sizing with Tailwind classes

### Validation Rules
Modify validation in the form component:
```typescript
// In validateUserInfoStep()
const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 50
const BIO_MAX_LENGTH = 280
```

### Social Platforms
Add new social platforms:
1. Add field to FormData interface
2. Add input group in social form
3. Add validation if needed
4. Update review section
5. Update API submission

## Performance Considerations

### Optimizations Implemented
- Debounced username checking (500ms)
- Lazy loading of avatar preview
- Optimistic UI updates
- Client-side validation before API calls

### Further Optimizations
- Implement server-side username checking cache
- Add CDN for avatar uploads
- Implement progressive image loading
- Add request batching for multiple API calls

## Accessibility

### Keyboard Navigation
- Tab through all form fields
- Enter to submit on last step
- Escape to cancel operations

### Screen Reader Support
- Proper ARIA labels on all inputs
- Form validation announcements
- Progress indicator accessible

### Visual Indicators
- Clear focus states
- Error states with color and text
- Loading states with spinners
- Success states with checkmarks

## Security Considerations

### Client-Side
- Input sanitization
- File type validation
- File size validation
- XSS prevention in bio/display name

### Server-Side
- Re-validate all inputs
- Rate limit username checks
- Secure file upload to Vercel Blob
- SQL injection prevention with parameterized queries

## Monitoring & Analytics

### Key Metrics to Track
- Step completion rates
- Drop-off points
- Error rates by step
- Username collision rate
- Avatar upload success rate
- Time to complete onboarding

### Error Tracking
```typescript
// Add error tracking
try {
  await submitApplication()
} catch (error) {
  // Track with your analytics service
  trackEvent('onboarding_error', {
    step: currentStep,
    error: error.message,
  })
}
```

## Rollback Plan

If issues arise:
1. Toggle feature flag to disable enhanced form
2. Revert to original form
3. Preserve user data in database
4. Investigate and fix issues
5. Re-deploy with fixes

## Support & Troubleshooting

### Common Issues
- **Username always shows taken**: Check API endpoint CORS/auth
- **Avatar upload fails**: Check Vercel Blob token configuration
- **Form doesn't submit**: Check network tab for API errors
- **Validation too strict**: Adjust regex patterns

### Debug Mode
Add debug logging:
```typescript
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  console.log('Form data:', formData)
  console.log('Validation errors:', errors)
}
```