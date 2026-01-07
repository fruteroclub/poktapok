import { db, closeDatabase } from '@/lib/db'
import { programs, programActivities, programEnrollments, attendance, applications } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

async function verify() {
  try {
    console.log('Verifying program schema...\n')

    // Test 1: Programs table
    const programCount = await db.select({ count: sql<number>`count(*)` }).from(programs)
    console.log(`✅ Programs table: ${programCount[0].count} records`)

    // Test 2: Program Activities table
    const paCount = await db.select({ count: sql<number>`count(*)` }).from(programActivities)
    console.log(`✅ Program Activities table: ${paCount[0].count} records`)

    // Test 3: Program Enrollments table
    const peCount = await db.select({ count: sql<number>`count(*)` }).from(programEnrollments)
    console.log(`✅ Program Enrollments table: ${peCount[0].count} records`)

    // Test 4: Attendance table
    const arCount = await db.select({ count: sql<number>`count(*)` }).from(attendance)
    console.log(`✅ Attendance table: ${arCount[0].count} records`)

    // Test 5: Applications table extensions
    const appSample = await db.select({
      hasProgram: sql<boolean>`program_id IS NOT NULL`,
      hasGoal: sql<boolean>`goal IS NOT NULL`,
      hasGithub: sql<boolean>`github_username IS NOT NULL`,
      hasTwitter: sql<boolean>`twitter_username IS NOT NULL`,
    }).from(applications).limit(1)
    console.log('✅ Applications table extended with new columns')

    // Test 6: Verify foreign key constraints
    console.log('\n🔗 Testing foreign key constraints...')

    // Try to insert enrollment with invalid program (should fail)
    try {
      await db.insert(programEnrollments).values({
        userId: '00000000-0000-0000-0000-000000000000',
        programId: '00000000-0000-0000-0000-000000000000',
        status: 'enrolled',
      })
      console.log('❌ Foreign key constraint NOT working (invalid insert succeeded)')
    } catch (error) {
      console.log('✅ Foreign key constraints working (invalid insert rejected)')
    }

    console.log('\n✅ Schema verification complete!')

  } catch (error) {
    console.error('❌ Schema verification failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

verify()
