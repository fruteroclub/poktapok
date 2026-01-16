import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    // Validate username parameter
    if (!username) {
      return NextResponse.json({ available: false }, { status: 400 })
    }

    // Check if username already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    return NextResponse.json({ available: existingUser.length === 0 })
  } catch (error) {
    console.error('Error checking username availability:', error)
    return NextResponse.json({ available: false }, { status: 500 })
  }
}