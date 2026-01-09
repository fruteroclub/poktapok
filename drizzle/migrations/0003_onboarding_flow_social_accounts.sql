-- Migration: E3-T2 Onboarding Flow - Social Accounts Schema Update
-- Date: 2026-01-06
-- Description: Rename social account fields in profiles table for username/handle storage

-- Rename github_url → github_username (stores username without @)
ALTER TABLE "profiles" RENAME COLUMN "github_url" TO "github_username";
--> statement-breakpoint

-- Rename twitter_url → twitter_username (stores username without @)
ALTER TABLE "profiles" RENAME COLUMN "twitter_url" TO "twitter_username";
--> statement-breakpoint

-- Rename telegram_handle → telegram_username (stores username without @)
ALTER TABLE "profiles" RENAME COLUMN "telegram_handle" TO "telegram_username";
--> statement-breakpoint

-- Update column types from varchar(500) to varchar(100) for usernames
ALTER TABLE "profiles" ALTER COLUMN "github_username" TYPE varchar(100);
--> statement-breakpoint

ALTER TABLE "profiles" ALTER COLUMN "twitter_username" TYPE varchar(100);
--> statement-breakpoint

ALTER TABLE "profiles" ALTER COLUMN "telegram_username" TYPE varchar(100);
