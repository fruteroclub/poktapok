import { db, closeDatabase } from '../src/lib/db'
import { users } from '../src/lib/db/schema'
import { sql } from 'drizzle-orm'

async function testDatabaseConnection() {
  console.log('🧪 Testing database connection...\n')

  try {
    // Test 1: Simple query
    const result = await db.execute(sql`SELECT NOW() as current_time`)
    console.log('✅ Database connected:', result.rows[0])

    // Test 2: Count users
    const userCount = await db.select({ count: sql<number>`COUNT(*)` }).from(users)
    console.log('✅ User count:', userCount[0].count)

    // Test 3: Test all tables exist
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log('\n✅ Tables found:')
    tables.rows.forEach((row: any) => console.log('  -', row.table_name))

    console.log('\n🎉 Database connection tests passed!')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

testDatabaseConnection()
