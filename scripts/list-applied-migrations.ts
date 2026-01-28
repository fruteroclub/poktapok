/**
 * List Applied Migrations
 *
 * Shows all migrations that have been applied to the database
 */

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

async function listMigrations() {
  try {
    const result = await pool.query(`
      SELECT id, hash, created_at
      FROM drizzle_migrations
      ORDER BY id
    `)

    console.log('📋 Applied migrations:\n')

    if (result.rows.length === 0) {
      console.log('   (none)')
    } else {
      result.rows.forEach((row) => {
        const timestamp = parseInt(row.created_at)
        const date = new Date(timestamp)
        const dateStr = date.toISOString().split('T')[0]
        const hashShort = row.hash.substring(0, 12)
        console.log(`   ${row.id}: ${dateStr} (hash: ${hashShort}...)`)
      })
    }

    console.log(`\n✅ Total: ${result.rows.length} migration(s) applied\n`)
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message)
    }
  } finally {
    await pool.end()
  }
}

listMigrations()
