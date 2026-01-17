# API Reference - Program Management (Epic 3)

This document provides detailed reference for all API endpoints related to the Program Management system (Epic 3: E3-T4 through E3-T6).

## Authentication

All endpoints in this document require authentication via Privy. Admin endpoints additionally require the `admin` role.

**Authentication Method**: JWT token in HTTP-only cookie (managed by Privy)

**Error Responses**:
- `401 Unauthorized`: Not authenticated or invalid token
- `403 Forbidden`: Authenticated but insufficient permissions (non-admin accessing admin routes)

## Response Format

All endpoints follow the standardized envelope pattern:

**Success Response**:
```typescript
{
  success: true,
  data: { ... },           // The actual response data
  message?: string,        // Optional success message
  meta?: { ... }           // Optional metadata (pagination, etc.)
}
```

**Error Response**:
```typescript
{
  success: false,
  error: {
    message: string,       // Human-readable error message
    code?: string,         // Machine-readable error code
    details?: unknown      // Additional error details
  }
}
```

---

## Admin - Applications

### List Applications

Retrieve a paginated list of applications with optional filtering.

**Endpoint**: `GET /api/admin/applications`

**Authentication**: Required (Admin only)

**Query Parameters**:
```typescript
{
  status?: 'pending' | 'approved' | 'rejected',  // Filter by application status
  programId?: string,                             // Filter by program
  page?: number,                                  // Page number (default: 1)
  limit?: number                                  // Items per page (default: 20, max: 100)
}
```

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    applications: Array<{
      id: string
      userId: string
      programId: string | null
      goal: string | null
      status: 'pending' | 'approved' | 'rejected'
      reviewedAt: string | null
      createdAt: string

      // Related data (LEFT JOINs)
      user: {
        id: string
        username: string | null
        displayName: string | null
        avatarUrl: string | null
        accountStatus: 'incomplete' | 'pending' | 'guest' | 'active' | 'suspended' | 'rejected'
      }
      profile: {
        id: string
        city: string | null
        country: string | null
        githubUsername: string | null
        twitterUsername: string | null
      } | null
      program: {
        id: string
        name: string
        description: string | null
      } | null
    }>
  },
  meta: {
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasMore: boolean
    }
  }
}
```

**Example Request**:
```typescript
const response = await fetch('/api/admin/applications?status=pending&page=1&limit=20')
const { data, meta } = await response.json()
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user

---

### Get Application Detail

Retrieve detailed information for a single application, including reviewer information if already reviewed.

**Endpoint**: `GET /api/admin/applications/:id`

**Authentication**: Required (Admin only)

**Path Parameters**:
- `id`: Application UUID

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    application: {
      id: string
      userId: string
      programId: string | null
      goal: string | null
      status: 'pending' | 'approved' | 'rejected'
      reviewedByUserId: string | null
      reviewedAt: string | null
      reviewNotes: string | null
      createdAt: string
      updatedAt: string
      metadata: Record<string, unknown>
    }
    user: {
      id: string
      privyDid: string
      username: string | null
      displayName: string | null
      email: string | null
      avatarUrl: string | null
      accountStatus: AccountStatus
      role: 'user' | 'admin'
      createdAt: string
    }
    profile: {
      id: string
      userId: string
      city: string | null
      country: string | null
      countryCode: string | null
      githubUsername: string | null
      twitterUsername: string | null
      linkedinUrl: string | null
      telegramUsername: string | null
    } | null
    program: {
      id: string
      name: string
      slug: string
      description: string | null
      startDate: string | null
      endDate: string | null
      isActive: boolean
    } | null
    reviewer?: {
      id: string
      username: string | null
      displayName: string | null
      email: string | null
    }
  }
}
```

**Example Request**:
```typescript
const response = await fetch(`/api/admin/applications/${applicationId}`)
const { data } = await response.json()
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user
- `NOT_FOUND`: Application not found

---

### Get Application Statistics

Retrieve aggregated statistics for the applications dashboard.

