import { db, pool } from '../src/lib/db'
import { sql } from 'drizzle-orm'

async function checkMigrations() {
  try {
    const result = await db.execute(sql`
      SELECT id, hash, created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY created_at
    `)
    console.log('Applied migrations:')
    console.log(result)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

checkMigrations()
