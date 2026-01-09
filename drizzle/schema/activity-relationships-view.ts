import { pgView, uuid, varchar, text, decimal, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/**
 * Activity Relationships View
 *
 * Automatically computes activity relationships including transitive program links.
 * This view is created by migration 0006_create_activity_relationships_view.sql
 *
 * Relationship types:
 * - standalone: Activity has no program or session links
 * - program: Activity is directly linked to a program (via program_activities)
 * - session: Activity is linked to a session (via session_activities) but session has no program
 * - session_transitive: Activity is linked to a session that belongs to a program (inherits program)
 * - both: Activity is linked to both a program directly AND a session
 */
export const activityRelationshipsView = pgView('activity_relationships_view').as((qb) =>
  qb
    .select({
      // Activity core fields
      activityId: sql<string>`activity_id`.as('activity_id'),
      activityTitle: sql<string>`activity_title`.as('activity_title'),
      activityType: sql<string>`activity_type`.as('activity_type'),
      difficulty: sql<string>`difficulty`.as('difficulty'),
      rewardPulpaAmount: sql<string>`reward_pulpa_amount`.as('reward_pulpa_amount'),
      status: sql<string>`status`.as('status'),

      // Direct program link (via program_activities junction)
      directProgramId: sql<string | null>`direct_program_id`.as('direct_program_id'),
      directProgramName: sql<string | null>`direct_program_name`.as('direct_program_name'),
      isProgramRequired: sql<boolean | null>`is_program_required`.as('is_program_required'),
      programOrderIndex: sql<number | null>`program_order_index`.as('program_order_index'),

      // Session link (via session_activities junction)
      sessionId: sql<string | null>`session_id`.as('session_id'),
      sessionTitle: sql<string | null>`session_title`.as('session_title'),
      sessionDate: sql<string | null>`session_date`.as('session_date'),
      sessionOrderIndex: sql<number | null>`session_order_index`.as('session_order_index'),

      // Transitive program link (via session → program)
      transitiveProgramId: sql<string | null>`transitive_program_id`.as('transitive_program_id'),
      transitiveProgramName: sql<string | null>`transitive_program_name`.as('transitive_program_name'),

      // Computed effective relationship
      effectiveProgramId: sql<string | null>`effective_program_id`.as('effective_program_id'),
      effectiveProgramName: sql<string | null>`effective_program_name`.as('effective_program_name'),

      // Relationship type indicator
      relationshipType: sql<'standalone' | 'program' | 'session' | 'session_transitive' | 'both'>`relationship_type`.as(
        'relationship_type'
      ),

      // Timestamps
      createdAt: sql<string>`created_at`.as('created_at'),
      updatedAt: sql<string>`updated_at`.as('updated_at'),
    })
    .from(sql`activity_relationships_view`)
)

export type ActivityRelationshipView = typeof activityRelationshipsView.$inferSelect
