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
      result.rows.forEach((row: any) => {
        console.log(`✅ ${row.title}`)
        console.log(`   ID: ${row.id}`)
        console.log(`   Type: ${row.activity_type}`)
        console.log(`   Status: ${row.status}`)
        console.log(`   Reward: ${row.reward_pulpa_amount} $PULPA`)
        const slots = row.total_available_slots
          ? ` / ${row.total_available_slots}`
          : ''
        console.log(`   Submissions: ${row.current_submissions_count}${slots}`)
        console.log(`   Created: ${row.created_at}`)
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
    statusCounts.rows.forEach((row: any) => {
      console.log(`   ${row.status}: ${row.count}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

checkActivities()
