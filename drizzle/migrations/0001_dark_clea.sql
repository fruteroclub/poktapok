CREATE TYPE "public"."activity_status" AS ENUM('draft', 'active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('github_commit', 'x_post', 'photo', 'video', 'blog_post', 'workshop_completion', 'build_in_public', 'code_review', 'custom');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."distribution_method" AS ENUM('manual', 'smart_contract', 'claim_portal');--> statement-breakpoint
CREATE TYPE "public"."distribution_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('pending', 'under_review', 'approved', 'rejected', 'revision_requested', 'distributed');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('manual', 'automatic', 'hybrid');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"instructions" text,
	"activity_type" "activity_type" NOT NULL,
	"category" varchar(100),
	"difficulty" "difficulty" NOT NULL,
	"reward_pulpa_amount" numeric(18, 8) NOT NULL,
	"evidence_requirements" jsonb DEFAULT '{"url_required": false, "screenshot_required": false, "text_required": false}'::jsonb NOT NULL,
	"verification_type" "verification_type" DEFAULT 'manual' NOT NULL,
	"max_submissions_per_user" integer,
	"total_available_slots" integer,
	"current_submissions_count" integer DEFAULT 0 NOT NULL,
	"status" "activity_status" DEFAULT 'draft' NOT NULL,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "title_length" CHECK (char_length("activities"."title") >= 5),
	CONSTRAINT "description_length" CHECK (char_length("activities"."description") >= 20),
	CONSTRAINT "reward_positive" CHECK ("activities"."reward_pulpa_amount" > 0),
	CONSTRAINT "slots_positive" CHECK ("activities"."total_available_slots" IS NULL OR "activities"."total_available_slots" > 0),
	CONSTRAINT "max_submissions_positive" CHECK ("activities"."max_submissions_per_user" IS NULL OR "activities"."max_submissions_per_user" > 0),
	CONSTRAINT "current_count_positive" CHECK ("activities"."current_submissions_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "activity_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"submission_url" varchar(500),
	"evidence_files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"submission_text" text,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_user_id" uuid,
	"review_notes" text,
	"reviewed_at" timestamp with time zone,
	"reward_pulpa_amount" numeric(18, 8),
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "submission_text_length" CHECK ("activity_submissions"."submission_text" IS NULL OR char_length("activity_submissions"."submission_text") <= 1000),
	CONSTRAINT "submission_reward_positive" CHECK ("activity_submissions"."reward_pulpa_amount" IS NULL OR "activity_submissions"."reward_pulpa_amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "pulpa_distributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"pulpa_amount" numeric(18, 8) NOT NULL,
	"recipient_wallet" varchar(42) NOT NULL,
	"chain_id" integer DEFAULT 10 NOT NULL,
	"transaction_hash" varchar(66),
	"distribution_method" "distribution_method" NOT NULL,
	"status" "distribution_status" DEFAULT 'pending' NOT NULL,
	"distributed_by_user_id" uuid NOT NULL,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"initiated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"distributed_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "distribution_pulpa_positive" CHECK ("pulpa_distributions"."pulpa_amount" > 0),
	CONSTRAINT "wallet_format" CHECK ("pulpa_distributions"."recipient_wallet" ~* '^0x[a-fA-F0-9]{40}$'),
	CONSTRAINT "tx_hash_format" CHECK ("pulpa_distributions"."transaction_hash" IS NULL OR "pulpa_distributions"."transaction_hash" ~* '^0x[a-fA-F0-9]{64}$'),
	CONSTRAINT "retry_count_positive" CHECK ("pulpa_distributions"."retry_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "total_pulpa_earned" numeric(18, 8) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "activities_completed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_submissions" ADD CONSTRAINT "submissions_activity_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_submissions" ADD CONSTRAINT "submissions_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_submissions" ADD CONSTRAINT "submissions_reviewed_by_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulpa_distributions" ADD CONSTRAINT "distributions_submission_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."activity_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulpa_distributions" ADD CONSTRAINT "distributions_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulpa_distributions" ADD CONSTRAINT "distributions_activity_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulpa_distributions" ADD CONSTRAINT "distributions_distributed_by_fk" FOREIGN KEY ("distributed_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activities_status" ON "activities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_activities_type" ON "activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "idx_activities_category" ON "activities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_activities_created_by" ON "activities" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_activities_expires_at" ON "activities" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_activities_deleted_at" ON "activities" USING btree ("deleted_at") WHERE "activities"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_activities_search" ON "activities" USING gin (to_tsvector('english', "title" || ' ' || "description"));--> statement-breakpoint
CREATE INDEX "idx_submissions_unique_user_activity" ON "activity_submissions" USING btree ("activity_id","user_id") WHERE "activity_submissions"."status" != 'rejected';--> statement-breakpoint
CREATE INDEX "idx_submissions_activity" ON "activity_submissions" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_user" ON "activity_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_status" ON "activity_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_submissions_reviewed_by" ON "activity_submissions" USING btree ("reviewed_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_submitted_at" ON "activity_submissions" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "idx_submissions_queue" ON "activity_submissions" USING btree ("status","submitted_at") WHERE "activity_submissions"."status" IN ('pending', 'under_review');--> statement-breakpoint
CREATE INDEX "idx_distributions_submission_unique" ON "pulpa_distributions" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "idx_distributions_user" ON "pulpa_distributions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_distributions_activity" ON "pulpa_distributions" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "idx_distributions_status" ON "pulpa_distributions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_distributions_tx_hash" ON "pulpa_distributions" USING btree ("transaction_hash");--> statement-breakpoint
CREATE INDEX "idx_distributions_distributed_by" ON "pulpa_distributions" USING btree ("distributed_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_distributions_distributed_at" ON "pulpa_distributions" USING btree ("distributed_at");--> statement-breakpoint
CREATE INDEX "idx_profiles_pulpa_earned" ON "profiles" USING btree ("total_pulpa_earned");--> statement-breakpoint
CREATE INDEX "idx_profiles_activities_completed" ON "profiles" USING btree ("activities_completed");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "pulpa_earned_positive" CHECK ("profiles"."total_pulpa_earned" >= 0);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "activities_completed_positive" CHECK ("profiles"."activities_completed" >= 0);