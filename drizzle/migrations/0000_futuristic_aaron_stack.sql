CREATE TYPE "public"."project_status" AS ENUM('draft', 'wip', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('personal', 'bootcamp', 'hackathon', 'work-related', 'freelance', 'bounty');--> statement-breakpoint
CREATE TYPE "public"."proficiency_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."skill_category" AS ENUM('language', 'framework', 'tool', 'blockchain', 'other');--> statement-breakpoint
ALTER TYPE "public"."account_status" ADD VALUE 'incomplete' BEFORE 'pending';--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(280) NOT NULL,
	"live_url" varchar(500),
	"repository_url" varchar(500),
	"video_url" varchar(500),
	"logo_url" varchar(500),
	"image_urls" varchar(500)[],
	"project_type" "project_type" NOT NULL,
	"project_status" "project_status" DEFAULT 'draft' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"deleted_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "projects_title_length" CHECK (char_length("projects"."title") >= 5 AND char_length("projects"."title") <= 100),
	CONSTRAINT "projects_description_length" CHECK (char_length("projects"."description") >= 20 AND char_length("projects"."description") <= 280),
	CONSTRAINT "projects_at_least_one_url" CHECK ("projects"."repository_url" IS NOT NULL OR "projects"."video_url" IS NOT NULL OR "projects"."live_url" IS NOT NULL),
	CONSTRAINT "projects_live_url_format" CHECK ("projects"."live_url" IS NULL OR "projects"."live_url" ~ '^https?://'),
	CONSTRAINT "projects_repository_url_format" CHECK ("projects"."repository_url" IS NULL OR "projects"."repository_url" ~ '^https?://'),
	CONSTRAINT "projects_video_url_format" CHECK ("projects"."video_url" IS NULL OR "projects"."video_url" ~ '^https?://'),
	CONSTRAINT "projects_logo_url_format" CHECK ("projects"."logo_url" IS NULL OR "projects"."logo_url" ~ '^https?://'),
	CONSTRAINT "projects_view_count_check" CHECK ("projects"."view_count" >= 0),
	CONSTRAINT "projects_display_order_check" CHECK ("projects"."display_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_skills" (
	"project_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_skills_project_id_skill_id_pk" PRIMARY KEY("project_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"category" "skill_category" NOT NULL,
	"description" text,
	"icon_url" varchar(500),
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name"),
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"proficiency_level" "proficiency_level" DEFAULT 'intermediate' NOT NULL,
	"project_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_skill" UNIQUE("user_id","skill_id")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_invited_by_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_approved_by_fk";
--> statement-breakpoint
DROP INDEX "idx_users_invited_by";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "display_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_projects_user_id" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("project_status");--> statement-breakpoint
CREATE INDEX "idx_projects_type" ON "projects" USING btree ("project_type");--> statement-breakpoint
CREATE INDEX "idx_projects_featured" ON "projects" USING btree ("featured") WHERE "projects"."featured" = true;--> statement-breakpoint
CREATE INDEX "idx_projects_display_order" ON "projects" USING btree ("user_id","display_order");--> statement-breakpoint
CREATE INDEX "idx_projects_published_at" ON "projects" USING btree ("published_at") WHERE "projects"."published_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_projects_deleted_at" ON "projects" USING btree ("deleted_at") WHERE "projects"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_project_skills_project_id" ON "project_skills" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_skills_skill_id" ON "project_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "idx_skills_category" ON "skills" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_skills_usage_count" ON "skills" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "idx_user_skills_user_id" ON "user_skills" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_skills_skill_id" ON "user_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "idx_user_skills_project_count" ON "user_skills" USING btree ("project_count");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "invited_by_user_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "approved_by_user_id";