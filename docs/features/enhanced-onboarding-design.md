# Enhanced Onboarding Flow Design Document

## Overview
This document outlines the design for the enhanced multi-step onboarding flow that includes user information collection as the first step, followed by program selection, goal setting, and social account connection.

## User Journey

### Step Flow
1. **User Info** → 2. **Program** → 3. **Goal** → 4. **Socials** → 5. **Review**

## Step 1: User Information Form

### Purpose
Collect essential user profile information including avatar, username, email, and bio.

### Components

#### 1.1 UserInfoForm Component
**Location**: `src/components/onboarding/user-info-form.tsx`

**Fields**:
- **Avatar Upload**
  - Optional but recommended
  - Uses existing `AvatarUpload` component
  - Shows preview with fallback to initials
  - Max 5MB, JPEG/PNG/WebP

- **Username** (Required)
  - Unique identifier for the platform
  - Pattern: `^[a-z0-9_]{3,50}$`
  - Real-time availability check
  - Error message: "Username already taken" or "Invalid format"

- **Email** (Required)
  - Contact email for notifications
  - Standard email validation
  - May be pre-filled from Privy auth

- **Display Name** (Optional)
  - Full name or preferred name
  - Max 100 characters
  - Used in UI instead of username when available

- **Bio** (Optional)
  - Short description about the user
  - 0-280 characters
  - Character counter shown
  - Textarea with auto-resize

#### 1.2 Form State Interface
```typescript
interface UserInfoData {
  avatarFile: File | null
  username: string
  email: string
  displayName: string
  bio: string
}
```

#### 1.3 Validation Rules
- **Username**: Required, 3-50 chars, lowercase alphanumeric + underscore, unique
- **Email**: Required, valid email format
- **Display Name**: Optional, max 100 chars
- **Bio**: Optional, max 280 chars
- **Avatar**: Optional, max 5MB, JPEG/PNG/WebP

## Step 2-4: Existing Steps (Enhanced)

### Step 2: Program Selection
No changes needed - existing `ProgramSelector` component works as designed.

### Step 3: Goal Setting
No changes needed - existing `GoalInput` component works as designed.

### Step 4: Social Accounts (Enhanced)

#### 4.1 Enhanced Social Input Design
**Update**: `src/components/onboarding/social-accounts-form.tsx`

**New Input Group Structure**:
```tsx
// GitHub
<div className="space-y-2">
  <Label>GitHub Profile</Label>
  <div className="flex items-center gap-1">
    <span className="text-sm text-muted-foreground px-3 py-2 bg-secondary rounded-l-md border border-r-0">
      github.com/
    </span>
    <Input
      placeholder="username"
      value={githubUsername}
      onChange={handleChange}
      className="rounded-l-none"
    />
  </div>
</div>

// LinkedIn
<div className="space-y-2">
  <Label>LinkedIn Profile</Label>
  <div className="flex items-center gap-1">
    <span className="text-sm text-muted-foreground px-3 py-2 bg-secondary rounded-l-md border border-r-0">
      linkedin.com/in/
    </span>
    <Input
      placeholder="username"
      value={linkedinUsername}
      onChange={handleChange}
      className="rounded-l-none"
    />
  </div>
</div>

// X/Twitter
<div className="space-y-2">
  <Label>X (Twitter) Profile</Label>
  <div className="flex items-center gap-1">
    <span className="text-sm text-muted-foreground px-3 py-2 bg-secondary rounded-l-md border border-r-0">
      x.com/
    </span>
    <Input
      placeholder="username"
      value={twitterUsername}
      onChange={handleChange}
      className="rounded-l-none"
    />
  </div>
</div>

// Telegram
<div className="space-y-2">
  <Label>Telegram</Label>
  <div className="flex items-center gap-1">
    <span className="text-sm text-muted-foreground px-3 py-2 bg-secondary rounded-l-md border border-r-0">
      @
    </span>
    <Input
      placeholder="username"
      value={telegramUsername}
      onChange={handleChange}
      className="rounded-l-none"
    />
  </div>
</div>
```

#### 4.2 Data Structure Update
```typescript
interface SocialAccountsData {
  githubUsername: string      // Just the username
  twitterUsername: string     // Just the username
  linkedinUsername: string     // Just the username (changed from linkedinUrl)
  telegramUsername: string     // Just the username
}
```

## Step 5: Review & Submit (Enhanced)

### Review Section Updates
Add user information section to the review:

