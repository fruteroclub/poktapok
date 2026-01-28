import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activities } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

/**
 * Weekly Build in Public Activity Cron Job
 *
 * This endpoint is called by Vercel Cron every Monday at 6:00 AM CDMX (12:00 UTC).
 * It creates a new "Build in Public" activity that expires in 7 days.
 *
 * Security: Protected by CRON_SECRET environment variable.
 */

const WEEKLY_ACTIVITY_CONFIG = {
  title: 'Build in Public - Semana',
  description:
    'Comparte tu progreso de aprendizaje o proyecto esta semana. Publica en X (Twitter) mostrando lo que estás construyendo, aprendiendo o creando. Usa el hashtag #BuildInPublic y menciona a @fruteroclub.',
  instructions: `1. Trabaja en tu proyecto o aprendizaje durante la semana
2. Documenta tu progreso con capturas de pantalla o código
3. Crea un post en X (Twitter) compartiendo tu avance
4. Incluye el hashtag #BuildInPublic y menciona @fruteroclub
5. Copia el link de tu post y envíalo como evidencia`,
  activityType: 'build_in_public' as const,
  category: 'Weekly Challenge',
  difficulty: 'beginner' as const,
  rewardPulpaAmount: '2',
  evidenceRequirements: {
    url_required: true,
    screenshot_required: false,
    text_required: true,
  },
  verificationType: 'manual' as const,
  maxSubmissionsPerUser: 1,
  totalAvailableSlots: null, // Unlimited
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('Unauthorized cron request attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const weekStart = getWeekStart(now)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    // Check if activity already exists for this week
    const existingActivity = await db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.activityType, 'build_in_public'),
          eq(activities.category, 'Weekly Challenge'),
          gte(activities.startsAt, weekStart),
          lte(activities.startsAt, weekEnd)
        )
      )
      .limit(1)

    if (existingActivity.length > 0) {
      console.log('Weekly Build in Public activity already exists for this week')
      return NextResponse.json({
        success: true,
        message: 'Activity already exists for this week',
        activityId: existingActivity[0].id,
      })
    }

    // Get admin user ID for created_by (use the first admin)
    const adminResult = await db.execute<{ id: string }>(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    )

    if (!adminResult.rows || adminResult.rows.length === 0) {
      throw new Error('No admin user found to create activity')
    }

    const adminId = adminResult.rows[0].id

    // Mark previous week's activity as completed
    await db
      .update(activities)
      .set({
        status: 'completed',
        updatedAt: now,
      })
      .where(
        and(
          eq(activities.activityType, 'build_in_public'),
          eq(activities.category, 'Weekly Challenge'),
          eq(activities.status, 'active')
        )
      )

    // Get week number for title
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    // Create new weekly activity
    const [newActivity] = await db
      .insert(activities)
      .values({
        title: `${WEEKLY_ACTIVITY_CONFIG.title} ${weekNumber}/${year}`,
        description: WEEKLY_ACTIVITY_CONFIG.description,
        instructions: WEEKLY_ACTIVITY_CONFIG.instructions,
        activityType: WEEKLY_ACTIVITY_CONFIG.activityType,
        category: WEEKLY_ACTIVITY_CONFIG.category,
        difficulty: WEEKLY_ACTIVITY_CONFIG.difficulty,
        rewardPulpaAmount: WEEKLY_ACTIVITY_CONFIG.rewardPulpaAmount,
        evidenceRequirements: WEEKLY_ACTIVITY_CONFIG.evidenceRequirements,
        verificationType: WEEKLY_ACTIVITY_CONFIG.verificationType,
        maxSubmissionsPerUser: WEEKLY_ACTIVITY_CONFIG.maxSubmissionsPerUser,
        totalAvailableSlots: WEEKLY_ACTIVITY_CONFIG.totalAvailableSlots,
        status: 'active',
        startsAt: weekStart,
        expiresAt: weekEnd,
        createdByUserId: adminId,
        metadata: {
          weekNumber,
          year,
          createdByCron: true,
        },
      })
      .returning()

    console.log(`Created weekly Build in Public activity: ${newActivity.id}`)

    return NextResponse.json({
      success: true,
      message: 'Weekly activity created successfully',
      activity: {
        id: newActivity.id,
        title: newActivity.title,
        startsAt: newActivity.startsAt,
        expiresAt: newActivity.expiresAt,
      },
    })
  } catch (error) {
    console.error('Error creating weekly Build in Public activity:', error)
    return NextResponse.json(
      { error: 'Failed to create weekly activity' },
      { status: 500 }
    )
  }
}

/**
 * Get the start of the current week (Monday 00:00 UTC)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setUTCDate(diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
