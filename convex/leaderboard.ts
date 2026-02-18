import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Leaderboard - Queries for bootcamp statistics and rankings
 */

// ============================================================
// LEADERBOARD - Get top students by progress
// ============================================================

export const getLeaderboard = query({
  args: { 
    programId: v.id("bootcampPrograms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get all active/completed enrollments for this program
    const enrollments = await ctx.db
      .query("bootcampEnrollments")
      .withIndex("by_program", (q) => q.eq("programId", args.programId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "completed")
        )
      )
      .collect();

    // Get user details and deliverables count for each enrollment
    const leaderboardData = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get user info if linked
        let user = null;
        if (enrollment.userId) {
          user = await ctx.db.get(enrollment.userId);
        }

        // Get deliverables count for this enrollment
        const deliverables = await ctx.db
          .query("bootcampDeliverables")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
          .collect();

        const approvedCount = deliverables.filter(d => d.status === "approved").length;
        const submittedCount = deliverables.length;

        return {
          enrollmentId: enrollment._id,
          email: enrollment.email,
          userId: enrollment.userId,
          username: user?.username || null,
          displayName: user?.displayName || enrollment.email.split("@")[0],
          avatarUrl: user?.avatarUrl || null,
          progress: enrollment.progress,
          sessionsCompleted: enrollment.sessionsCompleted,
          deliverables: {
            submitted: submittedCount,
            approved: approvedCount,
          },
          status: enrollment.status,
          joinedAt: enrollment.joinedAt || enrollment.createdAt,
        };
      })
    );

    // Sort by progress (descending), then by deliverables approved
    const sorted = leaderboardData.sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      return b.deliverables.approved - a.deliverables.approved;
    });

    // Add rank
    const ranked = sorted.slice(0, limit).map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return ranked;
  },
});

// ============================================================
// PROGRAM STATS - Overall statistics for a bootcamp
// ============================================================

export const getProgramStats = query({
  args: { programId: v.id("bootcampPrograms") },
  handler: async (ctx, args) => {
    // Get program
    const program = await ctx.db.get(args.programId);
    if (!program) return null;

    // Get all enrollments
    const enrollments = await ctx.db
      .query("bootcampEnrollments")
      .withIndex("by_program", (q) => q.eq("programId", args.programId))
      .collect();

    // Get all deliverables
    const deliverables = await ctx.db
      .query("bootcampDeliverables")
      .withIndex("by_program", (q) => q.eq("programId", args.programId))
      .collect();

    // Calculate stats
    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.status === "active").length;
    const completedEnrollments = enrollments.filter(e => e.status === "completed").length;
    const linkedEnrollments = enrollments.filter(e => e.userId !== undefined).length;

    // Progress distribution
    const progressBuckets = {
      notStarted: enrollments.filter(e => e.progress === 0).length,
      inProgress: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
      completed: enrollments.filter(e => e.progress >= 100).length,
    };

    // Average progress
    const avgProgress = totalEnrollments > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments)
      : 0;

    // Deliverables stats
    const totalDeliverables = deliverables.length;
    const approvedDeliverables = deliverables.filter(d => d.status === "approved").length;
    const pendingDeliverables = deliverables.filter(d => d.status === "submitted").length;

    // Deliverables by session
    const deliverablesBySession: Record<number, { submitted: number; approved: number }> = {};
    for (let i = 1; i <= program.sessionsCount; i++) {
      const sessionDeliverables = deliverables.filter(d => d.sessionNumber === i);
      deliverablesBySession[i] = {
        submitted: sessionDeliverables.length,
        approved: sessionDeliverables.filter(d => d.status === "approved").length,
      };
    }

    // Activity by day (last 30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentDeliverables = deliverables.filter(d => d.submittedAt > thirtyDaysAgo);
    
    const activityByDay: Record<string, number> = {};
    recentDeliverables.forEach(d => {
      const date = new Date(d.submittedAt).toISOString().split("T")[0];
      activityByDay[date] = (activityByDay[date] || 0) + 1;
    });

    // Find most active day
    let mostActiveDay = { date: "", count: 0 };
    Object.entries(activityByDay).forEach(([date, count]) => {
      if (count > mostActiveDay.count) {
        mostActiveDay = { date, count };
      }
    });

    return {
      program: {
        id: program._id,
        name: program.name,
        slug: program.slug,
        status: program.status,
        sessionsCount: program.sessionsCount,
        startDate: program.startDate,
        endDate: program.endDate,
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
        linked: linkedEnrollments,
      },
      progress: {
        average: avgProgress,
        distribution: progressBuckets,
      },
      deliverables: {
        total: totalDeliverables,
        approved: approvedDeliverables,
        pending: pendingDeliverables,
        bySession: deliverablesBySession,
      },
      activity: {
        last30Days: activityByDay,
        mostActiveDay,
      },
    };
  },
});

// ============================================================
// ACTIVE PARTICIPANTS - List participants with recent activity
// ============================================================

export const listActiveParticipants = query({
  args: { 
    programId: v.id("bootcampPrograms"),
    daysAgo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.daysAgo || 7;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get all enrollments with linked users
    const enrollments = await ctx.db
      .query("bootcampEnrollments")
      .withIndex("by_program", (q) => q.eq("programId", args.programId))
      .filter((q) => q.neq(q.field("userId"), undefined))
      .collect();

    // Get recent deliverables for each enrollment
    const activeParticipants = await Promise.all(
      enrollments.map(async (enrollment) => {
        const deliverables = await ctx.db
          .query("bootcampDeliverables")
          .withIndex("by_enrollment", (q) => q.eq("enrollmentId", enrollment._id))
          .filter((q) => q.gte(q.field("submittedAt"), cutoff))
          .collect();

        if (deliverables.length === 0) return null;

        const user = enrollment.userId ? await ctx.db.get(enrollment.userId) : null;

        return {
          userId: enrollment.userId,
          username: user?.username || null,
          displayName: user?.displayName || enrollment.email.split("@")[0],
          avatarUrl: user?.avatarUrl || null,
          progress: enrollment.progress,
          recentDeliverables: deliverables.length,
          lastActivity: Math.max(...deliverables.map(d => d.submittedAt)),
        };
      })
    );

    // Filter nulls and sort by recent activity
    return activeParticipants
      .filter(p => p !== null)
      .sort((a, b) => (b?.lastActivity || 0) - (a?.lastActivity || 0));
  },
});

// ============================================================
// GLOBAL STATS - Stats across all programs (for dashboard)
// ============================================================

export const getGlobalStats = query({
  args: {},
  handler: async (ctx) => {
    // Get all active programs
    const programs = await ctx.db
      .query("bootcampPrograms")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get all enrollments
    const enrollments = await ctx.db
      .query("bootcampEnrollments")
      .collect();

    // Get all deliverables
    const deliverables = await ctx.db
      .query("bootcampDeliverables")
      .collect();

    // Unique students (by userId)
    const uniqueStudents = new Set(
      enrollments
        .filter(e => e.userId)
        .map(e => e.userId?.toString())
    );

    return {
      activePrograms: programs.length,
      totalEnrollments: enrollments.length,
      uniqueStudents: uniqueStudents.size,
      totalDeliverables: deliverables.length,
      approvedDeliverables: deliverables.filter(d => d.status === "approved").length,
    };
  },
});
