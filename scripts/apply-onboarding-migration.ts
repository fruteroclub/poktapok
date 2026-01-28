import { pool, closeDatabase } from '@/lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

async function applyOnboardingMigration() {
  try {
    console.log('Applying E3-T2 onboarding flow migration...\n')

    // Read the migration SQL
    const sqlPath = join(__dirname, '../drizzle/migrations/0003_onboarding_flow_social_accounts.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // Remove statement breakpoint comments
    const cleanSql = sql.replace(/--> statement-breakpoint/g, '')

    // Execute the migration
    await pool.query(cleanSql)

    console.log('✅ Onboarding flow migration applied successfully!')
    console.log('\nChanges applied:')
    console.log('  - Renamed github_url → github_username')
    console.log('  - Renamed twitter_url → twitter_username')
    console.log('  - Renamed telegram_handle → telegram_username')
    console.log('  - Updated column types to varchar(100)')
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      // PostgreSQL error
      if (error.code === '42P07') {
        console.log('⚠️  Column already exists - migration may have been applied previously')
        return
      }
    }

    console.error('❌ Error applying migration:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

applyOnboardingMigration()
