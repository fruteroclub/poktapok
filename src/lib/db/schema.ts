/**
 * Central schema export file
 *
 * Import all tables and types from this file throughout the application
 *
 * Example usage:
 *   import { db } from '@/lib/db'
 *   import { users, type User } from '@/lib/db/schema'
 *
 *   const allUsers = await db.select().from(users)
 */

// ============================================================
// UTILITIES
// ============================================================

export * from '../../../drizzle/schema/utils'

// ============================================================
// TABLES
// ============================================================

export * from '../../../drizzle/schema/users'
export * from '../../../drizzle/schema/profiles'
export * from '../../../drizzle/schema/applications'
export * from '../../../drizzle/schema/invitations'

// ============================================================
// RE-EXPORT TYPES FOR CONVENIENCE
// ============================================================

import type { User, NewUser } from '../../../drizzle/schema/users'
import type { Profile, NewProfile } from '../../../drizzle/schema/profiles'
import type { Application, NewApplication } from '../../../drizzle/schema/applications'
import type { Invitation, NewInvitation } from '../../../drizzle/schema/invitations'

export type {
  User,
  NewUser,
  Profile,
  NewProfile,
  Application,
  NewApplication,
  Invitation,
  NewInvitation,
}
