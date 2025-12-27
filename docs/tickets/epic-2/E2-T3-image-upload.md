# E2-T3: Image Upload System

**Epic:** Epic 2 - Portfolio Showcase
**Story Points:** 5
**Status:** 🔴 Not Started
**Assignee:** Full-stack Developer
**Dependencies:** E2-T2 (Project Form exists)

---

## Objective

Enable logo and image uploads for portfolio projects using Vercel Blob Storage.

---

## Acceptance Criteria

### Logo Upload
- [ ] Logo upload component in project form
- [ ] Single logo per project (project identifier)
- [ ] Drag-and-drop OR file picker
- [ ] Preview before upload
- [ ] 5MB max file size
- [ ] Formats: JPEG, PNG, WebP, SVG
- [ ] Client-side image compression (best practices)
- [ ] Optimistic UI during upload

### Additional Images (Screenshots/Diagrams)
- [ ] Support up to 4 additional images (logo + 4 = 5 total)
- [ ] Multiple file upload interface
- [ ] Reorder images via drag-and-drop
- [ ] Delete individual images
- [ ] Image preview modal (lightbox)
- [ ] Architecture diagrams, screenshots, etc.

### API Endpoints
- [ ] `POST /api/projects/[id]/logo` - Upload project logo
- [ ] `DELETE /api/projects/[id]/logo` - Delete logo
- [ ] `POST /api/projects/[id]/images` - Upload additional images
- [ ] `DELETE /api/projects/[id]/images/[imageId]` - Delete image
- [ ] Auto-cleanup: Delete old images when new ones uploaded

### Storage Strategy
```
Storage Path:
projects/{userId}/{projectId}/logo.{ext}
projects/{userId}/{projectId}/image-1.{ext}
projects/{userId}/{projectId}/image-2.{ext}
```

---

## Technical Implementation

### Components
```
src/components/projects/
├── logo-upload.tsx          # Logo upload (single)
├── images-upload.tsx        # Multiple images upload
├── image-preview-modal.tsx  # Lightbox view
└── image-dropzone.tsx       # Drag-drop zone
```

### Image Validation
```typescript
const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxImages: 4, // excluding logo
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  compression: {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  }
}
```

### Compression (Client-side)
```typescript
// Use browser-image-compression library
import imageCompression from 'browser-image-compression'

async function compressImage(file: File) {
  const options = {
    maxSizeMB: 5,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  }
  return await imageCompression(file, options)
}
```

---

## API Specification

### POST /api/projects/:id/logo
```typescript
// multipart/form-data
Request:
  file: File (logo image)

Response:
{
  success: true,
  data: {
    logoUrl: string // Vercel Blob Storage URL
  }
}
```

### POST /api/projects/:id/images
```typescript
// multipart/form-data
Request:
  files: File[] (up to 4 images)

Response:
{
  success: true,
  data: {
    imageUrls: string[] // Array of Vercel Blob URLs
  }
}
```

---

## Testing Checklist

- [ ] Upload logo: JPEG, PNG, WebP, SVG
- [ ] Upload multiple images (up to 4)
- [ ] File size validation (reject >5MB)
- [ ] Format validation (reject invalid formats)
- [ ] Max images validation (reject 5th image)
- [ ] Delete logo → cleanup from storage
- [ ] Delete image → cleanup from storage
- [ ] Reupload logo → old logo deleted automatically
- [ ] Compression reduces file size without quality loss
- [ ] Mobile upload works (camera access)

---

## Success Criteria

- ✅ Logo upload works with preview
- ✅ Multiple images upload (up to 4)
- ✅ Images stored in Vercel Blob Storage
- ✅ Old images cleaned up automatically
- ✅ Client-side compression implemented
- ✅ Mobile-responsive upload UI

---

**Estimated Time:** 2-3 days
**Complexity:** Medium-High (file uploads + storage)
