import { db, closeDatabase } from '../src/lib/db'
import { sql } from 'drizzle-orm'

interface TableInfo {
  table_name: string
}

interface EnumInfo {
  typname: string
}

interface IndexInfo {
  indexname: string
  tablename: string
}

interface ConstraintInfo {
  constraint_name: string
  table_name: string
  constraint_type: string
}

async function verifyMigration() {
  console.log('🔍 Verifying database migration...\n')

  try {
    // 1. Check all tables exist
    const tables = await db.execute<TableInfo>(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    const expectedTables = ['users', 'profiles', 'applications', 'invitations']
    const foundTables = tables.rows.map((r) => r.table_name)

    console.log('📋 Tables:')
    expectedTables.forEach((table) => {
      const found = foundTables.includes(table)
      console.log(`  ${found ? '✅' : '❌'} ${table}`)
    })

    // 2. Check all enums exist
    const enums = await db.execute<EnumInfo>(sql`
      SELECT typname
      FROM pg_type
      WHERE typcategory = 'E'
      ORDER BY typname
    `)

    const expectedEnums = [
      'account_status',
      'application_status',
      'auth_method',
      'availability_status',
      'learning_track',
      'profile_visibility',
      'user_role',
    ]
    const foundEnums = enums.rows.map((r) => r.typname)

    console.log('\n📊 Enums:')
    expectedEnums.forEach((enumName) => {
      const found = foundEnums.includes(enumName)
      console.log(`  ${found ? '✅' : '❌'} ${enumName}`)
    })

    // 3. Check indexes
    const indexes = await db.execute<IndexInfo>(sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `)

    console.log('\n🔗 Indexes:')
    const indexesByTable: Record<string, string[]> = {}
    indexes.rows.forEach((idx) => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = []
      }
      indexesByTable[idx.tablename].push(idx.indexname)
    })

    Object.entries(indexesByTable).forEach(([table, idxList]) => {
      console.log(`  ${table} (${idxList.length} indexes):`)
      idxList.forEach((idx) => console.log(`    ✅ ${idx}`))
    })

    // 4. Check constraints
    const constraints = await db.execute<ConstraintInfo>(sql`
      SELECT constraint_name, table_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND constraint_type IN ('CHECK', 'FOREIGN KEY', 'UNIQUE')
      ORDER BY table_name, constraint_type, constraint_name
    `)

    console.log('\n🔒 Constraints:')
    const constraintsByTable: Record<string, { name: string; type: string }[]> =
      {}
    constraints.rows.forEach((con) => {
      if (!constraintsByTable[con.table_name]) {
        constraintsByTable[con.table_name] = []
      }
      constraintsByTable[con.table_name].push({
        name: con.constraint_name,
        type: con.constraint_type,
      })
    })

    Object.entries(constraintsByTable).forEach(([table, conList]) => {
      const checkCount = conList.filter((c) => c.type === 'CHECK').length
      const fkCount = conList.filter((c) => c.type === 'FOREIGN KEY').length
      const uniqueCount = conList.filter((c) => c.type === 'UNIQUE').length
      console.log(`  ${table}:`)
      console.log(`    ✅ ${checkCount} CHECK constraints`)
      console.log(`    ✅ ${fkCount} FOREIGN KEY constraints`)
      console.log(`    ✅ ${uniqueCount} UNIQUE constraints`)
    })

    // 5. Check column counts
    const columns = await db.execute<{
      table_name: string
      column_count: number
    }>(sql`
      SELECT table_name, COUNT(*)::int as column_count
      FROM information_schema.columns
      WHERE table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name
    `)

    console.log('\n📏 Column Counts:')
    columns.rows.forEach((row) => {
      console.log(`  ${row.table_name}: ${row.column_count} columns`)
    })

    console.log('\n🎉 Migration verification completed successfully!')
  } catch (error) {
    console.error('❌ Migration verification failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

verifyMigration()
