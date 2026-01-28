-- Migration: Create activity_relationships_view for automatic transitive relationship computation
-- Date: 2025-01-09
-- Purpose: Compute activity relationships (standalone, program-linked, session-linked, transitive)
--          automatically via database view instead of application logic

CREATE VIEW activity_relationships_view AS
SELECT
  -- Activity identification
  a.id AS activity_id,
  a.title AS activity_title,
  a.activity_type,
  a.difficulty,
  a.reward_pulpa_amount,
  a.status,

  -- Direct program link (via program_activities junction)
  pa.program_id AS direct_program_id,
  p1.name AS direct_program_name,
  pa.is_required AS is_program_required,
  pa.order_index AS program_order_index,

  -- Session link (via session_activities junction)
  sa.session_id AS session_id,
  s.title AS session_title,
  s.session_date,
  sa.order_index AS session_order_index,

  -- Transitive program link (via session → program)
  s.program_id AS transitive_program_id,
  p2.name AS transitive_program_name,

  -- Computed: final effective program relationship
  COALESCE(pa.program_id, s.program_id) AS effective_program_id,
  COALESCE(p1.name, p2.name) AS effective_program_name,

  -- Relationship type indicator
  CASE
    WHEN pa.program_id IS NOT NULL AND sa.session_id IS NOT NULL THEN 'both'
    WHEN pa.program_id IS NOT NULL THEN 'program'
    WHEN sa.session_id IS NOT NULL AND s.program_id IS NOT NULL THEN 'session_transitive'
    WHEN sa.session_id IS NOT NULL THEN 'session'
    ELSE 'standalone'
  END AS relationship_type,

  -- Timestamps
  a.created_at,
  a.updated_at

FROM activities a

-- Direct program link
LEFT JOIN program_activities pa ON pa.activity_id = a.id
LEFT JOIN programs p1 ON p1.id = pa.program_id

-- Session link
LEFT JOIN session_activities sa ON sa.activity_id = a.id
LEFT JOIN sessions s ON s.id = sa.session_id

-- Transitive program link
LEFT JOIN programs p2 ON p2.id = s.program_id

WHERE a.deleted_at IS NULL;

-- Add comment to view for documentation
COMMENT ON VIEW activity_relationships_view IS
'Automatically computes activity relationships including transitive program links via sessions.
Relationship types: standalone (no links), program (direct), session (session only),
session_transitive (session → program), both (direct program + session)';
