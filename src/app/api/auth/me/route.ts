import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Initialize Privy client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function GET(request: NextRequest) {
  try {
    // Extract access token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    const accessToken =
      authHeader?.replace("Bearer ", "") ||
      request.cookies.get("privy-token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the access token with Privy
    const verifiedClaims = await privy.verifyAuthToken(accessToken);
    const privyDid = verifiedClaims.userId;

    if (!privyDid) {
      return NextResponse.json(
        { error: "Invalid token: missing userId" },
        { status: 401 }
      );
    }

    // Get user from database
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1);

    if (userResults.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResults[0];

    // Get profile if exists
    const profileResults = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    return NextResponse.json({
      user: {
        id: user.id,
        privyDid: user.privyDid,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        accountStatus: user.accountStatus,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: profileResults.length > 0 ? profileResults[0] : null,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);

    // Handle specific Privy verification errors
    if (error instanceof Error) {
      if (
        error.message.includes("token") ||
        error.message.includes("expired")
      ) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
