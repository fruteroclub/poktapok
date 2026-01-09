-- Add sessions table for program content delivery
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"session_type" varchar(50) DEFAULT 'in-person' NOT NULL,
	"session_date" timestamp with time zone NOT NULL,
	"duration" varchar(50),
	"location" text,
	"instructors" jsonb DEFAULT '[]'::jsonb,
	"materials" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- Add session_activities junction table
CREATE TABLE "session_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"order_index" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_activities_session_id_activity_id_unique" UNIQUE("session_id","activity_id")
);

-- Add foreign key constraints
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "session_activities" ADD CONSTRAINT "session_activities_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "session_activities" ADD CONSTRAINT "session_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE cascade ON UPDATE no action;

-- Update attendance table to reference sessions (if not already done)
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE cascade ON UPDATE no action;
