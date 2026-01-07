-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    name varchar(100) NOT NULL,
    description text NOT NULL,
    program_type varchar(50) NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- Create program_activities table
CREATE TABLE IF NOT EXISTS program_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    activity_id uuid NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    order_index integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT program_activities_program_id_activity_id_unique UNIQUE(program_id, activity_id)
);

-- Create program_enrollments table
CREATE TABLE IF NOT EXISTS program_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    application_id uuid REFERENCES applications(id),
    status varchar(50) DEFAULT 'enrolled' NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    promoted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT program_enrollments_user_id_program_id_unique UNIQUE(user_id, program_id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id uuid NOT NULL,
    program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
    marked_by uuid NOT NULL REFERENCES users(id),
    status varchar(50) NOT NULL,
    notes text,
    marked_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT attendance_user_id_session_id_unique UNIQUE(user_id, session_id)
);

-- Add new columns to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES programs(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS goal text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS github_username varchar(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS twitter_username varchar(100);
