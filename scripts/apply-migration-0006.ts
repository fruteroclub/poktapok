import { pool } from '../src/lib/db/index'
import { readFileSync } from 'fs'
import { join } from 'path'

async function applyMigration() {
  try {
    console.log('\n=== Applying Migration 0006 ===')
    console.log('Creating activity_relationships_view...\n')

    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'drizzle/migrations/0006_create_activity_relationships_view.sql')
    const sql = readFileSync(migrationPath, 'utf-8')

    // Apply the migration
    await pool.query(sql)

    console.log('✅ Migration applied successfully!\n')
    console.log('Verification:')

    // Verify the view was created
    const result = await pool.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_name = 'activity_relationships_view' AND table_type = 'VIEW'
    `)

    if (result.rows.length > 0) {
      console.log(`  - View: ${result.rows[0].table_name}`)
      console.log(`  - Type: ${result.rows[0].table_type}`)
      console.log('\n✅ SUCCESS: activity_relationships_view created')

      // Test query
      const testResult = await pool.query(`
        SELECT relationship_type, COUNT(*) as count
        FROM activity_relationships_view
        GROUP BY relationship_type
      `)

      if (testResult.rows.length > 0) {
        console.log('\nRelationship type distribution:')
        testResult.rows.forEach(row => {
          console.log(`  - ${row.relationship_type}: ${row.count} activities`)
        })
      } else {
        console.log('\n  (No activities in database yet)')
      }
    } else {
      console.log('\n❌ WARNING: View was not created')
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
