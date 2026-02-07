import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Projects Functions
 *
 * Member projects management.
 */

/**
 * Get project by ID
 */
export const getById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

/**
 * Get projects by user
 */
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();
    return { projects };
  },
});

/**
 * Get projects by current user (via privyDid)
 */
export const getMyProjects = query({
  args: { privyDid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_privy_did", (q) => q.eq("privyDid", args.privyDid))
      .unique();

    if (!user) {
      return { projects: [] };
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return { projects };
  },
});

/**
 * List public projects
 */
export const listPublic = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let projects;

    if (args.status) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status as "active" | "completed" | "archived")
        )
        .take(args.limit ?? 50);
    } else {
      projects = await ctx.db.query("projects").take(args.limit ?? 50);
    }

    // Get owner info
    const projectsWithOwners = await Promise.all(
      projects.map(async (project) => {
        const owner = project.ownerId
          ? await ctx.db.get(project.ownerId)
          : null;
        return {
          ...project,
          owner: owner
            ? {
                _id: owner._id,
                username: owner.username,
                displayName: owner.displayName,
                avatarUrl: owner.avatarUrl,
              }
            : null,
        };
      })
    );

    return { projects: projectsWithOwners };
  },
});

/**
 * Create project
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    privyDid: v.string(),
    status: v.optional(
      v.union(v.literal("active"), v.literal("completed"), v.literal("archived"))
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_privy_did", (q) => q.eq("privyDid", args.privyDid))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      ownerId: user._id,
      status: args.status ?? "active",
      metadata: args.metadata,
    });

    return await ctx.db.get(projectId);
  },
});

/**
 * Update project
 */
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("completed"), v.literal("archived"))
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { projectId, ...updates } = args;

    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(projectId, cleanUpdates);
    return await ctx.db.get(projectId);
  },
});

/**
 * Delete project
 */
export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.projectId);
  },
});
