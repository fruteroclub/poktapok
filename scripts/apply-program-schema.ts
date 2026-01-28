import { pool, closeDatabase } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

async function applySchema() {
  try {
    console.log('Applying program schema...\n')

    // Read SQL file
    const sqlPath = join(__dirname, 'create-program-tables.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // Execute SQL
    await pool.query(sql)

    console.log('✅ Program schema applied successfully!')

  } catch (error) {
    console.error('❌ Error applying schema:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

applySchema()
