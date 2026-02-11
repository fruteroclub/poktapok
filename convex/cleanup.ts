import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Find user by email
 */
export const findUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return user;
  },
});

/**
 * Delete user and all related data by email
 */
export const deleteUserByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      return { deleted: false, email: args.email, reason: "User not found" };
    }

    const userId = user._id;

    // Delete profile if exists
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.delete(profile._id);
    }

    // Delete applications if exist
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const app of applications) {
      await ctx.db.delete(app._id);
    }

    // Delete bootcamp enrollments
    const enrollments = await ctx.db
      .query("bootcampEnrollments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const enrollment of enrollments) {
      // Delete deliverables for this enrollment
      const deliverables = await ctx.db
        .query("bootcampDeliverables")
        .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
        .collect();
      for (const d of deliverables) {
        await ctx.db.delete(d._id);
      }
      await ctx.db.delete(enrollment._id);
    }

    // Delete projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }

    // Delete skills
    const skills = await ctx.db
      .query("userSkills")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const skill of skills) {
      await ctx.db.delete(skill._id);
    }

    // Delete invitations created by user
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_inviter", (q) => q.eq("inviterUserId", userId))
      .collect();
    for (const inv of invitations) {
      await ctx.db.delete(inv._id);
    }

    // Delete user
    await ctx.db.delete(userId);

    return { 
      deleted: true, 
      email: args.email,
      username: user.username,
    };
  },
});

/**
 * List all users (for debugging)
 */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(u => ({
      id: u._id,
      email: u.email,
      username: u.username,
      accountStatus: u.accountStatus,
    }));
  },
});
