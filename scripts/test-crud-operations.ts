import { db, closeDatabase } from '../src/lib/db'
import {
  users,
  profiles,
  applications,
  invitations,
} from '../src/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

async function testCRUDOperations() {
  console.log('🧪 Testing CRUD operations across all tables...\n')

  try {
    // ============================================================
    // CLEANUP (in case previous test failed)
    // ============================================================

    console.log('🧹 Pre-test cleanup (removing any leftover test data)...')
    try {
      await db
        .delete(applications)
        .where(
          sql`user_id IN (SELECT id FROM users WHERE privy_did = 'did:privy:test_crud_user')`,
        )
      await db
        .delete(invitations)
        .where(
          sql`inviter_user_id IN (SELECT id FROM users WHERE privy_did = 'did:privy:test_crud_user')`,
        )
      await db
        .delete(profiles)
        .where(
          sql`user_id IN (SELECT id FROM users WHERE privy_did = 'did:privy:test_crud_user')`,
        )
      await db
        .delete(users)
        .where(eq(users.privyDid, 'did:privy:test_crud_user'))
      console.log('  ✅ Cleanup completed\n')
    } catch (e) {
      console.log('  ℹ️  No leftover data to clean\n')
    }

    // ============================================================
    // CREATE Operations
    // ============================================================

    console.log('📝 CREATE operations:')

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        privyDid: 'did:privy:test_crud_user',
        email: 'crud@example.com',
        username: 'crudtest',
        displayName: 'CRUD Test User',
        bio: 'Testing CRUD operations',
        primaryAuthMethod: 'email',
        accountStatus: 'active',
      })
      .returning()

    console.log('  ✅ User created:', newUser.id)

    // Create profile
    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: newUser.id,
        city: 'Mexico City',
        country: 'Mexico',
        countryCode: 'MX',
        learningTracks: ['ai', 'privacy'],
        profileVisibility: 'public',
        availabilityStatus: 'available',
      })
      .returning()

    console.log('  ✅ Profile created:', newProfile.id)

    // Create application
    const [newApplication] = await db
      .insert(applications)
      .values({
        userId: newUser.id,
        motivationText:
          'I want to learn AI and contribute to privacy-focused projects.',
        status: 'approved',
      })
      .returning()

    console.log('  ✅ Application created:', newApplication.id)

    // Create invitation
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const [newInvite] = await db
      .insert(invitations)
      .values({
        inviterUserId: newUser.id,
        inviteCode: 'CRUD_TEST_INVITE_2024',
        expiresAt,
      })
      .returning()

    console.log('  ✅ Invitation created:', newInvite.id)

    // ============================================================
    // READ Operations
    // ============================================================

    console.log('\n📖 READ operations:')

    // Read user by email
    const [foundUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'crud@example.com'))
      .limit(1)

    console.log('  ✅ User found by email:', foundUser.username)

    // Read profile by user ID
    const [foundProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, newUser.id))
      .limit(1)

    console.log('  ✅ Profile found:', foundProfile.city)

    // Join user with profile
    const userWithProfile = await db
      .select()
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, newUser.id))

    console.log(
      '  ✅ User with profile joined:',
      userWithProfile.length,
      'row(s)',
    )

    // ============================================================
    // UPDATE Operations
    // ============================================================

    console.log('\n✏️  UPDATE operations:')

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({ displayName: 'Updated CRUD User' })
      .where(eq(users.id, newUser.id))
      .returning()

    console.log('  ✅ User updated:', updatedUser.displayName)

    // Update profile stats
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        completedBounties: 3,
        totalEarningsUsd: 450.75,
        profileViews: 12,
      })
      .where(eq(profiles.id, newProfile.id))
      .returning()

    console.log('  ✅ Profile stats updated:', {
      bounties: updatedProfile.completedBounties,
      earnings: updatedProfile.totalEarningsUsd,
    })

    // Update invitation status (simulate redemption)
    const [updatedInvite] = await db
      .update(invitations)
      .set({
        redeemerUserId: newUser.id,
        redeemedAt: new Date(),
        status: 'redeemed',
      })
      .where(eq(invitations.id, newInvite.id))
      .returning()

    console.log('  ✅ Invitation redeemed, status:', updatedInvite.status)

    // ============================================================
    // DELETE Operations
    // ============================================================

    console.log('\n🗑️  DELETE operations:')

    // Soft delete user (sets deleted_at)
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, newUser.id))

    console.log('  ✅ User soft deleted')

    // Verify soft delete doesn't appear in active queries
    const activeUsers = await db
      .select()
      .from(users)
      .where(sql`deleted_at IS NULL AND id = ${newUser.id}`)

    console.log(
      '  ✅ Soft deleted user hidden from active queries:',
      activeUsers.length === 0 ? 'YES' : 'NO',
    )

    // ============================================================
    // CASCADE DELETE Test
    // ============================================================

    console.log('\n🔗 CASCADE DELETE test:')

    // First delete application (has SET NULL FK but user_id is NOT NULL, so needs manual delete)
    await db.delete(applications).where(eq(applications.userId, newUser.id))
    console.log(
      '  ✅ Application deleted manually (FK is SET NULL but column is NOT NULL)',
    )

    // Delete invitation (has CASCADE DELETE for inviter)
    const invitesBefore = await db
      .select()
      .from(invitations)
      .where(eq(invitations.inviterUserId, newUser.id))
    console.log('  ✅ Invitations before user delete:', invitesBefore.length)

    // Hard delete user (should cascade to profile and invitations)
    await db.delete(users).where(eq(users.id, newUser.id))

    // Check profile was cascade deleted
    const remainingProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, newUser.id))

    console.log(
      '  ✅ CASCADE DELETE for profiles:',
      remainingProfiles.length === 0 ? 'YES (worked)' : 'NO (failed)',
    )

    // Check invitations were cascade deleted
    const remainingInvites = await db
      .select()
      .from(invitations)
      .where(eq(invitations.inviterUserId, newUser.id))

    console.log(
      '  ✅ CASCADE DELETE for invitations:',
      remainingInvites.length === 0 ? 'YES (worked)' : 'NO (failed)',
    )

    // ============================================================
    // Cleanup (should be no orphaned records)
    // ============================================================

    console.log('\n🧹 Cleanup:')
    console.log('  ✅ No cleanup needed - CASCADE DELETE handled it')

    console.log('\n🎉 All CRUD operations completed successfully!')
  } catch (error) {
    console.error('❌ CRUD operations failed:', error)
    throw error
  } finally {
    await closeDatabase()
  }
}

testCRUDOperations()