**Endpoint**: `GET /api/admin/applications/stats`

**Authentication**: Required (Admin only)

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    total: number              // All-time total applications
    pending: number            // Currently pending review
    approved: number           // Approved applications
    rejected: number           // Rejected applications
    recentCount: number        // Applications in last 7 days
  }
}
```

**Example Request**:
```typescript
const response = await fetch('/api/admin/applications/stats')
const { data } = await response.json()
// data = { total: 150, pending: 12, approved: 120, rejected: 18, recentCount: 8 }
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user

---

### Approve or Reject Application

Process an application by approving (as guest or member) or rejecting it.

**Endpoint**: `POST /api/admin/applications/:id/approve`

**Authentication**: Required (Admin only)

**Path Parameters**:
- `id`: Application UUID

**Request Body**:
```typescript
{
  decision: 'approve_guest' | 'approve_member' | 'reject'
  reviewNotes?: string       // Optional notes (recommended for rejections)
}
```

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    application: {
      id: string
      status: 'approved' | 'rejected'
      reviewedByUserId: string
      reviewedAt: string
      reviewNotes: string | null
    }
    user: {
      id: string
      accountStatus: 'guest' | 'active' | 'rejected'
    }
    enrollment?: {
      id: string
      userId: string
      programId: string
      enrolledAt: string
    }
  },
  message: string  // e.g., "Application approved successfully"
}
```

**Business Logic**:
- `approve_guest`: Sets `application.status = 'approved'`, `user.accountStatus = 'guest'`, creates program enrollment
- `approve_member`: Sets `application.status = 'approved'`, `user.accountStatus = 'active'`, creates program enrollment
- `reject`: Sets `application.status = 'rejected'`, `user.accountStatus = 'rejected'`, no enrollment created

**Example Request**:
```typescript
const response = await fetch(`/api/admin/applications/${applicationId}/approve`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    decision: 'approve_guest',
    reviewNotes: 'Clear goals and complete profile. Approved as guest to build track record.'
  })
})
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user
- `NOT_FOUND`: Application not found
- `CONFLICT`: Application already processed
- `VALIDATION_ERROR`: Invalid decision or missing program

---

## Admin - Attendance

### Mark Attendance

Mark attendance for one or more users for a specific session. Uses upsert pattern to allow updating existing records.

**Endpoint**: `POST /api/admin/attendance/mark`

**Authentication**: Required (Admin only)

**Request Body**:
```typescript
{
  sessionId: string                                    // Session UUID
  userIds: string[]                                    // Array of user UUIDs
  status: 'present' | 'absent' | 'excused'             // Attendance status
}
```

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    marked: number           // Number of attendance records created/updated
    sessionId: string
    status: AttendanceStatus
  },
  message: string  // e.g., "Attendance marked successfully for 5 users"
}
```

**Database Behavior**:
- Uses `onConflictDoUpdate` on composite unique constraint `(userId, sessionId)`
- Updates `status`, `markedBy`, `markedAt`, `updatedAt` if record exists
- Creates new record if no conflict

**Example Request**:
```typescript
const response = await fetch('/api/admin/attendance/mark', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session-uuid',
    userIds: ['user-1-uuid', 'user-2-uuid', 'user-3-uuid'],
    status: 'present'
  })
})
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user
- `VALIDATION_ERROR`: Invalid status or empty userIds array
- `NOT_FOUND`: Session not found

---

### Bulk Mark Attendance with Different Statuses

Mark attendance for multiple users with different statuses in a single request.

**Endpoint**: `POST /api/admin/attendance/bulk`

**Authentication**: Required (Admin only)

