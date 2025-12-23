# E1-T4: Individual Profile Page

**Epic:** Epic 1 - Talent Directory
**Story Points:** 3
**Status:** 🟢 Completed
**Assignee:** Frontend Developer
**Dependencies:** E1-T2 (Profile Creation Flow)
**Completed:** 2025-12-22

---

## Objective

Create detailed profile view with tiered visibility controls.

---

## Tasks

1. [ ] Build profile page at `/profile/[username]`
2. [ ] Implement visibility tiers (public, members-only, private)
3. [ ] Add "Edit Profile" button (only for profile owner)
4. [ ] Create share button (copy link to clipboard)
5. [ ] Add report button (spam/abuse reporting modal)
6. [ ] Implement 404 page for non-existent profiles
7. [ ] Add SEO metadata (Open Graph, Twitter Cards)

---

## Visibility Tiers

### Public (Anyone - No Authentication Required)
Display:
- Username, display name, avatar
- Bio
- Location (city + country with flag)
- Learning tracks
- Join date ("Joined December 2024")
- Availability status with colored indicator

Hidden:
- Social links
- Email
- Wallet address
- Full portfolio (Epic 2+)

### Members-Only (Authenticated Users)
Display:
- All public data PLUS:
- Social links (GitHub, Twitter, LinkedIn, Telegram) with icons
- "Send message" button placeholder (Epic 3)
- Last active timestamp

Hidden:
- Email
- Full portfolio (visible in Epic 2)

### Private (Profile Hidden from Directory)
- Profile owner only can view
- Not listed in directory
- Direct URL shows "This profile is private"

---

## Files to Create/Modify

### New Files
- `src/app/profile/[username]/page.tsx` - Profile page
- `src/app/profile/[username]/not-found.tsx` - 404 page
- `src/components/profile/profile-header.tsx` - Avatar + bio section
- `src/components/profile/profile-info.tsx` - Info cards
- `src/components/profile/social-links.tsx` - Social media links
- `src/components/profile/share-button.tsx` - Share functionality
- `src/components/profile/report-modal.tsx` - Report abuse modal
- `src/lib/utils/visibility.ts` - Visibility permission helpers
- `src/lib/utils/social-urls.ts` - Social media URL builders
- `src/app/api/profiles/[username]/route.ts` - GET profile by username
- `src/app/api/profiles/[username]/report/route.ts` - Report endpoint

---

## Implementation Details

### 1. Profile Page Component (`src/app/profile/[username]/page.tsx`)

```typescript
import { notFound } from 'next/navigation';
import { getProfileByUsername } from '@/lib/db/queries/profiles';
import { getCurrentUser } from '@/lib/auth/helpers';
import { canViewField } from '@/lib/utils/visibility';

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === profile.userId;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        canViewSocials={canViewField('socialLinks', profile, currentUser)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <ProfileInfo profile={profile} />
        </div>

        <div>
          {canViewField('socialLinks', profile, currentUser) && (
            <SocialLinks links={profile.socialLinks} />
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) return {};

  return {
    title: `${profile.displayName} (@${profile.username}) | Poktapok`,
    description: profile.bio,
    openGraph: {
      title: profile.displayName,
      description: profile.bio,
      images: [profile.avatarUrl || '/og-default.png'],
    },
  };
}
```

### 2. Visibility Helper (`src/lib/utils/visibility.ts`)

```typescript
import type { Profile, User } from '@/lib/db/schema';

export type VisibilityLevel = 'public' | 'members' | 'private';

export function canViewField(
  field: string,
  profile: Profile,
  currentUser: User | null
): boolean {
  // Owner can always view
  if (currentUser?.id === profile.userId) {
    return true;
  }

  // Private profiles: only owner
  if (profile.visibility === 'private') {
    return false;
  }

  // Public fields
  const publicFields = [
    'username',
    'displayName',
    'avatar',
    'bio',
    'city',
    'country',
    'learningTrack',
    'availabilityStatus',
    'joinedAt',
  ];

  if (publicFields.includes(field)) {
    return true;
  }

  // Members-only fields
  const membersFields = ['socialLinks', 'lastActiveAt'];

  if (membersFields.includes(field)) {
    return currentUser !== null; // Must be authenticated
  }

  return false;
}
```

