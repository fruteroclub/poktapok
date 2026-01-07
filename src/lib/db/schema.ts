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
export * from '../../../drizzle/schema/projects'
export * from '../../../drizzle/schema/skills'
export * from '../../../drizzle/schema/activities'
export * from '../../../drizzle/schema/programs'
export * from '../../../drizzle/schema/program-activities'
export * from '../../../drizzle/schema/program-enrollments'
export * from '../../../drizzle/schema/attendance'

// ============================================================
// RE-EXPORT TYPES FOR CONVENIENCE
// ============================================================

import type { User, NewUser } from '../../../drizzle/schema/users'
import type { Profile, NewProfile } from '../../../drizzle/schema/profiles'
import type {
  Application,
  NewApplication,
} from '../../../drizzle/schema/applications'
import type {
  Invitation,
  NewInvitation,
} from '../../../drizzle/schema/invitations'
import type { Project, NewProject } from '../../../drizzle/schema/projects'
import type {
  Skill,
  NewSkill,
  UserSkill,
  NewUserSkill,
  ProjectSkill,
  NewProjectSkill,
} from '../../../drizzle/schema/skills'
import type {
  Activity,
  NewActivity,
  ActivitySubmission,
  NewActivitySubmission,
  PulpaDistribution,
  NewPulpaDistribution,
  EvidenceRequirements,
  EvidenceFile,
} from '../../../drizzle/schema/activities'

export type {
  User,
  NewUser,
  Profile,
  NewProfile,
  Application,
  NewApplication,
  Invitation,
  NewInvitation,
  Project,
  NewProject,
  Skill,
  NewSkill,
  UserSkill,
  NewUserSkill,
  ProjectSkill,
  NewProjectSkill,
  Activity,
  NewActivity,
  ActivitySubmission,
  NewActivitySubmission,
  PulpaDistribution,
  NewPulpaDistribution,
  EvidenceRequirements,
  EvidenceFile,
}
