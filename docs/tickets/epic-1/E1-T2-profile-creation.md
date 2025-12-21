# E1-T2: Profile Creation Flow

**Epic:** Epic 1 - Talent Directory
**Story Points:** 5
**Status:** 🔴 Not Started
**Assignee:** Frontend Developer
**Dependencies:** E1-T1 (Authentication Integration)

---

## Objective

Build user-friendly profile setup form with real-time validation.

---

## Tasks

1. [ ] Create profile form with React Hook Form + Zod validation
2. [ ] Implement username availability check (debounced)
3. [ ] Add character counter for bio (max 280)
4. [ ] Build preview mode before submit
5. [ ] Create API endpoint for profile creation/update
6. [ ] Add social links input (GitHub, Twitter, LinkedIn, Telegram)
7. [ ] Implement location autocomplete (city + country)

---

## Form Fields

### Required Fields
1. **Username** (unique, 3-20 chars, alphanumeric + underscore)
   - Real-time availability check
   - Format validation: `^[a-zA-Z0-9_]{3,20}$`
   - Case-insensitive uniqueness

2. **Display Name** (2-50 chars)
   - Full name or preferred name
   - No special format restrictions

3. **Bio** (max 280 chars, no URLs initially)
   - Twitter-style character limit
   - Real-time character counter
   - Markdown support for basic formatting

4. **City + Country** (autocomplete dropdowns)
   - Country: ISO 3166-1 alpha-2 codes
   - City: filtered by selected country
   - Flag emoji display

5. **Learning Tracks** (single select radio)
   - Options: Code: AI, Crypto/DeFi, Privacy
   - Required selection

6. **Availability Status** (single select radio)
   - Options: Learning, Building, Open to Bounties
   - Color-coded indicators

### Optional Fields (Progressive Disclosure)
7. **Social Links** (optional)
   - GitHub username
   - Twitter handle (without @)
   - LinkedIn profile
   - Telegram handle (without @)
   - URL validation for each

8. **Wallet Address** (auto-filled from Privy)
   - Read-only, populated from Privy embedded wallet
   - Display truncated: `0x1234...5678`

---

## Files to Create/Modify

### New Files
- `src/app/profile/setup/page.tsx` - Profile setup page
- `src/components/profile/profile-form.tsx` - Main form component
- `src/components/profile/preview-card.tsx` - Profile preview
- `src/components/profile/social-links-input.tsx` - Social links section
- `src/components/profile/location-select.tsx` - City/country selects
- `src/lib/validators/profile.ts` - Zod schemas
- `src/lib/hooks/useUsernameCheck.ts` - Username availability hook
- `src/app/api/profiles/route.ts` - POST /api/profiles
- `src/app/api/profiles/[username]/route.ts` - GET/PUT profile by username
- `src/app/api/profiles/check-username/route.ts` - Username availability

### Data Files
- `src/data/countries.ts` - Country list with codes
- `src/data/cities.ts` - Major cities by country

---

## Implementation Details

### 1. Zod Validation Schema (`src/lib/validators/profile.ts`)

```typescript
import { z } from 'zod';

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),

  bio: z
    .string()
    .max(280, 'Bio must be at most 280 characters')
    .refine((val) => !/(https?:\/\/|www\.)/i.test(val), {
      message: 'URLs are not allowed in bio',
    }),

  city: z.string().min(1, 'City is required'),
  country: z.string().min(2, 'Country is required'),

  learningTrack: z.enum(['ai', 'crypto', 'privacy'], {
    errorMap: () => ({ message: 'Please select a learning track' }),
  }),

  availabilityStatus: z.enum(['learning', 'building', 'open-to-bounties'], {
    errorMap: () => ({ message: 'Please select your availability status' }),
  }),

  // Optional fields
  socialLinks: z.object({
    github: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    telegram: z.string().optional(),
  }).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
```

### 2. Username Availability Check (`src/lib/hooks/useUsernameCheck.ts`)

