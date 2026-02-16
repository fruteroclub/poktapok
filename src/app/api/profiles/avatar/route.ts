import { NextRequest, NextResponse } from 'next/server'

/**
 * Avatar upload API route
 * 
 * Note: Avatar uploads now go through Convex storage directly.
 * This route is deprecated - use the Convex mutations:
 * - users.generateUploadUrl() to get upload URL
 * - users.saveAvatar() to save the storageId to user record
 * 
 * Keeping this route for backwards compatibility but it returns an error
 * directing users to use the new Convex-based flow.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Avatar upload has moved to Convex storage. Use generateUploadUrl mutation.',
      code: 'DEPRECATED_ENDPOINT'
    },
    { status: 410 } // Gone
  )
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Use Convex storage for avatar operations',
      code: 'DEPRECATED_ENDPOINT'
    },
    { status: 410 }
  )
}
