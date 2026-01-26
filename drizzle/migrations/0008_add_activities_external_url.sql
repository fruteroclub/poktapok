-- Add external_url column to activities table
-- This allows admins to link to external resources when creating activities

ALTER TABLE "activities" ADD COLUMN "external_url" varchar(500);
