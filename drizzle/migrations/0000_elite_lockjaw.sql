CREATE TYPE "public"."account_status" AS ENUM('incomplete', 'pending', 'active', 'suspended', 'banned');--> statement-breakpoint
CREATE TYPE "public"."auth_method" AS ENUM('email', 'wallet', 'social');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('member', 'moderator', 'admin');--> statement-breakpoint
CREATE TYPE "public"."availability_status" AS ENUM('available', 'open_to_offers', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."learning_track" AS ENUM('ai', 'crypto', 'privacy');--> statement-breakpoint
CREATE TYPE "public"."profile_visibility" AS ENUM('public', 'members', 'private');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"privy_did" varchar(255) NOT NULL,
	"email" varchar(255),
	"username" varchar(50),
	"display_name" varchar(100),
	"bio" text,
	"avatar_url" varchar(500),
	"ext_wallet" varchar(42),
	"app_wallet" varchar(42),
	"primary_auth_method" "auth_method" NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"account_status" "account_status" DEFAULT 'pending' NOT NULL,
	"invited_by_user_id" uuid,
	"approved_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"privy_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "users_privy_did_unique" UNIQUE("privy_did"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "email_format" CHECK ("users"."email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
	CONSTRAINT "username_format" CHECK ("users"."username" ~* '^[a-z0-9_]{3,50}$'),
	CONSTRAINT "ext_wallet_format" CHECK ("users"."ext_wallet" IS NULL OR "users"."ext_wallet" ~* '^0x[a-fA-F0-9]{40}$'),
	CONSTRAINT "app_wallet_format" CHECK ("users"."app_wallet" IS NULL OR "users"."app_wallet" ~* '^0x[a-fA-F0-9]{40}$')
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"city" varchar(100),
	"country" varchar(100),
	"country_code" varchar(2),
	"github_url" varchar(500),
	"twitter_url" varchar(500),
	"linkedin_url" varchar(500),
	"telegram_handle" varchar(100),
	"learning_tracks" "learning_track"[],
	"profile_visibility" "profile_visibility" DEFAULT 'public' NOT NULL,
	"availability_status" "availability_status" DEFAULT 'available' NOT NULL,
	"completed_bounties" integer DEFAULT 0 NOT NULL,
	"total_earnings_usd" real DEFAULT 0 NOT NULL,
	"profile_views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "country_code_format" CHECK ("profiles"."country_code" IS NULL OR "profiles"."country_code" ~* '^[A-Z]{2}$'),
	CONSTRAINT "completed_bounties_positive" CHECK ("profiles"."completed_bounties" >= 0),
	CONSTRAINT "total_earnings_positive" CHECK ("profiles"."total_earnings_usd" >= 0),
	CONSTRAINT "profile_views_positive" CHECK ("profiles"."profile_views" >= 0)
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"motivation_text" text NOT NULL,
	"status" "application_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_user_id" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "applications_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_user_id" uuid NOT NULL,
	"redeemer_user_id" uuid,
	"invite_code" varchar(32) NOT NULL,
	"redeemed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "invitations_invite_code_unique" UNIQUE("invite_code"),
	CONSTRAINT "invite_code_format" CHECK ("invitations"."invite_code" ~* '^[A-Za-z0-9_-]{16,32}$')
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_approved_by_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewed_by_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_fk" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_redeemer_fk" FOREIGN KEY ("redeemer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_privy_did" ON "users" USING btree ("privy_did");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_users_ext_wallet" ON "users" USING btree ("ext_wallet") WHERE "users"."ext_wallet" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_users_app_wallet" ON "users" USING btree ("app_wallet") WHERE "users"."app_wallet" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_users_account_status" ON "users" USING btree ("account_status");--> statement-breakpoint
CREATE INDEX "idx_users_invited_by" ON "users" USING btree ("invited_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at") WHERE "users"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_users_primary_auth" ON "users" USING btree ("primary_auth_method");--> statement-breakpoint
CREATE INDEX "idx_profiles_user_id" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_profiles_country_code" ON "profiles" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "idx_profiles_visibility_availability" ON "profiles" USING btree ("profile_visibility","availability_status");--> statement-breakpoint
CREATE INDEX "idx_profiles_deleted_at" ON "profiles" USING btree ("deleted_at") WHERE "profiles"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_profiles_completed_bounties" ON "profiles" USING btree ("completed_bounties");--> statement-breakpoint
CREATE INDEX "idx_profiles_total_earnings" ON "profiles" USING btree ("total_earnings_usd");--> statement-breakpoint
CREATE INDEX "idx_applications_user_id" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_applications_status" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_applications_reviewed_by" ON "applications" USING btree ("reviewed_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_applications_created_at" ON "applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_applications_status_created" ON "applications" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_invitations_inviter" ON "invitations" USING btree ("inviter_user_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_redeemer" ON "invitations" USING btree ("redeemer_user_id");--> statement-breakpoint
CREATE INDEX "idx_invitations_code" ON "invitations" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "idx_invitations_status" ON "invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_invitations_pending" ON "invitations" USING btree ("inviter_user_id","status") WHERE "invitations"."status" = 'pending';