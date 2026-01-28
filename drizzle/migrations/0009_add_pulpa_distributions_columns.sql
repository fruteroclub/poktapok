-- Add missing columns to pulpa_distributions table for on-chain distribution support

-- Add recipient_wallet column (required for sending tokens)
ALTER TABLE "pulpa_distributions"
ADD COLUMN IF NOT EXISTS "recipient_wallet" varchar(42);

-- Add chain_id column (defaults to Optimism = 10)
ALTER TABLE "pulpa_distributions"
ADD COLUMN IF NOT EXISTS "chain_id" integer NOT NULL DEFAULT 10;

-- Add distributed_by_user_id column (admin who initiated distribution)
ALTER TABLE "pulpa_distributions"
ADD COLUMN IF NOT EXISTS "distributed_by_user_id" uuid;

-- Add retry_count column for failed distributions
ALTER TABLE "pulpa_distributions"
ADD COLUMN IF NOT EXISTS "retry_count" integer NOT NULL DEFAULT 0;

-- Add initiated_at timestamp
ALTER TABLE "pulpa_distributions"
ADD COLUMN IF NOT EXISTS "initiated_at" timestamp with time zone DEFAULT now();

-- Add confirmed_at timestamp (when blockchain confirms)
ALTER TABLE "pulpa_distributions"
ADD COLUMN IF NOT EXISTS "confirmed_at" timestamp with time zone;

-- Add foreign key for distributed_by_user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'distributions_distributed_by_fk'
  ) THEN
    ALTER TABLE "pulpa_distributions"
    ADD CONSTRAINT "distributions_distributed_by_fk"
    FOREIGN KEY ("distributed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;
  END IF;
END $$;

-- Add check constraint for wallet format
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'wallet_format'
  ) THEN
    ALTER TABLE "pulpa_distributions"
    ADD CONSTRAINT "wallet_format"
    CHECK ("recipient_wallet" IS NULL OR "recipient_wallet" ~* '^0x[a-fA-F0-9]{40}$');
  END IF;
END $$;

-- Add check constraint for retry count
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'retry_count_positive'
  ) THEN
    ALTER TABLE "pulpa_distributions"
    ADD CONSTRAINT "retry_count_positive"
    CHECK ("retry_count" >= 0);
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "idx_distributions_distributed_by" ON "pulpa_distributions" ("distributed_by_user_id");
CREATE INDEX IF NOT EXISTS "idx_distributions_distributed_at" ON "pulpa_distributions" ("distributed_at");
