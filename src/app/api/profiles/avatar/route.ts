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

/**
 * POST /api/profiles/avatar
 * Upload user avatar to Vercel Blob Storage
 */
export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
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
      console.error('Privy verification failed:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const privyDid = privyUser.userId

    // Get current user from Convex
    const user = await convex.query(api.users.getByPrivyDid, { privyDid })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

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

    // Delete old avatar if exists
    if (user.avatarUrl && user.avatarUrl.includes('vercel-storage.com')) {
      try {
        await del(user.avatarUrl)
      } catch (error) {
        console.error('Failed to delete old avatar:', error)
      }
    }

    // Upload to Vercel Blob
    const blob = await put(`avatars/${user._id}/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Update in Convex
    await convex.mutation(api.users.updateAvatar, {
      privyDid,
      avatarUrl: blob.url,
    })

    return NextResponse.json({
      success: true,
      avatarUrl: blob.url,
      message: 'Avatar uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
        await del(user.avatarUrl)
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
    console.error('Error removing avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
