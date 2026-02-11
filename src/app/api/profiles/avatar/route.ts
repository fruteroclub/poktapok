import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { PrivyClient } from '@privy-io/server-auth'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
  }
  return token
}

/**
 * POST /api/profiles/avatar
 * Upload user avatar to Vercel Blob Storage
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    console.log('[avatar] Step 1: Auth header present')

    // Step 2: Verify with Privy
    let privyDid: string
    try {
      const verifyResult = await privy.verifyAuthToken(token)
      privyDid = verifyResult.userId
      console.log('[avatar] Step 2: Privy verified, did:', privyDid)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[avatar] Step 2 FAILED: Privy verification:', msg)
      return NextResponse.json({ error: `Invalid token: ${msg}` }, { status: 401 })
    }

    // Step 3: Get user from Convex
    let user
    try {
      user = await convex.query(api.users.getByPrivyDid, { privyDid })
      if (!user) {
        console.error('[avatar] Step 3 FAILED: User not found for', privyDid)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      console.log('[avatar] Step 3: User found:', user._id)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[avatar] Step 3 FAILED: Convex query:', msg)
      return NextResponse.json({ error: `Convex query failed: ${msg}` }, { status: 500 })
    }

    // Step 4: Parse form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    console.log('[avatar] Step 4: File received:', file.name, file.type, file.size, 'bytes')

    // Validate file type
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!acceptedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WebP' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Read token at runtime (not build time)
    const blobToken = getBlobToken()
    console.log('[avatar] Blob token present, length:', blobToken.length)

    // Step 5: Delete old avatar if exists
    if (user.avatarUrl && user.avatarUrl.includes('vercel-storage.com')) {
      try {
        await del(user.avatarUrl, { token: blobToken })
        console.log('[avatar] Step 5: Old avatar deleted')
      } catch (error) {
        console.error('[avatar] Step 5: Failed to delete old (continuing):', error)
      }
    } else {
      console.log('[avatar] Step 5: No old blob avatar to delete')
    }

    // Step 6: Upload to Vercel Blob
    let blob
    try {
      blob = await put(`avatars/${user._id}/${file.name}`, file, {
        access: 'public',
        addRandomSuffix: true,
        token: blobToken,
      })
      console.log('[avatar] Step 6: Blob uploaded:', blob.url)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[avatar] Step 6 FAILED: Blob upload:', msg)
      return NextResponse.json({ error: `Blob upload failed: ${msg}` }, { status: 500 })
    }

    // Step 7: Update in Convex
    try {
      await convex.mutation(api.users.updateAvatar, {
        privyDid,
        avatarUrl: blob.url,
      })
      console.log('[avatar] Step 7: Convex updated')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error('[avatar] Step 7 FAILED: Convex mutation:', msg)
      return NextResponse.json({ error: `Convex update failed: ${msg}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      avatarUrl: blob.url,
      message: 'Avatar uploaded successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[avatar] Unexpected error:', message, error)
    return NextResponse.json(
      { error: `Avatar upload failed: ${message}` },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profiles/avatar
 * Remove user avatar
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify with Privy
    let privyUser
    try {
      const verifyResult = await privy.verifyAuthToken(token)
      privyUser = verifyResult
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const privyDid = privyUser.userId

    // Get current user
    const user = await convex.query(api.users.getByPrivyDid, { privyDid })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete from blob storage
    if (user.avatarUrl && user.avatarUrl.includes('vercel-storage.com')) {
      try {
        const blobToken = getBlobToken()
        await del(user.avatarUrl, { token: blobToken })
      } catch (error) {
        console.error('Failed to delete avatar from blob:', error)
      }
    }

    // Update in Convex
    await convex.mutation(api.users.updateAvatar, {
      privyDid,
      avatarUrl: null,
    })

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error removing avatar:', message, error)
    return NextResponse.json(
      { error: `Avatar removal failed: ${message}` },
      { status: 500 }
    )
  }
}
