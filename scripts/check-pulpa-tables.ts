import { db, pool } from '../src/lib/db'
import { sql } from 'drizzle-orm'

async function checkPulpaTables() {
  try {
    console.log('🔍 Checking for PULPA tables...\n')

    // Check for activities table
    const activitiesCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'activities'
      )
    `)
    console.log('activities table exists:', activitiesCheck.rows[0].exists)

    // Check for activity_submissions table
    const submissionsCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'activity_submissions'
      )
    `)
    console.log('activity_submissions table exists:', submissionsCheck.rows[0].exists)

    // Check for pulpa_distributions table
    const distributionsCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'pulpa_distributions'
      )
    `)
    console.log('pulpa_distributions table exists:', distributionsCheck.rows[0].exists)

    // List all tables
    const allTables = await db.execute(sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `)
    console.log('\n📋 All tables in database:')
    allTables.rows.forEach((row: any) => {
      console.log(`  - ${row.tablename}`)
    })

    // Check migrations journal
    const journalCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'drizzle'
        AND table_name = '__drizzle_migrations'
      )
    `)

    if (journalCheck.rows[0].exists) {
      const migrations = await db.execute(sql`
        SELECT * FROM drizzle.__drizzle_migrations
        ORDER BY created_at DESC
      `)
      console.log('\n📝 Applied migrations:')
      migrations.rows.forEach((row: any) => {
        console.log(`  - ${row.created_at}: ${row.hash}`)
      })
    } else {
      console.log('\n⚠️  No migration journal found')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

checkPulpaTables()