```tsx
{/* User Info Summary */}
<div className="space-y-3 rounded-lg border p-4">
  <h4 className="font-semibold">Tu Información</h4>
  <div className="flex items-start gap-4">
    <Avatar className="h-16 w-16">
      {avatarPreview ? <AvatarImage src={avatarPreview} /> : null}
      <AvatarFallback>{getInitials(displayName || username)}</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1">
      <div className="font-medium">{displayName || username}</div>
      <div className="text-sm text-muted-foreground">@{username}</div>
      <div className="text-sm text-muted-foreground">{email}</div>
      {bio && <div className="text-sm mt-2">{bio}</div>}
    </div>
  </div>
</div>

{/* Program Summary */}
<div className="space-y-3 rounded-lg border p-4">
  <h4 className="font-semibold">Programa</h4>
  <div className="text-sm">{selectedProgramName}</div>
</div>

{/* Goal Summary */}
<div className="space-y-3 rounded-lg border p-4">
  <h4 className="font-semibold">Meta</h4>
  <p className="text-sm">{goal}</p>
</div>

{/* Social Accounts Summary */}
<div className="space-y-3 rounded-lg border p-4">
  <h4 className="font-semibold">Cuentas Conectadas</h4>
  <div className="space-y-2 text-sm">
    {githubUsername && (
      <div className="flex items-center gap-2">
        <Github className="h-4 w-4" />
        github.com/{githubUsername}
      </div>
    )}
    {linkedinUsername && (
      <div className="flex items-center gap-2">
        <Linkedin className="h-4 w-4" />
        linkedin.com/in/{linkedinUsername}
      </div>
    )}
    {twitterUsername && (
      <div className="flex items-center gap-2">
        <Twitter className="h-4 w-4" />
        x.com/{twitterUsername}
      </div>
    )}
    {telegramUsername && (
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        @{telegramUsername}
      </div>
    )}
  </div>
</div>
```

## Updated Multi-Step Form Component

### State Management Updates
```typescript
type OnboardingStep = 'userInfo' | 'program' | 'goal' | 'social' | 'review'

interface FormData {
  // User Info
  avatarFile: File | null
  username: string
  email: string
  displayName: string
  bio: string

  // Program
  programId: string

  // Goal
  goal: string

  // Social Accounts (all usernames only)
  githubUsername: string
  twitterUsername: string
  linkedinUsername: string  // Changed from linkedinUrl
  telegramUsername: string
}
```

### API Integration Updates

#### Submission Flow
1. **Upload Avatar** (if provided)
   - `POST /api/profiles/avatar`
   - Returns `avatarUrl`

2. **Create/Update User Profile**
   - `PATCH /api/auth/me` or `POST /api/profiles`
   - Include: username, email, displayName, bio, avatarUrl

3. **Submit Application**
   - `POST /api/applications`
   - Include: programId, goal, social accounts

## Implementation Tasks

### 1. Create UserInfoForm Component
- [ ] Create `src/components/onboarding/user-info-form.tsx`
- [ ] Integrate AvatarUpload component
- [ ] Add username availability check (debounced)
- [ ] Implement form validation
- [ ] Add character counter for bio

### 2. Update SocialAccountsForm Component
- [ ] Add URL prefixes as labels
- [ ] Update input placeholders
- [ ] Change linkedinUrl to linkedinUsername
- [ ] Update validation to handle usernames only

### 3. Update MultiStepOnboardingForm
- [ ] Add 'userInfo' as first step
- [ ] Update FormData interface
- [ ] Add user info validation
- [ ] Update review section
- [ ] Handle avatar upload on submit

### 4. API Endpoints (if needed)
- [ ] Add username availability check endpoint
- [ ] Update application submission to handle user info

### 5. Database Schema Updates (if needed)
- [ ] Ensure users table has all required fields
- [ ] Update applications table if social field storage changes

## User Experience Considerations

### Progressive Disclosure
- Start with essential info (username, email)
- Optional fields clearly marked
- Social accounts as optional enhancement

### Visual Feedback
- Real-time validation for username
- Character counter for bio
- Avatar preview immediately on selection
- Clear step progress indicator

### Error Handling
- Inline validation messages
- Prevent progression with invalid data
- Clear error messages for API failures
- Graceful handling of avatar upload failures

### Mobile Responsiveness
- Stack form fields vertically on mobile
- Touch-friendly input sizes
- Optimized avatar upload for mobile cameras
- Responsive review layout

## Success Criteria

1. **Completeness**: All user information collected in logical flow
2. **Usability**: Clear, intuitive interface with helpful validation
3. **Performance**: Fast username checks, smooth avatar uploads
4. **Accessibility**: Keyboard navigation, screen reader support
5. **Data Quality**: Valid, properly formatted data submitted

## Testing Scenarios

### Happy Path
1. User fills all fields correctly
2. Uploads avatar successfully
3. Completes all steps
4. Submits application

### Edge Cases
- Username already taken
- Avatar upload fails
- Network disconnection during submission
- Pre-filled data from authentication
- Minimal data (only required fields)
- Maximum data (all optional fields)

## Security Considerations

- Sanitize all user inputs
- Validate file uploads server-side
- Rate limit username availability checks
- Secure avatar storage (Vercel Blob)
- CSRF protection on form submission