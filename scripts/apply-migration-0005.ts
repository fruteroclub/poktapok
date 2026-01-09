import { pool } from '../src/lib/db/index'

async function applyMigration() {
  try {
    console.log('\n=== Applying Migration 0005 ===')
    console.log('Making sessions.program_id nullable...\n')

    await pool.query('ALTER TABLE sessions ALTER COLUMN program_id DROP NOT NULL')

    console.log('✅ Migration applied successfully!\n')
    console.log('Verification:')

    const result = await pool.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'sessions' AND column_name = 'program_id'
    `)

    if (result.rows.length > 0) {
      const col = result.rows[0]
      console.log(`  - Column: ${col.column_name}`)
      console.log(`  - Nullable: ${col.is_nullable}`)

      if (col.is_nullable === 'YES') {
        console.log('\n✅ SUCCESS: program_id is now nullable')
      } else {
        console.log('\n❌ WARNING: program_id is still NOT NULL')
      }
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message)
    }
  } finally {
    await pool.end()
  }
}

applyMigration()
