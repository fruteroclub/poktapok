import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/privy/middleware";

export const GET = requireAuth(async (_request: NextRequest, authUser) => {
  try {
    // Use privyDid from verified token
    const privyDid = authUser.privyDid;

    // Get user from database
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1);

    if (userResults.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbUser = userResults[0];

    // Get profile if exists
    const profileResults = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, dbUser.id))
      .limit(1);

    return NextResponse.json({
      user: {
        id: dbUser.id,
        privyDid: dbUser.privyDid,
        email: dbUser.email,
        username: dbUser.username,
        displayName: dbUser.displayName,
        bio: dbUser.bio,
        avatarUrl: dbUser.avatarUrl,
        accountStatus: dbUser.accountStatus,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      },
      profile: profileResults.length > 0 ? profileResults[0] : null,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
});
