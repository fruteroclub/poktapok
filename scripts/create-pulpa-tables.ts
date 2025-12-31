import { db, pool } from '../src/lib/db'
import { sql } from 'drizzle-orm'

async function createPulpaTables() {
  try {
    console.log('🔧 Creating PULPA tables...\n')

    // Create enums
    console.log('Creating enums...')

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE activity_type AS ENUM(
          'github_commit',
          'x_post',
          'photo',
          'video',
          'blog_post',
          'workshop_completion',
          'build_in_public',
          'code_review',
          'custom'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE difficulty AS ENUM('beginner', 'intermediate', 'advanced');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE verification_type AS ENUM('manual', 'automatic', 'hybrid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE activity_status AS ENUM('draft', 'active', 'paused', 'completed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE submission_status AS ENUM('pending', 'under_review', 'approved', 'rejected', 'revision_requested', 'distributed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE distribution_status AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE distribution_method AS ENUM('manual', 'smart_contract', 'claim_portal');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    console.log('✅ Enums created\n')

    // Create activities table
    console.log('Creating activities table...')
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar(200) NOT NULL,
        description text NOT NULL,
        instructions text,
        activity_type activity_type NOT NULL,
        category varchar(100),
        difficulty difficulty NOT NULL,
        reward_pulpa_amount decimal(18, 8) NOT NULL,
        evidence_requirements jsonb NOT NULL DEFAULT '{"url_required": false, "screenshot_required": false, "text_required": false}'::jsonb,
        verification_type verification_type NOT NULL DEFAULT 'manual',
        max_submissions_per_user integer,
        total_available_slots integer,
        current_submissions_count integer NOT NULL DEFAULT 0,
        status activity_status NOT NULL DEFAULT 'draft',
        starts_at timestamp with time zone,
        expires_at timestamp with time zone,
        created_by_user_id uuid NOT NULL REFERENCES users(id),
        created_at timestamp DEFAULT NOW() NOT NULL,
        updated_at timestamp DEFAULT NOW() NOT NULL,
        deleted_at timestamp,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb
      )
    `)
    console.log('✅ Activities table created\n')

    // Create activity_submissions table
    console.log('Creating activity_submissions table...')
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_submissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        submission_url varchar(500),
        submission_text text,
        evidence_files jsonb DEFAULT '[]'::jsonb,
        status submission_status NOT NULL DEFAULT 'pending',
        reward_pulpa_amount decimal(18, 8),
        reviewed_by_user_id uuid REFERENCES users(id),
        review_notes text,
        submitted_at timestamp DEFAULT NOW() NOT NULL,
        reviewed_at timestamp,
        created_at timestamp DEFAULT NOW() NOT NULL,
        updated_at timestamp DEFAULT NOW() NOT NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        UNIQUE(activity_id, user_id)
      )
    `)
    console.log('✅ Activity submissions table created\n')

    // Create pulpa_distributions table
    console.log('Creating pulpa_distributions table...')
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pulpa_distributions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        submission_id uuid NOT NULL REFERENCES activity_submissions(id) ON DELETE CASCADE,
        activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pulpa_amount decimal(18, 8) NOT NULL,
        distribution_method distribution_method NOT NULL,
        transaction_hash varchar(66),
        status distribution_status NOT NULL DEFAULT 'pending',
        error_message text,
        distributed_at timestamp DEFAULT NOW() NOT NULL,
        created_at timestamp DEFAULT NOW() NOT NULL,
        updated_at timestamp DEFAULT NOW() NOT NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        UNIQUE(submission_id)
      )
    `)
    console.log('✅ Pulpa distributions table created\n')

    // Create indexes
    console.log('Creating indexes...')
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_submissions_status ON activity_submissions(status)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_submissions_user ON activity_submissions(user_id)`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_distributions_status ON pulpa_distributions(status)`)
    console.log('✅ Indexes created\n')

    console.log('🎉 All PULPA tables created successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await pool.end()
  }
}

createPulpaTables()
