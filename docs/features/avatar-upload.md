# Avatar Upload Feature

## Overview

Avatar upload functionality using Vercel Blob Storage for persistent, CDN-backed image storage.

## Technical Implementation

### Storage Provider
- **Vercel Blob Storage** - Global CDN with automatic optimization
- Package: `@vercel/blob` (already installed)
- Environment: `BLOB_READ_WRITE_TOKEN` (configured)

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

**Features:**
- File input with drag-and-drop support
- Live preview before upload
- Client-side validation
- Loading states during upload
- Error handling with toast notifications
- Upload progress feedback

**Usage:**
```tsx
import { AvatarUpload } from "@/components/profile/avatar-upload";

<AvatarUpload
  currentAvatarUrl={user.avatarUrl}
  onUploadSuccess={(newUrl) => {
    // Handle success
  }}
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

## Usage Example

### Upload Flow
1. User navigates to `/profile/edit`
2. Clicks "Change Avatar" button
3. Selects image file (or drags and drops)
4. Preview displays immediately
5. Clicks "Upload" button
6. File validates client-side
7. Uploads to server via FormData
8. Server validates and stores in Blob Storage
9. Database updated with new URL
10. Success toast notification
11. Page refreshes to show new avatar

### Delete Flow
1. User clicks "Remove Avatar" button
2. Confirmation dialog (optional)
3. DELETE request sent to API
4. Blob storage file deleted
5. Database updated (`avatarUrl = null`)
6. Success toast notification
7. Avatar reverts to default (DiceBear initials)

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

## Future Improvements

### Potential Enhancements
- [ ] Image cropping/editing before upload
- [ ] Multiple image sizes (thumbnail, medium, large)
- [ ] Automatic image optimization (WebP conversion)
- [ ] Bulk upload support
- [ ] Avatar gallery (previous avatars)
- [ ] Face detection and auto-cropping
- [ ] NFT avatar support (Web3 integration)

### Current Limitations
- Single avatar per user (no gallery)
- No image editing (crop, rotate, filter)
- No animated avatars (GIF, APNG)
- No vector formats (SVG)

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