### 3. Profile Header Component

```typescript
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Share2, Flag } from 'lucide-react';
import ShareButton from './share-button';

export function ProfileHeader({ profile, isOwner, canViewSocials }) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <Avatar className="h-32 w-32">
          <AvatarFallback className="text-4xl">
            {profile.displayName[0]}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
              <p className="text-muted-foreground">@{profile.username}</p>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getLearningTrackVariant(profile.learningTrack)}>
                  {profile.learningTrack}
                </Badge>

                <AvailabilityBadge status={profile.availabilityStatus} />

                {isNewMember(profile.joinedAt) && (
                  <Badge variant="outline">New</Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isOwner ? (
                <Button asChild>
                  <Link href="/profile/edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <ShareButton username={profile.username} />
                  <ReportButton profileId={profile.id} />
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-lg">{profile.bio}</p>

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>
              📍 {profile.city}, {profile.country} {getCountryFlag(profile.country)}
            </span>
            <span>
              📅 Joined {formatDate(profile.joinedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. Share Button Component (`src/components/profile/share-button.tsx`)

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${username}`;

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s profile on Poktapok`,
          url,
        });
        return;
      } catch (err) {
        // User cancelled, fallback to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Profile link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
    </Button>
  );
}
```

### 5. Social Links Component (`src/components/profile/social-links.tsx`)

```typescript
import { Github, Twitter, Linkedin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const socialIcons = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  telegram: Send,
};

export function SocialLinks({ links }) {
  if (!links || Object.keys(links).length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold mb-3">Social Links</h3>
      <div className="space-y-2">
        {Object.entries(links).map(([platform, handle]) => {
          if (!handle) return null;

          const Icon = socialIcons[platform];
          const url = buildSocialUrl(platform, handle);

          return (
            <Button
              key={platform}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Icon className="h-4 w-4 mr-2" />
                {handle}
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function buildSocialUrl(platform: string, handle: string): string {
  const urls = {
    github: `https://github.com/${handle}`,
    twitter: `https://twitter.com/${handle}`,
    linkedin: `https://linkedin.com/in/${handle}`,
    telegram: `https://t.me/${handle}`,
  };
  return urls[platform] || '#';
}
```

### 6. Report Modal Component

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

export function ReportButton({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      await fetch(`/api/profiles/${profileId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      toast.success('Report submitted. Thank you!');
      setOpen(false);
      setReason('');
    } catch (err) {
      toast.error('Failed to submit report');
    }
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Flag className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Report spam, harassment, or inappropriate content.
            </p>
            <textarea
              placeholder="Reason for reporting..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[100px] p-2 border rounded"
            />
            <Button onClick={handleSubmit} disabled={!reason.trim()}>
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## API Endpoints

### GET `/api/profiles/[username]`

**Purpose:** Get profile by username with visibility rules applied

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "username": "carlos_dev",
    "displayName": "Carlos Rodriguez",
    "bio": "Learning Web3",
    "city": "Buenos Aires",
    "country": "AR",
    "learningTrack": "crypto",
    "availabilityStatus": "learning",
    "joinedAt": "2025-12-15T10:00:00Z",
    "socialLinks": {
      "github": "carlosdev",
      "twitter": "carlosdev"
    }
  },
  "isOwner": false,
  "canViewSocials": true
}
```

**Error Cases:**
- 404: Profile not found
- 403: Private profile (not owner)

### POST `/api/profiles/[username]/report`

**Purpose:** Report profile for abuse/spam

**Request Body:**
```json
{
  "reason": "Spam content in bio"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report submitted"
}
```

---

## SEO & Metadata

### Open Graph Tags
```html
<meta property="og:title" content="Carlos Rodriguez (@carlos_dev) | Poktapok" />
<meta property="og:description" content="Learning Web3 development at Frutero" />
<meta property="og:image" content="https://poktapok.club/og/carlos_dev.png" />
<meta property="og:type" content="profile" />
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Carlos Rodriguez (@carlos_dev)" />
<meta name="twitter:description" content="Learning Web3 development" />
```

### Canonical URL
```html
<link rel="canonical" href="https://poktapok.club/profile/carlos_dev" />
```

---

## Acceptance Criteria

- [ ] Profile loads in < 1s
- [ ] Visibility rules enforced correctly (tested with authenticated + guest users)
- [ ] Share button copies URL to clipboard with success toast
- [ ] Profile owner sees "Edit" button, others don't
- [ ] Social links construct correct URLs
- [ ] Private profiles show appropriate message for non-owners
- [ ] 404 page shows for non-existent usernames
- [ ] SEO metadata includes Open Graph and Twitter Cards
- [ ] Report modal works and submits data to API
- [ ] Mobile responsive (375px to 1920px)

---

## Testing

### Manual Testing Checklist

```bash
# Test 1: Public View (Not Authenticated)
1. Open incognito window
2. Navigate to /profile/carlos_dev
3. Should see: username, bio, location, learning track
4. Should NOT see: social links, email
5. Should see "Share" and "Report" buttons
6. Should NOT see "Edit" button

