-- Migration: Create events table for lu.ma integration
-- Description: Community events with automatic metadata fetch from lu.ma URLs

CREATE TABLE IF NOT EXISTS "events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "program_id" uuid REFERENCES "programs"("id") ON DELETE SET NULL,

  -- Core event info
  "title" varchar(300) NOT NULL,
  "description" text,
  "cover_image" text,

  -- Lu.ma integration
  "luma_url" text NOT NULL,
  "luma_event_id" varchar(100),
  "luma_slug" varchar(100),

  -- Event details
  "event_type" varchar(50) NOT NULL DEFAULT 'in-person',
  "start_date" timestamp with time zone NOT NULL,
  "end_date" timestamp with time zone,
  "timezone" varchar(100) DEFAULT 'America/Mexico_City',

  -- Location
  "location" text,
  "location_details" text,
  "location_url" text,
  "coordinates" jsonb,

  -- Organizer info
  "hosts" jsonb DEFAULT '[]'::jsonb,
  "calendar" varchar(100),

  -- Status
  "status" varchar(20) NOT NULL DEFAULT 'upcoming',
  "is_published" boolean NOT NULL DEFAULT false,
  "is_featured" boolean NOT NULL DEFAULT false,

  -- Registration
  "registration_count" integer DEFAULT 0,
  "max_capacity" integer,
  "registration_type" varchar(50) DEFAULT 'free',

  -- Timestamps
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "events_status_idx" ON "events" ("status");
CREATE INDEX IF NOT EXISTS "events_start_date_idx" ON "events" ("start_date");
CREATE INDEX IF NOT EXISTS "events_program_id_idx" ON "events" ("program_id");
CREATE INDEX IF NOT EXISTS "events_is_published_idx" ON "events" ("is_published");
CREATE INDEX IF NOT EXISTS "events_luma_slug_idx" ON "events" ("luma_slug");
