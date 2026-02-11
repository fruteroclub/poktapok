/**
 * Test Luma Calendar Sync
 * 
 * Manually trigger a Luma calendar sync to test the integration.
 * 
 * Usage:
 *   npx tsx scripts/test-luma-sync.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

async function testSync() {
  console.log("🔄 Testing Luma Calendar Sync\n");
  console.log("Convex URL:", CONVEX_URL);
  console.log("Calendar: fruteroclub\n");

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    console.log("📡 Triggering sync...\n");
    
    const result = await client.action(api["luma/syncAction"].syncCalendar, {
      calendarSlug: "fruteroclub",
    });

    console.log("\n✅ Sync completed!");
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log(`\n📊 Summary:`);
      console.log(`  - Total events: ${result.synced}`);
      console.log(`  - Created: ${result.created}`);
      console.log(`  - Updated: ${result.updated}`);
    }

    // Query events to verify
    console.log("\n📅 Fetching published events...");
    const events = await client.query(api.events.listPublished, {});
    console.log(`Found ${events.length} published events`);

    if (events.length > 0) {
      console.log("\nRecent events:");
      events.slice(0, 3).forEach((event: any) => {
        console.log(`  - ${event.title}`);
        console.log(`    Start: ${new Date(event.startDate).toLocaleString()}`);
        console.log(`    Luma: ${event.lumaUrl}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

testSync();
