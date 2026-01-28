# Avatar Upload Feature

## Overview

Avatar upload functionality using Vercel Blob Storage for persistent, CDN-backed image storage.

## Architecture

### Design Principles

**Separation of Concerns:**

The avatar upload system follows a clear separation between UI and business logic:

1. **UI Component** (`AvatarUpload`) - Pure presentation layer
   - File selection interface
   - Preview display with fallbacks (blo for Ethereum addresses)
   - Client-side validation feedback
   - Returns File object to parent via callback
   - **NO API calls or upload logic**

2. **Parent Components** - Business logic layer
   - Determines WHEN to upload (immediate vs deferred)
   - Handles upload orchestration
   - Manages success/error states
   - Updates application state

3. **Backend API** - Server-side processing
   - File validation and security checks
   - Blob storage operations
   - Database updates
   - Auto-cleanup of old avatars

### Flow Patterns

**Onboarding Flow (Unified Submission):**
```
User fills form → Clicks submit → Backend uploads avatar → Backend creates account
                                  ↓
                         User sees single submission
```

- Single user action ("Complete Profile")
- Backend orchestrates: upload avatar first, then create account
- Provides seamless experience without exposing multi-step process

**Profile Editing Flow (Separate Operations):**
```
Avatar change → Immediate upload → Update UI
Field edits → Click save → Update user data
```

- Avatar and profile fields update separately
- Clear visual feedback for each operation
- Maintains flexibility for independent updates

## Technical Implementation

### Storage Provider

- **Vercel Blob Storage** - Global CDN with automatic optimization
- Package: `@vercel/blob` (already installed)
- Environment: `BLOB_READ_WRITE_TOKEN` (configured)

### Avatar Fallback System

- **Blo Package** - Ethereum address to deterministic avatar generation
- Generates colorful, unique blockies from wallet addresses
- Used when no custom avatar uploaded
- Seamless integration with Privy embedded wallets

### API Endpoints

#### Upload Avatar

```
POST /api/profiles/avatar
Content-Type: multipart/form-data
```

**Request:**

- Body: FormData with `avatar` file field
- Authentication: Required (Bearer token via Privy)

**Validation:**

- File types: JPEG, PNG, WebP only
- Max size: 5MB
- Required: User must be authenticated

**Response:**

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://[blob-id].public.blob.vercel-storage.com/avatars/..."
  },
  "message": "Avatar uploaded successfully"
}
```

**Behavior:**

1. Validates file type and size
2. Deletes old avatar from blob storage if exists
3. Uploads new avatar to `avatars/{userId}/{filename}` with random suffix
4. Updates user record in database with new URL
5. Returns new avatar URL

#### Delete Avatar

```
DELETE /api/profiles/avatar
```

**Request:**

- Authentication: Required (Bearer token via Privy)

**Response:**

```json
{
  "success": true,
  "data": {},
  "message": "Avatar removed successfully"
}
```

**Behavior:**

1. Deletes avatar file from blob storage
2. Sets user's `avatarUrl` to `null` in database

### Client Component

**Component:** `src/components/profile/avatar-upload.tsx`

**Responsibilities (UI Only):**

- File selection interface with validation feedback
- Live preview display before upload
- Fallback avatar generation (blo for Ethereum addresses, initials otherwise)
- Client-side validation (file type, size)
- Returns selected File object to parent
- **Does NOT handle:** API calls, upload orchestration, state management

**Props Interface:**

```typescript
interface AvatarUploadProps {
  currentAvatarUrl: string | null
  username?: string                           // For initials fallback
  displayName?: string | null                 // For initials fallback
  ethAddress?: `0x${string}` | null           // For blo fallback
  onFileSelect: (file: File | null) => void   // Returns File to parent
  disabled?: boolean                          // Loading state from parent
}
```

**Usage Example (Onboarding):**

```tsx
import { AvatarUpload } from '@/components/profile/avatar-upload'

const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)

;<AvatarUpload
  currentAvatarUrl={null}
  username={formData.username}
  displayName={formData.displayName}
  ethAddress={privyWallet?.address}
  onFileSelect={setSelectedAvatar}
  disabled={isSubmitting}
/>
```

**Usage Example (Profile Editing):**

```tsx
const handleFileSelect = async (file: File | null) => {
  if (!file) return

  // Parent handles upload orchestration
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await fetch('/api/profiles/avatar', {
      method: 'POST',
      body: formData,
    })
    // Update UI with new avatar URL
  } catch (error) {
    toast.error('Upload failed')
  }
}

