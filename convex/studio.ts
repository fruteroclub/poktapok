import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Studio - Frutero's v0 clone for bootcamp students
 * Each student gets ONE deploy slot
 */

// Get user's deployed project
export const getDeployedProject = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("studioProjects")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    return project;
  },
});

// Get project by slug (for public preview)
export const getProjectBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("studioProjects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    return project;
  },
});

// Deploy or update project
export const deployProject = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already has a project
    const existingProject = await ctx.db
      .query("studioProjects")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existingProject) {
      // Update existing project
      await ctx.db.patch(existingProject._id, {
        code: args.code,
        title: args.title,
        updatedAt: Date.now(),
        version: (existingProject.version || 1) + 1,
      });
      
      return { 
        id: existingProject._id, 
        slug: existingProject.slug,
        updated: true 
      };
    }

    // Create new project with unique slug
    const slug = generateSlug(args.userId);
    
    const projectId = await ctx.db.insert("studioProjects", {
      userId: args.userId,
      code: args.code,
      title: args.title,
      slug,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { 
      id: projectId, 
      slug,
      updated: false 
    };
  },
});

// Save chat history
export const saveChatHistory = mutation({
  args: {
    userId: v.id("users"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        code: v.optional(v.string()),
        timestamp: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get existing chat history
    const existing = await ctx.db
      .query("studioChatHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        messages: args.messages,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("studioChatHistory", {
        userId: args.userId,
        messages: args.messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get chat history
export const getChatHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("studioChatHistory")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    return history?.messages || [];
  },
});

// Helper to generate unique slug
function generateSlug(clerkId: string): string {
  const adjectives = ["cool", "fast", "bright", "swift", "bold", "fresh", "smart", "slick"];
  const nouns = ["app", "site", "page", "view", "dash", "hub", "space", "zone"];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = clerkId.slice(-4).toLowerCase();
  
  return `${adj}-${noun}-${suffix}`;
}
