import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Poktapok Database Schema (Convex)
 * 
 * Fresh implementation - no migration from Neon.
 * Users and events will be created new in Convex.
 */

export default defineSchema({
  // ============================================================
  // USERS - Core identity and authentication
  // ============================================================
  users: defineTable({
    // Privy Authentication
    privyDid: v.string(), // Unique identifier from Privy
    email: v.optional(v.string()),

    // Profile Identifiers
    username: v.optional(v.string()),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),

    // Wallets
    extWallet: v.optional(v.string()), // External wallet (MetaMask, etc.)
    appWallet: v.optional(v.string()), // Privy embedded wallet

    // Authentication
    primaryAuthMethod: v.union(
      v.literal("email"),
      v.literal("wallet"),
      v.literal("social")
    ),

    // Authorization
    role: v.union(v.literal("member"), v.literal("moderator"), v.literal("admin")),

    // Account Status
    accountStatus: v.union(
      v.literal("incomplete"), // Authenticated but onboarding not completed
      v.literal("pending"), // Onboarding complete, waiting for approval
      v.literal("active"), // Approved and active
      v.literal("suspended"), // Temporarily disabled
      v.literal("banned") // Permanently disabled
    ),

    // Timestamps (Unix milliseconds)
    lastLoginAt: v.number(),
    deletedAt: v.optional(v.number()), // Soft delete

    // Referral
    invitedByUserId: v.optional(v.id("users")), // Who invited this user

    // Metadata
    privyMetadata: v.optional(v.any()), // Privy SDK data
    metadata: v.optional(v.any()), // Business logic data
  })
    .index("by_privy_did", ["privyDid"])
    .index("by_email", ["email"])
    .index("by_username", ["username"])
    .index("by_role", ["role"])
    .index("by_account_status", ["accountStatus"]),

  // ============================================================
  // PROFILES - Extended user information
  // ============================================================
  profiles: defineTable({
    userId: v.id("users"), // Foreign key to users table

    // Location
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    countryCode: v.optional(v.string()),

    // Social Links (URLs)
    githubUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    telegramHandle: v.optional(v.string()),

    // Social Usernames (for onboarding form)
    githubUsername: v.optional(v.string()),
    twitterUsername: v.optional(v.string()),
    telegramUsername: v.optional(v.string()),

    // Learning & Interests
    learningTracks: v.array(
      v.union(v.literal("ai"), v.literal("crypto"), v.literal("privacy"))
    ),

    // Privacy Settings
    profileVisibility: v.union(
      v.literal("public"),
      v.literal("members"),
      v.literal("private")
    ),

    // Status
    availabilityStatus: v.union(
      v.literal("available"),
      v.literal("open_to_offers"),
      v.literal("unavailable")
    ),

    // Stats
    projectsCount: v.optional(v.number()), // Portfolio projects (Epic 2)
    completedBounties: v.optional(v.number()), // Bounties completed (Epic 3 - future)
    totalEarningsUsd: v.optional(v.number()), // Earnings from bounties (Epic 3 - future)
    profileViews: v.number(),

    // Metadata
    metadata: v.optional(v.any()),
  })
    .index("by_user_id", ["userId"])
    .index("by_visibility", ["profileVisibility"]),

  // ============================================================
  // EVENTS - Community events with Luma integration
  // ============================================================
  events: defineTable({
    // Core Info
    title: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()), // URL from lumacdn.com

    // Luma Integration
    lumaUrl: v.string(), // Original lu.ma URL (e.g., https://lu.ma/qq2u3tf6)
    lumaEventId: v.optional(v.string()), // e.g., evt-JkQd9kh99THTWSF
    lumaSlug: v.optional(v.string()), // e.g., qq2u3tf6

    // Event Details
    eventType: v.union(
      v.literal("in-person"),
      v.literal("virtual"),
      v.literal("hybrid")
    ),
    startDate: v.number(), // Unix milliseconds
    endDate: v.optional(v.number()),
    timezone: v.string(), // IANA timezone (e.g., "America/Mexico_City")

    // Location
    location: v.optional(v.string()), // Full address
    locationDetails: v.optional(v.string()), // Additional notes
    locationUrl: v.optional(v.string()), // Google Maps or venue link
    coordinates: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),

    // Organizers
    hosts: v.array(
      v.object({
        name: v.string(),
        avatarUrl: v.optional(v.string()),
        handle: v.optional(v.string()),
      })
    ),
    calendar: v.optional(v.string()), // e.g., "fruteroclub"

    // Status
    status: v.union(
      v.literal("upcoming"),
      v.literal("live"),
      v.literal("past"),
      v.literal("cancelled")
    ),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),

    // Registration
    registrationCount: v.number(),
    maxCapacity: v.optional(v.number()),
    registrationType: v.union(
      v.literal("free"),
      v.literal("paid"),
      v.literal("approval")
    ),

    // Metadata
    metadata: v.optional(v.any()),
  })
    .index("by_luma_slug", ["lumaSlug"])
    .index("by_start_date", ["startDate"])
    .index("by_status", ["status"])
    .index("by_published", ["isPublished"])
    .index("by_calendar", ["calendar"]),

  // ============================================================
  // PROGRAMS - Training programs
  // ============================================================
  programs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    ),
    isActive: v.optional(v.boolean()), // For quick filtering
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })
    .index("by_status", ["status"])
    .index("by_active", ["isActive"]),

  // ============================================================
  // SESSIONS - Program sessions
  // ============================================================
  sessions: defineTable({
    programId: v.optional(v.id("programs")),
    title: v.string(),
    description: v.optional(v.string()),
    sessionDate: v.number(),
    duration: v.optional(v.number()), // Minutes
    location: v.optional(v.string()),
    isVirtual: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_program", ["programId"])
    .index("by_session_date", ["sessionDate"]),

  // ============================================================
  // ACTIVITIES - Community activities
  // ============================================================
  activities: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    activityType: v.string(),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    rewardPulpaAmount: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    instructions: v.optional(v.string()),
    totalAvailableSlots: v.optional(v.number()),
    currentSubmissionsCount: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_type", ["activityType"])
    .index("by_status", ["status"]),

  // ============================================================
  // PROJECTS - Member portfolio projects
  // ============================================================
  projects: defineTable({
    // Basic info
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    
    // Links
    githubUrl: v.optional(v.string()),
    demoUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()), // YouTube embed
    
    // Tech stack (array of strings)
    techStack: v.optional(v.array(v.string())),
    
    // Images
    thumbnailUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("archived")
    ),
    
    // Visibility
    isPublic: v.boolean(),
    
    // Dates
    completedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"]),

  // ============================================================
  // SKILLS - Skill taxonomy
  // ============================================================
  skills: defineTable({
    name: v.string(),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_category", ["category"]),

  // ============================================================
  // APPLICATIONS - Onboarding queue
  // ============================================================
  applications: defineTable({
    userId: v.id("users"),
    programId: v.optional(v.id("programs")),
    goal: v.optional(v.string()), // User's goal (max 280 chars)
    motivationText: v.optional(v.string()), // Why they want to join (max 500 chars)
    githubUsername: v.optional(v.string()),
    twitterUsername: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    reviewedByUserId: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // ============================================================
  // INVITATIONS - Referral system
  // ============================================================
  invitations: defineTable({
    inviterUserId: v.id("users"),
    redeemerUserId: v.optional(v.id("users")),
    inviteCode: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("redeemed"),
      v.literal("expired")
    ),
    redeemedAt: v.optional(v.number()),
    expiresAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_inviter", ["inviterUserId"])
    .index("by_code", ["inviteCode"])
    .index("by_status", ["status"]),
});