;<AvatarUpload
  currentAvatarUrl={user.avatarUrl}
  onFileSelect={handleFileSelect}
/>
```

## File Organization

### Storage Structure

```
avatars/
  ├── {userId}/
  │   ├── {filename}-{randomSuffix}.jpg
  │   ├── {filename}-{randomSuffix}.png
  │   └── {filename}-{randomSuffix}.webp
```

### Auto-Cleanup

- Old avatars are automatically deleted when user uploads new one
- Deletion is graceful (continues even if blob deletion fails)
- Only deletes files from `vercel-storage.com` domain

## Security

### Authentication

- All endpoints require valid Privy authentication token
- Server-side token verification via `@privy-io/server-auth`
- Users can only upload/delete their own avatars

### File Validation

- **Type whitelist:** Only JPEG, PNG, WebP accepted
- **Size limit:** 5MB maximum
- **Server-side validation:** All checks performed server-side
- **Client-side preview:** Validates before upload to improve UX

### Storage Security

- Public read access for avatars (required for profile display)
- Write access restricted to authenticated API routes
- Random suffix prevents filename collisions
- Blob storage URLs are cryptographically secure

## Error Handling

### Upload Errors

- **No file provided:** 400 Bad Request
- **Invalid file type:** 400 Bad Request with type requirement
- **File too large:** 400 Bad Request with size limit
- **Unauthorized:** 401 Unauthorized
- **Storage failure:** 500 Internal Server Error

### Delete Errors

- **Unauthorized:** 401 Unauthorized
- **Storage failure:** Continues with database update (graceful degradation)

### Client-Side Errors

- Toast notifications for user feedback
- Form remains interactive after errors
- Preview is cleared on error

## Configuration

### Environment Variables

```bash
# Required for avatar upload functionality
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

**Obtaining the token:**

1. Go to Vercel project dashboard
2. Navigate to **Storage** tab
3. Create/select Blob Store
4. Copy **BLOB_READ_WRITE_TOKEN**

### Vercel Setup

1. Install package: `bun add @vercel/blob` ✅ Done
2. Configure environment variable ✅ Done
3. Deploy to Vercel (token available automatically in production)

## Usage Examples

### Onboarding Flow (Unified Submission)

**User Experience:**
1. User fills onboarding form (username, display name, bio)
2. User selects avatar file (optional)
3. Preview displays immediately with validation feedback
4. User clicks "Complete Profile" button (single action)
5. Success feedback once account created

**Implementation:**
```typescript
import { uploadAvatar } from '@/services/profile'
import { updateUser } from '@/services/auth'
import { ApiError } from '@/lib/api/fetch'

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)

  try {
    // Step 1: Upload avatar if selected (service handles FormData and API call)
    let avatarUrl = null
    if (selectedAvatar) {
      avatarUrl = await uploadAvatar(selectedAvatar)
    }

    // Step 2: Update user with all form data + avatar URL (service handles API call)
    await updateUser({
      ...formData,
      avatarUrl,
    })

    // Success handling
    toast.success('Profile completed successfully')
    router.push('/profile')
  } catch (error) {
    // Structured error handling from ApiError
    if (error instanceof ApiError) {
      toast.error(error.message)
    } else {
      toast.error('Failed to complete profile')
    }
  } finally {
    setIsSubmitting(false)
  }
}
```

### Profile Editing Flow (Separate Operations)

**User Experience:**
1. User clicks edit button on profile
2. User selects new avatar file
3. Avatar uploads immediately with loading feedback
4. Success toast notification
5. User can edit other fields independently
6. Other field changes saved separately

**Implementation:**
```typescript
import { uploadAvatar } from '@/services/profile'
import { ApiError } from '@/lib/api/fetch'

const handleFileSelect = async (file: File | null) => {
  if (!file) return

  setIsUploading(true)

  try {
    // Service handles FormData creation and API call
    const avatarUrl = await uploadAvatar(file)

    // Update local state with new avatar URL
    setUser({ ...user, avatarUrl })

    toast.success('Avatar updated successfully')
  } catch (error) {
    // Structured error handling from ApiError
    if (error instanceof ApiError) {
      toast.error(error.message)
    } else {
      toast.error('Failed to upload avatar')
    }
  } finally {
    setIsUploading(false)
  }
}
```

