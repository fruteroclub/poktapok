import { db, pool } from '../src/lib/db'
import { sql } from 'drizzle-orm'
import * as fs from 'fs'

async function applyMigration() {
  try {
    // Read the migration SQL
    const migrationSQL = fs.readFileSync(
      '/Users/mel/code/proof-of-community/poktapok/drizzle/migrations/0004_add_sessions_and_session_activities.sql',
      'utf-8'
    )

    console.log('Applying sessions migration...')

    // Execute the migration
    await db.execute(sql.raw(migrationSQL))

    console.log('✅ Migration applied successfully!')
    console.log('Created tables: sessions, session_activities')
    console.log('Added foreign key: attendance.session_id → sessions.id')

  } catch (error) {
    console.error('❌ Error applying migration:', error)
  } finally {
    await pool.end()
  }
}

applyMigration()
