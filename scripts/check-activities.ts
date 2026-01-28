import { db, pool } from '../src/lib/db'
import { sql } from 'drizzle-orm'

async function checkActivities() {
  try {
    console.log('🔍 Checking activities in database...\n')

    // Check if activities table exists and has data
    const result = await db.execute(sql`
      SELECT
        id,
        title,
        activity_type,
        status,
        reward_pulpa_amount,
        current_submissions_count,
        total_available_slots,
        created_at
      FROM activities
      ORDER BY created_at DESC
      LIMIT 10
    `)

    console.log(`📊 Found ${result.rows.length} activities:\n`)

    if (result.rows.length === 0) {
      console.log('⚠️  No activities found in database')
    } else {
      result.rows.forEach((row) => {
        const activity = row as {
          id: string
          title: string
          activity_type: string
          status: string
          reward_pulpa_amount: string
          current_submissions_count: number
          total_available_slots: number | null
          created_at: Date
        }
        console.log(`✅ ${activity.title}`)
        console.log(`   ID: ${activity.id}`)
        console.log(`   Type: ${activity.activity_type}`)
        console.log(`   Status: ${activity.status}`)
        console.log(`   Reward: ${activity.reward_pulpa_amount} $PULPA`)
        const slots = activity.total_available_slots
          ? ` / ${activity.total_available_slots}`
          : ''
        console.log(`   Submissions: ${activity.current_submissions_count}${slots}`)
        console.log(`   Created: ${activity.created_at}`)
        console.log('')
      })
    }

    // Count by status
    const statusCounts = await db.execute(sql`
      SELECT status, COUNT(*) as count
      FROM activities
      GROUP BY status
    `)

    console.log('📈 Activities by status:')
    statusCounts.rows.forEach((row) => {
      const statusRow = row as { status: string; count: string }
      console.log(`   ${statusRow.status}: ${statusRow.count}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

checkActivities()
