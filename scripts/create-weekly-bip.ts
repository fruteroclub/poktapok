/**
 * Script to create the weekly Build in Public activity
 *
 * Run with: bun run scripts/create-weekly-bip.ts
 */

import { db } from '../src/lib/db'
import { activities, users } from '../src/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

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
  totalAvailableSlots: null,
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  d.setUTCDate(diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

async function main() {
  console.log('🚀 Creating weekly Build in Public activity...')

  const now = new Date()
  const weekStart = getWeekStart(now)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  console.log(`📅 Week: ${weekStart.toISOString()} - ${weekEnd.toISOString()}`)

  // Check if activity already exists
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
    console.log('⚠️  Activity already exists for this week!')
    console.log(`   ID: ${existingActivity[0].id}`)
    console.log(`   Title: ${existingActivity[0].title}`)
    process.exit(0)
  }

  // Get admin user
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.role, 'admin'))
    .limit(1)

  if (!admin) {
    console.error('❌ No admin user found!')
    process.exit(1)
  }

  console.log(`👤 Using admin: ${admin.username || admin.email}`)

  // Mark previous activities as completed
  const updated = await db
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
    .returning()

  if (updated.length > 0) {
    console.log(`✅ Marked ${updated.length} previous activity(ies) as completed`)
  }

  // Create new activity
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

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
      createdByUserId: admin.id,
      metadata: {
        weekNumber,
        year,
        createdByScript: true,
      },
    })
    .returning()

  console.log('✅ Activity created successfully!')
  console.log(`   ID: ${newActivity.id}`)
  console.log(`   Title: ${newActivity.title}`)
  console.log(`   Reward: ${newActivity.rewardPulpaAmount} PULPA`)
  console.log(`   Expires: ${newActivity.expiresAt}`)

  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