### Backend Upload Flow

**Server Responsibilities:**
1. Authenticate request (Privy token validation)
2. Validate file type and size
3. Delete old avatar from blob storage (if exists)
4. Upload new avatar to Vercel Blob Storage
5. Update user record in database with new URL
6. Return new avatar URL to client

**Key Implementation Details:**
- Auto-cleanup prevents orphaned files
- Random suffix prevents filename collisions
- Graceful degradation (continues if old file deletion fails)
- Atomic operation (database updated only after successful upload)

### Delete Flow

1. User clicks "Remove Avatar" button
2. Confirmation dialog (optional)
3. DELETE request sent to API
4. Blob storage file deleted
5. Database updated (`avatarUrl = null`)
6. Success toast notification
7. Avatar reverts to fallback (blo or initials)

## Testing

### Manual Testing

1. Navigate to `/profile/edit`
2. Upload valid image (JPEG/PNG/WebP, < 5MB)
3. Verify preview displays correctly
4. Verify upload succeeds and avatar updates
5. Upload another image to test replacement
6. Verify old image is cleaned up
7. Click "Remove Avatar" and verify deletion

### Edge Cases

- Upload same file twice (should work due to random suffix)
- Upload at max size (5MB exactly)
- Upload with special characters in filename
- Upload while offline (should show error)
- Delete non-existent avatar (should succeed gracefully)

## Performance

### Optimization

- **CDN delivery:** Vercel Blob serves from global edge network
- **Lazy loading:** Avatar images use Next.js Image optimization
- **Caching:** Blob URLs are cache-friendly
- **Compression:** Automatic compression by Vercel

### Limits

- **Upload size:** 5MB max per file
- **Storage:** No hard limit (pay-as-you-go)
- **Bandwidth:** 500GB/month free on Hobby plan
- **Requests:** Unlimited on all plans

## Design Rationale

### Why Separate UI from Business Logic?

**Modularity Benefits:**
- Component remains reusable across different flows (onboarding, profile editing, admin tools)
- Parent components control upload timing and orchestration
- Easier to test UI independently from upload logic
- Simpler component API with single responsibility

**Flow Flexibility:**
- Onboarding: Deferred upload (on form submission)
- Profile editing: Immediate upload (on file selection)
- Future use cases: Batch uploads, admin operations

**Developer Experience:**
- Clear separation of concerns
- Predictable component behavior
- Easy to reason about data flow
- Reduced coupling between UI and API

### Why Different Flows for Onboarding vs Profile?

**Onboarding (Unified):**
- User expectation: "Complete my profile" = one action
- Backend orchestrates multi-step process
- Simpler mental model for first-time users
- Reduces perceived complexity

**Profile Editing (Separate):**
- User expectation: "Change avatar" is distinct from "Edit bio"
- Immediate feedback improves perceived responsiveness
- Allows independent updates without re-saving entire profile
- Matches mental model of discrete profile sections

## Future Improvements

### Potential Enhancements

- [ ] Image cropping/editing before upload
- [ ] Multiple image sizes (thumbnail, medium, large)
- [ ] Automatic image optimization (WebP conversion)
- [ ] Bulk upload support
- [ ] Avatar gallery (previous avatars)
- [ ] Face detection and auto-cropping
- [ ] NFT avatar support (Web3 integration)
- [ ] Drag-and-drop file upload

### Current Limitations

- Single avatar per user (no gallery)
- No image editing (crop, rotate, filter)
- No animated avatars (GIF, APNG)
- No vector formats (SVG)
- File selection via button only (no drag-and-drop)

## Related Files

**API Routes:**

- [src/app/api/profiles/avatar/route.ts](../../src/app/api/profiles/avatar/route.ts)

**Components:**

- [src/components/profile/avatar-upload.tsx](../../src/components/profile/avatar-upload.tsx)

**Pages:**

- [src/app/profile/edit/page.tsx](../../src/app/profile/edit/page.tsx)

**Database:**

- [drizzle/schema/users.ts](../../drizzle/schema/users.ts) - `avatarUrl` field

**Documentation:**

- [CLAUDE.md](../../CLAUDE.md) - Project overview
- [E1-T4 Ticket](../tickets/epic-1/E1-T4-profile-page.md) - Feature ticket
