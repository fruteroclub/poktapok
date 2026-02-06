import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Luma Actions
 * 
 * HTTP actions that can be called from the frontend or external tools.
 */

/**
 * Manually trigger Luma calendar sync
 * 
 * Useful for testing or forcing an immediate sync.
 * 
 * Usage from frontend:
 *   const syncLuma = useAction(api.luma.actions.triggerSync);
 *   await syncLuma({ calendarSlug: "fruteroclub" });
 */
export const triggerSync = action({
  args: {
    calendarSlug: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🔄 Manually triggering Luma sync: ${args.calendarSlug}`);

    // Call the internal mutation
    const result = await ctx.runMutation(internal.luma.sync.syncCalendar, {
      calendarSlug: args.calendarSlug,
    });

    return result;
  },
});
