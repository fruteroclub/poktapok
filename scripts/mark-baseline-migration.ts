/**
 * Mark Baseline Migration as Applied
 *
 * This script marks the initial baseline migration (0000_futuristic_aaron_stack)
 * as applied without running it, since all tables already exist via db:push.
 *
 * This allows the team to start using migration-based workflow going forward.
 */

import { Pool } from "pg";
import { readFileSync } from "fs";
import { createHash } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  max: 1,
});

async function markBaseline() {
  const client = await pool.connect();

  try {
    console.log("🔍 Checking migration status...\n");

    // Check if migration is already applied
    const existingCheck = await client.query(
      "SELECT id FROM drizzle_migrations WHERE id = $1",
      [0]
    );

    if (existingCheck.rows.length > 0) {
      console.log("⚠️  Baseline migration already marked as applied");
      console.log("   Migration: 0000_futuristic_aaron_stack");
      return;
    }

    // Read the migration file to compute its hash
    const migrationFile = readFileSync(
      "drizzle/migrations/0000_futuristic_aaron_stack.sql",
      "utf-8"
    );
    const hash = createHash("sha256").update(migrationFile).digest("hex");

    await client.query("BEGIN");

    // Mark baseline as applied using the correct schema
    // Drizzle stores timestamps as bigint (milliseconds since epoch)
    const now = Date.now();

    await client.query(
      `INSERT INTO drizzle_migrations (id, hash, created_at)
       VALUES ($1, $2, $3)`,
      [0, hash, now]
    );

    await client.query("COMMIT");

    console.log("✅ Baseline migration marked as applied");
    console.log(`   Migration: 0000_futuristic_aaron_stack`);
    console.log(`   Hash: ${hash}`);
    console.log(`   Created: ${new Date(now).toISOString()}`);
    console.log("\n📝 Note: All tables already exist via db:push");
    console.log("   Future migrations will be applied normally\n");
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error) {
      console.error("❌ Error:", error.message);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

markBaseline().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
