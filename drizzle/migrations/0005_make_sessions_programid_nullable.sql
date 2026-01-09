-- Migration: Make sessions.program_id nullable to support standalone sessions
-- Date: 2025-01-09
-- Purpose: Allow sessions to exist without being linked to a program

ALTER TABLE "sessions" ALTER COLUMN "program_id" DROP NOT NULL;
