import { pool } from '../src/lib/db/index'

async function checkMigrations() {
  try {
    const result = await pool.query('SELECT * FROM drizzle_migrations ORDER BY id')
    console.log('\n=== Applied Migrations ===')
    result.rows.forEach((row, i) => {
      console.log(`${i + 1}. ${row.hash}`)
      console.log(`   Applied at: ${row.created_at}`)
    })
    console.log(`\nTotal: ${result.rows.length} migrations applied\n`)
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
    }
  } finally {
    await pool.end()
  }
}

checkMigrations()