**Request Body**:
```typescript
{
  sessionId: string
  records: Array<{
    userId: string
    status: 'present' | 'absent' | 'excused'
  }>
}
```

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    marked: number           // Total records processed
    sessionId: string
  },
  message: string  // e.g., "Bulk attendance marked successfully for 15 users"
}
```

**Example Request**:
```typescript
const response = await fetch('/api/admin/attendance/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session-uuid',
    records: [
      { userId: 'user-1-uuid', status: 'present' },
      { userId: 'user-2-uuid', status: 'present' },
      { userId: 'user-3-uuid', status: 'absent' },
      { userId: 'user-4-uuid', status: 'excused' }
    ]
  })
})
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user
- `VALIDATION_ERROR`: Invalid status or empty records array
- `NOT_FOUND`: Session not found

---

### Get Session Attendance

Retrieve attendance information for all enrolled users in a session.

**Endpoint**: `GET /api/admin/attendance/session/:id`

**Authentication**: Required (Admin only)

**Path Parameters**:
- `id`: Session UUID

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    session: {
      id: string
      programId: string
      title: string
      sessionDate: string
      location: string | null
      meetingUrl: string | null
    }
    users: Array<{
      userId: string
      username: string | null
      displayName: string | null
      email: string | null
      avatarUrl: string | null
      accountStatus: AccountStatus
      enrolledAt: string

      // Attendance info (null if not yet marked)
      attendance: {
        status: 'present' | 'absent' | 'excused'
        markedAt: string
        markedBy: string
      } | null
    }>
    statistics: {
      total: number
      present: number
      absent: number
      excused: number
      unmarked: number
    }
  }
}
```

**Business Logic**:
- Fetches all users enrolled in the session's program
- LEFT JOINs with attendance records for the specific session
- Users without attendance records have `attendance: null`
- Statistics calculated from all users

**Example Request**:
```typescript
const response = await fetch(`/api/admin/attendance/session/${sessionId}`)
const { data } = await response.json()
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user
- `NOT_FOUND`: Session not found

---

## Programs - Dashboard

### Get Program Dashboard

Retrieve comprehensive dashboard data for a user's program enrollment, including participation statistics.

**Endpoint**: `GET /api/programs/:id/dashboard`

**Authentication**: Required (User must be enrolled in the program)

**Path Parameters**:
- `id`: Program UUID

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    enrollment: {
      id: string
      userId: string
      programId: string
      enrolledAt: string
      completedAt: string | null
      metadata: Record<string, unknown>
    }
    application: {
      id: string
      goal: string | null
      status: 'approved'
      reviewedAt: string | null
      createdAt: string
    }
    program: {
      id: string
      name: string
      slug: string
      description: string | null
      startDate: string | null
      endDate: string | null
      isActive: boolean
    }
    user: {
      id: string
      username: string | null
      displayName: string | null
      avatarUrl: string | null
      accountStatus: AccountStatus
    }
    stats: {
      attendance: {
        total: number           // Total sessions
        present: number         // Sessions attended
        percentage: number      // Attendance rate (0-100)
      }
      submissions: {
        total: number           // Total submissions
        approved: number        // Approved submissions
        pending: number         // Pending review
        percentage: number      // Approval rate (0-100)
      }
      qualityScore: number | null  // Average quality (0-100) from approved submissions
    }
  }
}
```

**Statistics Calculation**:
- **Attendance**: Counts records with `status = 'present'` for user's sessions
- **Submissions**: Counts activity submissions linked to program activities
- **Quality Score**: `AVG(metadata->>'qualityScore')` from approved submissions with quality scores

**Example Request**:
```typescript
const response = await fetch(`/api/programs/${programId}/dashboard`)
const { data } = await response.json()
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: User not enrolled in program
- `NOT_FOUND`: Program or enrollment not found

---

### Get Program Sessions

Retrieve sessions for a program, optionally filtered to show only upcoming sessions.

**Endpoint**: `GET /api/programs/:id/sessions`

**Authentication**: Required

**Path Parameters**:
- `id`: Program UUID