```typescript
import { useState, useEffect } from 'react';
import { useDebouncedValue } from '@/lib/hooks/useDebounce';

export function useUsernameCheck(username: string) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const debouncedUsername = useDebouncedValue(username, 500);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);

    fetch(`/api/profiles/check-username?username=${debouncedUsername}`)
      .then((res) => res.json())
      .then((data) => {
        setIsAvailable(data.available);
      })
      .catch(() => {
        setIsAvailable(null);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [debouncedUsername]);

  return { isAvailable, isChecking };
}
```

### 3. Profile Form Component Structure

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/lib/validators/profile';
import { useUsernameCheck } from '@/lib/hooks/useUsernameCheck';
import { useState } from 'react';

export function ProfileForm() {
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      displayName: '',
      bio: '',
      city: '',
      country: '',
      learningTrack: undefined,
      availabilityStatus: undefined,
      socialLinks: {},
    },
  });

  const username = form.watch('username');
  const { isAvailable, isChecking } = useUsernameCheck(username);

  const onSubmit = async (data: ProfileFormData) => {
    // Submit to API
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button type="button" onClick={() => setShowPreview(true)}>
        Preview
      </button>
      <button type="submit">Create Profile</button>
    </form>
  );
}
```

### 4. Character Counter Component

```typescript
export function BioInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const remaining = 280 - value.length;
  const isNearLimit = remaining < 50;

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={280}
      />
      <p className={isNearLimit ? 'text-warning' : 'text-muted'}>
        {remaining} characters remaining
      </p>
    </div>
  );
}
```

---

## API Endpoints

### POST `/api/profiles`

**Purpose:** Create new profile for authenticated user

**Request Body:**
```json
{
  "username": "carlos_dev",
  "displayName": "Carlos Rodriguez",
  "bio": "Learning Web3 development at Frutero",
  "city": "Buenos Aires",
  "country": "AR",
  "learningTrack": "crypto",
  "availabilityStatus": "learning",
  "socialLinks": {
    "github": "carlosdev",
    "twitter": "carlosdev",
    "linkedin": "carlos-rodriguez"
  }
}
```

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "userId": "uuid",
    "username": "carlos_dev",
    "displayName": "Carlos Rodriguez",
    ...
  }
}
```

**Error Cases:**
- 400: Validation error
- 401: Not authenticated
- 409: Username already taken

### GET `/api/profiles/check-username?username=carlos_dev`

**Purpose:** Check if username is available

**Response:**
```json
{
  "available": true,
  "username": "carlos_dev"
}
```

**Response (taken):**
```json
{
  "available": false,
  "username": "existinguser"
}
```

### PUT `/api/profiles/[username]`

**Purpose:** Update existing profile (only by owner)

**Request Body:** Same as POST
**Authorization:** Must be profile owner

---

## UX/UI Requirements

### Form Layout
- **Mobile-first design** (375px viewport)
- Single-page form (no wizard steps)
- Logical field grouping:
  1. Basic Info (username, display name)
  2. About You (bio, location)
  3. Learning & Status (tracks, availability)
  4. Social Links (collapsible section)

### Real-time Feedback
- Username availability: Show checkmark ✓ or X ✗
- Bio character count: Update on every keystroke
- Form validation: Show errors on blur, not on change
- Submit button: Disabled until form is valid

### Preview Mode
- Modal or side panel
- Shows exactly how profile will appear publicly
- "Edit" button returns to form
- "Submit" button creates profile

### Micro-copy (Encouraging Tone)
- Username field: "Choose a unique handle (3-20 characters)"
- Bio field: "Tell us about yourself in 280 characters"
- Learning tracks: "What are you most excited to learn?"
- Availability: "What's your current status?"

### Mobile Optimizations
- Large touch targets (min 44px)
- Native select dropdowns on mobile
- Keyboard type hints (email, url, etc.)
- Auto-focus on first field

---

## Acceptance Criteria

- [ ] Form completes in < 3 minutes (tested with 5 users)
- [ ] Real-time validation shows errors before submit
- [ ] Username check shows "available" or "taken" within 500ms
- [ ] Bio character count updates live
- [ ] Preview shows exact public profile appearance
- [ ] Mobile-responsive (tested on 375px viewport)
- [ ] All fields have proper validation
- [ ] Form submission creates profile in database
- [ ] Successful submission redirects to profile page
- [ ] Error handling for API failures

