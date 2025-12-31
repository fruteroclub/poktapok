import { db, pool } from '../src/lib/db'
import { sql } from 'drizzle-orm'

async function checkSubmissions() {
  try {
    console.log('🔍 Checking submissions in database...\n')

    // Check if submissions table has data
    const result = await db.execute(sql`
      SELECT
        s.id,
        s.activity_id,
        s.user_id,
        s.submission_url,
        s.submission_text,
        s.status,
        s.submitted_at,
        s.reward_pulpa_amount,
        a.title as activity_title,
        u.username,
        u.email
      FROM activity_submissions s
      LEFT JOIN activities a ON s.activity_id = a.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.submitted_at DESC
      LIMIT 10
    `)

    console.log(`📊 Found ${result.rows.length} submissions:\n`)

    if (result.rows.length === 0) {
      console.log('⚠️  No submissions found in database')
    } else {
      result.rows.forEach((row: any) => {
        console.log(`✅ Submission ID: ${row.id}`)
        console.log(`   Activity: ${row.activity_title}`)
        const user = row.username || row.email
        console.log(`   User: ${user}`)
        console.log(`   Status: ${row.status}`)
        const url = row.submission_url || 'N/A'
        console.log(`   URL: ${url}`)
        console.log(`   Submitted: ${row.submitted_at}`)
        console.log('')
      })
    }

    // Count by status
    const statusCounts = await db.execute(sql`
      SELECT status, COUNT(*) as count
      FROM activity_submissions
      GROUP BY status
    `)

    console.log('📈 Submissions by status:')
    if (statusCounts.rows.length === 0) {
      console.log('   No submissions')
    } else {
      statusCounts.rows.forEach((row: any) => {
        console.log(`   ${row.status}: ${row.count}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

checkSubmissions()