# Test 2: Members View (Authenticated)
1. Log in as different user
2. Navigate to /profile/carlos_dev
3. Should see all public data PLUS social links
4. Social links should be clickable
5. Should NOT see "Edit" button

# Test 3: Owner View
1. Log in as profile owner
2. Navigate to /profile/carlos_dev (own profile)
3. Should see all data
4. Should see "Edit Profile" button
5. Click edit → should go to /profile/edit

# Test 4: Share Button
1. Click "Share" button
2. On mobile → should open native share sheet
3. On desktop → should copy URL to clipboard
4. Should show success toast "Profile link copied!"

# Test 5: Report Button
1. Click "Report" (flag icon)
2. Modal should open
3. Enter reason → submit
4. Should show success toast
5. Modal should close

# Test 6: Private Profile
1. Set profile visibility to "private"
2. Log out
3. Navigate to /profile/username
4. Should show "This profile is private"
5. Log in as different user → same result
6. Log in as owner → should see full profile

# Test 7: Non-Existent Profile
1. Navigate to /profile/nonexistentuser123
2. Should show 404 page
3. Page should include link back to directory

# Test 8: SEO
1. View page source
2. Should include <meta> tags for Open Graph
3. Should include <meta> tags for Twitter Cards
4. Should include <link rel="canonical">
```

### API Testing

```bash
# Get public profile
curl "http://localhost:3000/api/profiles/carlos_dev"

# Get profile as authenticated user
curl "http://localhost:3000/api/profiles/carlos_dev" \
  -H "Cookie: privy-token=..."

# Report profile
curl -X POST "http://localhost:3000/api/profiles/carlos_dev/report" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Spam content"}'
```

---

## Dependencies

### Before Starting
- [ ] E1-T2: Profile Creation Flow completed
- [ ] Test profiles in database
- [ ] Visibility logic defined

### Blocks
- None (can work in parallel with E1-T3)

---

## Notes & Questions

### Design Decisions
- **Why three visibility tiers?** Balances openness with privacy control
- **Why show social links only to members?** Prevents scraping, encourages sign-ups
- **Why allow reporting without authentication?** Lowers barrier for abuse reporting

### Technical Notes
- Use Next.js `generateMetadata` for dynamic SEO
- Implement share button with Web Share API fallback to clipboard
- Store reports in database for admin review (not email)

### Questions
- [ ] Should "New" badge show for profiles < 7 or < 14 days old?
  - **Decision:** 7 days
- [ ] What happens to reported profiles?
  - **Decision:** Admin reviews in dashboard, can hide/ban if needed
- [ ] Should we show "Last active" timestamp?
  - **Decision:** Yes, for members-only (format: "Active 2 hours ago")

### Future Enhancements (Not in Scope)
- Profile analytics (view count, profile clicks)
- QR code for profile sharing
- Verified badge for completed bounties
- Custom profile themes/colors

---

**Created:** 2025-12-20
**Last Updated:** 2025-12-20
**Status Changes:**
- 2025-12-20: Created ticket