---

## Testing

### Manual Testing Checklist

```bash
# Test 1: Form Validation
1. Leave all required fields empty → submit
2. Should show all validation errors
3. Fill username with special characters → should show error
4. Fill bio with >280 chars → should truncate/prevent
5. All validations should pass before submission allowed

# Test 2: Username Availability
1. Type username "test123"
2. Wait 500ms
3. Should show "available" or "taken" indicator
4. Change to another username → should check again

# Test 3: Character Counter
1. Type in bio field
2. Counter should update in real-time
3. Approaching 280 → counter should change color
4. At 280 → should prevent further input

# Test 4: Preview
1. Fill all required fields
2. Click "Preview"
3. Should show modal with profile card
4. Profile card should match final appearance
5. "Edit" button should return to form with data intact

# Test 5: Form Submission
1. Complete all fields
2. Click "Create Profile"
3. Should show loading state
4. On success → redirect to /profile/[username]
5. On error → show error message, keep form data

# Test 6: Mobile Responsiveness
1. Test on 375px viewport
2. All fields should be easily tappable
3. No horizontal scroll
4. Keyboard should not obscure active field
5. Submit button should be reachable
```

### API Testing

```bash
# Check username availability
curl "http://localhost:3000/api/profiles/check-username?username=carlos_dev"

# Create profile
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -H "Cookie: privy-token=..." \
  -d '{
    "username": "carlos_dev",
    "displayName": "Carlos Rodriguez",
    "bio": "Learning Web3",
    "city": "Buenos Aires",
    "country": "AR",
    "learningTrack": "crypto",
    "availabilityStatus": "learning"
  }'

# Should return 201 with profile JSON
```

### Unit Tests

```typescript
// tests/lib/validators/profile.test.ts
describe('profileSchema', () => {
  it('validates correct profile data', () => {
    const validData = {
      username: 'carlos_dev',
      displayName: 'Carlos',
      // ... other fields
    };
    expect(() => profileSchema.parse(validData)).not.toThrow();
  });

  it('rejects username with spaces', () => {
    const invalidData = { username: 'carlos dev', /* ... */ };
    expect(() => profileSchema.parse(invalidData)).toThrow();
  });

  it('rejects bio with URLs', () => {
    const invalidData = { bio: 'Check out https://example.com', /* ... */ };
    expect(() => profileSchema.parse(invalidData)).toThrow();
  });
});
```

---

## Dependencies

### Before Starting
- [ ] E1-T1: Authentication Integration completed
- [ ] User can authenticate and be redirected to profile setup
- [ ] Database `profiles` table exists

### Blocks
- E1-T3: Public Directory Page (needs profiles to display)
- E1-T4: Individual Profile Page (needs profile structure)

---

## Notes & Questions

### Design Decisions
- **Why single-page form?** Research shows multi-step forms have higher abandonment rates for simple forms
- **Why 280 char bio limit?** Twitter-style familiarity, forces concise descriptions
- **Why no URLs in bio initially?** Prevent spam, add in Epic 2 with moderation

### Technical Notes
- Use React Hook Form for performance (minimal re-renders)
- Debounce username check to avoid excessive API calls
- Store form state in localStorage for recovery if user refreshes

### Questions
- [ ] Should username be editable after creation?
  - **Decision:** No, username is permanent (like Twitter). Add username change in future epic with verification.
- [ ] What happens if user closes form halfway?
  - **Decision:** Save draft to localStorage, show "Resume profile setup" banner on next login
- [ ] Should we auto-populate display name from Privy email?
  - **Decision:** Yes, pre-fill as suggestion but allow editing

### Future Enhancements (Not in Scope)
- Avatar upload (Epic 2)
- Custom bio formatting (bold, italic)
- Skills tags (Epic 2)
- Portfolio links (Epic 2)

---

**Created:** 2025-12-20
**Last Updated:** 2025-12-20
**Status Changes:**
- 2025-12-20: Created ticket
