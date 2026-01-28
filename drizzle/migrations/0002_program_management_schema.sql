-- Migration: E3-T1 Program Management Schema
-- Date: 2026-01-06
-- Description: Add programs, enrollments, activities linking, and attendance tracking

-- ============================================================
-- CREATE NEW TABLES
-- ============================================================

-- Programs table (De Cero a Chamba, DeFi-esta, Open)
CREATE TABLE IF NOT EXISTS "programs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(100) NOT NULL,
    "description" text NOT NULL,
    "program_type" varchar(50) NOT NULL,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint

-- Program Activities junction table
CREATE TABLE IF NOT EXISTS "program_activities" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "program_id" uuid NOT NULL,
    "activity_id" uuid NOT NULL,
    "is_required" boolean DEFAULT false NOT NULL,
    "order_index" integer,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "program_activities_program_id_activity_id_unique" UNIQUE("program_id","activity_id")
);
--> statement-breakpoint

-- Program Enrollments table
CREATE TABLE IF NOT EXISTS "program_enrollments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "program_id" uuid NOT NULL,
    "application_id" uuid,
    "status" varchar(50) DEFAULT 'enrolled' NOT NULL,
    "enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
    "completed_at" timestamp with time zone,
    "promoted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT "program_enrollments_user_id_program_id_unique" UNIQUE("user_id","program_id")
);
--> statement-breakpoint

-- Attendance table
CREATE TABLE IF NOT EXISTS "attendance" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "session_id" uuid NOT NULL,
    "program_id" uuid,
    "marked_by" uuid NOT NULL,
    "status" varchar(50) NOT NULL,
    "notes" text,
    "marked_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT "attendance_user_id_session_id_unique" UNIQUE("user_id","session_id")
);
--> statement-breakpoint

-- ============================================================
-- ALTER EXISTING TABLES
-- ============================================================

-- Add new columns to applications table
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "program_id" uuid;
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "goal" text;
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "github_username" varchar(100);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "twitter_username" varchar(100);
--> statement-breakpoint

-- ============================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================================

ALTER TABLE "program_activities" ADD CONSTRAINT "program_activities_program_id_programs_id_fk"
    FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_program_id_programs_id_fk"
    FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_application_id_applications_id_fk"
    FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "attendance" ADD CONSTRAINT "attendance_program_id_programs_id_fk"
    FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "attendance" ADD CONSTRAINT "attendance_marked_by_users_id_fk"
    FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "applications" ADD CONSTRAINT "applications_program_id_programs_id_fk"
    FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint

-- ============================================================
-- SEED INITIAL DATA
-- ============================================================

-- Insert initial programs (only if table is empty)
INSERT INTO "programs" ("name", "description", "program_type", "is_active")
SELECT
    'De Cero a Chamba',
    'Learn web development fundamentals and land your first client. Build practical skills in HTML, CSS, JavaScript, and modern frameworks while completing real-world projects.',
    'cohort',
    true
WHERE NOT EXISTS (SELECT 1 FROM "programs" WHERE "name" = 'De Cero a Chamba');
--> statement-breakpoint

INSERT INTO "programs" ("name", "description", "program_type", "is_active")
SELECT
    'DeFi-esta',
    'Master DeFi protocols and build decentralized applications. Learn smart contract development, Web3 integration, and blockchain fundamentals through hands-on projects.',
    'cohort',
    true
WHERE NOT EXISTS (SELECT 1 FROM "programs" WHERE "name" = 'DeFi-esta');
--> statement-breakpoint

INSERT INTO "programs" ("name", "description", "program_type", "is_active")
SELECT
    'Open',
    'Self-directed learning with community support. Work on your own projects while staying connected with the community. Perfect for independent learners and ongoing skill development.',
    'evergreen',
    true
WHERE NOT EXISTS (SELECT 1 FROM "programs" WHERE "name" = 'Open');
--> statement-breakpoint
