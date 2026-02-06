/**
 * Audit current Neon database for Convex migration
 * 
 * Outputs:
 * - Total row counts per table
 * - Admin users list
 * - Published events count
 * - Sample data structures
 */

import { db, closeDatabase } from '../src/lib/db';
import { 
  users, 
  events, 
  profiles,
  applications,
  invitations,
  programs,
  sessions,
  activities,
  attendance,
  projects,
  skills,
  programEnrollments,
  sessionActivities,
  programActivities,
} from '../src/lib/db/schema';
import { eq, isNull, count } from 'drizzle-orm';

async function auditDatabase() {
  console.log('🔍 Auditing Neon Database for Convex Migration\n');
  console.log('='.repeat(60));

  try {
    // ============================================================
    // 1. USERS - Critical for migration
    // ============================================================
    console.log('\n📊 USERS TABLE');
    console.log('-'.repeat(60));

    const allUsersCount = await db.select({ count: count() }).from(users);
    console.log(`Total users: ${allUsersCount[0].count}`);

    const activeUsers = await db
      .select({ count: count() })
      .from(users)
      .where(isNull(users.deletedAt));
    console.log(`Active users (not soft-deleted): ${activeUsers[0].count}`);

    // Admins
    const admins = await db
      .select()
      .from(users)
      .where(eq(users.role, 'admin'))
      .where(isNull(users.deletedAt));
    
    console.log(`\n👑 ADMINS (${admins.length}):`);
    admins.forEach(admin => {
      console.log(`  - ${admin.displayName || admin.username || 'Unknown'}`);
      console.log(`    Email: ${admin.email || 'N/A'}`);
      console.log(`    Role: ${admin.role}`);
      console.log(`    Status: ${admin.accountStatus}`);
      console.log(`    Privy DID: ${admin.privyDid}`);
      console.log('');
    });

    // Role breakdown
    console.log('Role breakdown:');
    const memberCount = await db.select({ count: count() }).from(users).where(eq(users.role, 'member'));
    const modCount = await db.select({ count: count() }).from(users).where(eq(users.role, 'moderator'));
    console.log(`  Members: ${memberCount[0].count}`);
    console.log(`  Moderators: ${modCount[0].count}`);
    console.log(`  Admins: ${admins.length}`);

    // ============================================================
    // 2. EVENTS - High priority
    // ============================================================
    console.log('\n📅 EVENTS TABLE');
    console.log('-'.repeat(60));

    const allEventsCount = await db.select({ count: count() }).from(events);
    console.log(`Total events: ${allEventsCount[0].count}`);

    const publishedEvents = await db
      .select()
      .from(events)
      .where(eq(events.isPublished, true));
    
    console.log(`Published events: ${publishedEvents.length}`);

    if (publishedEvents.length > 0) {
      console.log('\n📌 Sample published events:');
      publishedEvents.slice(0, 5).forEach(event => {
        console.log(`  - ${event.title}`);
        console.log(`    Luma: ${event.lumaUrl}`);
        console.log(`    Start: ${event.startDate}`);
        console.log(`    Status: ${event.status}`);
        console.log('');
      });
    }

    // ============================================================
    // 3. OTHER TABLES - Overview
    // ============================================================
    console.log('\n📋 OTHER TABLES (Row Counts)');
    console.log('-'.repeat(60));

    const tables = [
      { name: 'profiles', table: profiles },
      { name: 'applications', table: applications },
      { name: 'invitations', table: invitations },
      { name: 'programs', table: programs },
      { name: 'sessions', table: sessions },
      { name: 'activities', table: activities },
      { name: 'attendance', table: attendance },
      { name: 'projects', table: projects },
      { name: 'skills', table: skills },
      { name: 'program_enrollments', table: programEnrollments },
      { name: 'session_activities', table: sessionActivities },
      { name: 'program_activities', table: programActivities },
    ];

    for (const { name, table } of tables) {
      try {
        const rowCount = await db.select({ count: count() }).from(table as any);
        console.log(`  ${name.padEnd(25)} ${rowCount[0].count} rows`);
      } catch (error) {
        console.log(`  ${name.padEnd(25)} Error: ${(error as Error).message}`);
      }
    }

    // ============================================================
    // 4. MIGRATION SUMMARY
    // ============================================================
    console.log('\n\n' + '='.repeat(60));
    console.log('📦 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log('\n🎯 Priority Data to Migrate:');
    console.log(`  1. Admins: ${admins.length} users`);
    console.log(`  2. Published Events: ${publishedEvents.length} events`);
    console.log(`  3. All Active Users: ${activeUsers[0].count} users`);
    console.log(`  4. Total Events: ${allEventsCount[0].count} events`);

    console.log('\n⚠️  Luma Calendar Config:');
    const lumaCalendars = publishedEvents
      .map(e => e.calendar)
      .filter((v, i, a) => v && a.indexOf(v) === i);
    
    if (lumaCalendars.length > 0) {
      console.log(`  Calendars found: ${lumaCalendars.join(', ')}`);
      console.log('  ⚠️  Add these to Convex cron config');
    } else {
      console.log('  No calendar names found in events');
      console.log('  ⚠️  Need to identify Luma calendar slug manually');
    }

    console.log('\n✅ Next Steps:');
    console.log('  1. Create convex/schema.ts with table definitions');
    console.log('  2. Run: npm install convex && npx convex dev');
    console.log('  3. Write migration script to export admin data');
    console.log('  4. Import admins + events to Convex');
    console.log('  5. Setup Luma sync cron in convex/crons.ts');

    console.log('\n📝 Export commands for manual migration:');
    console.log('  Admin users:');
    console.log(`    bun run scripts/export-admins.ts > admins.json`);
    console.log('  Published events:');
    console.log(`    bun run scripts/export-events.ts > events.json`);

  } catch (error) {
    console.error('❌ Error during audit:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run audit
auditDatabase()
  .then(() => {
    console.log('\n✅ Audit complete\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Audit failed:', error);
    process.exit(1);
  });