**Query Parameters**:
```typescript
{
  upcoming?: 'true' | 'false'    // Filter to show only future sessions (default: false)
}
```

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    sessions: Array<{
      id: string
      programId: string
      title: string
      description: string | null
      sessionDate: string          // ISO 8601 timestamp
      location: string | null
      meetingUrl: string | null
      createdAt: string
      updatedAt: string
    }>
  }
}
```

**Sorting**: Sessions ordered by `sessionDate` descending (most recent first)

**Example Requests**:
```typescript
// All sessions
const response = await fetch(`/api/programs/${programId}/sessions`)

// Upcoming sessions only
const response = await fetch(`/api/programs/${programId}/sessions?upcoming=true`)
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `NOT_FOUND`: Program not found

---

## Admin - User Promotion

### Get Promotion Eligibility

Check if a guest user is eligible for promotion to full member status.

**Endpoint**: `GET /api/admin/users/:id/eligibility`

**Authentication**: Required (Admin only)

**Path Parameters**:
- `id`: User UUID

**Query Parameters**:
```typescript
{
  enrollmentId: string    // Required: Program enrollment UUID
}
```

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    eligible: boolean
    requirements: {
      attendance: {
        required: 5
        current: number
        met: boolean
      }
      submissions: {
        required: 3
        current: number
        met: boolean
      }
      qualityScore: {
        required: 70
        current: number
        met: boolean
      }
    }
    user: {
      id: string
      accountStatus: AccountStatus
    }
  }
}
```

**Eligibility Criteria**:
- 5+ sessions marked as 'present'
- 3+ submissions with status 'approved'
- 70%+ average quality score (from approved submissions)
- All three requirements must be met for `eligible: true`

**Example Request**:
```typescript
const response = await fetch(
  `/api/admin/users/${userId}/eligibility?enrollmentId=${enrollmentId}`
)
const { data } = await response.json()
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user
- `NOT_FOUND`: User or enrollment not found
- `VALIDATION_ERROR`: Missing enrollmentId parameter

---

### Promote User to Member

Promote a guest user to full member status.

**Endpoint**: `POST /api/admin/users/:id/promote`

**Authentication**: Required (Admin only)

**Path Parameters**:
- `id`: User UUID

**Request Body**:
```typescript
{
  enrollmentId: string       // Program enrollment UUID
  promotionNotes?: string    // Optional notes about promotion decision
}
```

**Response**: `200 OK`
```typescript
{
  success: true,
  data: {
    user: {
      id: string
      accountStatus: 'active'
      updatedAt: string
    }
    enrollment: {
      id: string
      metadata: Record<string, unknown>  // Contains promotion timestamp and notes
    }
  },
  message: string  // e.g., "User promoted to member successfully"
}
```

**Business Logic**:
- Updates `user.accountStatus` from 'guest' to 'active'
- Updates enrollment metadata with promotion details:
  ```typescript
  metadata: {
    ...existingMetadata,
    promotedAt: string,           // ISO timestamp
    promotedBy: string,           // Admin user ID
    promotionNotes: string | null // Optional notes
  }
  ```

**Example Request**:
```typescript
const response = await fetch(`/api/admin/users/${userId}/promote`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    enrollmentId: 'enrollment-uuid',
    promotionNotes: 'Consistent participation and high-quality submissions. Promoted after 6 weeks.'
  })
})
```

**Error Codes**:
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Not an admin user
- `NOT_FOUND`: User or enrollment not found
- `CONFLICT`: User already has 'active' status
- `VALIDATION_ERROR`: Missing enrollmentId

---

## Common Error Codes

All endpoints may return these common error codes:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Operation conflicts with current state |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Rate Limiting

Currently no rate limiting is implemented. Future versions may add:
- Per-IP rate limits for public endpoints
- Per-user rate limits for authenticated endpoints
- Higher limits for admin users

## API Versioning

Current API version: **v1** (implicit)

Future versions will use URL versioning: `/api/v2/...`

## Related Documentation

- [Feature Documentation](features/program-management.md) - System architecture and user journeys
- [Admin Application Review Guide](guides/admin-application-review.md) - Application review workflow
- [Database Schema](database-setup.md) - Database structure and relationships
