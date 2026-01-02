import { db, pool } from '../src/lib/db'
import { sql } from 'drizzle-orm'

async function verifyCompleteSchema() {
  try {
    console.log('🔍 Verifying complete PULPA schema...\n')

    // Check profiles table has PULPA columns
    console.log('1. Checking profiles table columns...')
    const profilesColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'profiles'
      AND column_name IN ('activities_completed', 'total_pulpa_earned')
      ORDER BY column_name
    `)

    if (profilesColumns.rows.length === 0) {
      console.log('❌ PULPA columns missing from profiles table!')
      console.log('   Need: activities_completed, total_pulpa_earned')
    } else {
      console.log('✅ Profiles table has PULPA columns:')
      profilesColumns.rows.forEach((row: any) => {
        console.log(`   - ${row.column_name}: ${row.data_type}`)
      })
    }

    // Check all PULPA tables exist
    console.log('\n2. Checking PULPA tables...')
    const tables = ['activities', 'activity_submissions', 'pulpa_distributions']
    for (const table of tables) {
      const exists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        )
      `)
      if (exists.rows[0].exists) {
        console.log(`✅ ${table} exists`)
      } else {
        console.log(`❌ ${table} MISSING!`)
      }
    }

    // Check foreign key constraints
    console.log('\n3. Checking foreign key constraints...')
    const constraints = await db.execute(sql`
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('activities', 'activity_submissions', 'pulpa_distributions')
      ORDER BY tc.table_name, tc.constraint_name
    `)

    console.log(`Found ${constraints.rows.length} foreign key constraints:`)
    constraints.rows.forEach((row: any) => {
      console.log(
        `   ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`,
      )
    })

    // Check indexes
    console.log('\n4. Checking indexes...')
    const indexes = await db.execute(sql`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename IN ('activities', 'activity_submissions', 'pulpa_distributions')
      ORDER BY tablename, indexname
    `)

    console.log(`Found ${indexes.rows.length} indexes:`)
    indexes.rows.forEach((row: any) => {
      console.log(`   ${row.tablename}.${row.indexname}`)
    })

    // Test if we can insert a record
    console.log('\n5. Testing insert operations...')

    // Get admin user
    const adminUser = await db.execute(sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `)

    if (adminUser.rows.length === 0) {
      console.log('⚠️  No admin user found for testing')
    } else {
      console.log('✅ Admin user found for testing')

      // Try to insert a test activity (will rollback)
      try {
        await db.transaction(async (tx) => {
          const result = await tx.execute(sql`
            INSERT INTO activities (
              title,
              description,
              activity_type,
              difficulty,
              reward_pulpa_amount,
              created_by_user_id
            ) VALUES (
              'Test Activity',
              'Test Description',
              'github_commit',
              'beginner',
              10.0,
              ${adminUser.rows[0].id}
            )
            RETURNING id
          `)
          console.log('✅ Test insert successful (will rollback)')
          throw new Error('Rollback test transaction')
        })
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'Rollback test transaction'
        ) {
          console.log('✅ Transaction rollback successful')
        } else {
          console.log('❌ Insert test failed:', error)
        }
      }
    }

    console.log('\n🎉 Schema verification complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

verifyCompleteSchema()
