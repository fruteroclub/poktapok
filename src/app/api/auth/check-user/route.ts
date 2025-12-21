import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received body:", body);

    const { privyDid, email, appWallet, extWallet, primaryAuthMethod } = body;

    if (!privyDid) {
      console.error("Validation failed - privyDid:", privyDid);
      return NextResponse.json(
        { error: "privyDid is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.privyDid, privyDid))
      .limit(1);

    if (existingUsers.length > 0) {
      // User exists - return existing user
      return NextResponse.json({
        exists: true,
        user: existingUsers[0],
      });
    }

    // User doesn't exist - create minimal user record
    // Email, username, displayName will be collected during onboarding
    const newUser = await db
      .insert(users)
      .values({
        privyDid,
        email: email || null,
        username: null,
        displayName: null,
        appWallet: appWallet || null,
        extWallet: extWallet || null,
        primaryAuthMethod: primaryAuthMethod || "wallet",
        accountStatus: "incomplete", // Status for incomplete onboarding
      })
      .returning();

    return NextResponse.json({
      exists: false,
      user: newUser[0],
      message: "User created with incomplete profile",
    });
  } catch (error) {
    console.error("Error creating/fetching user:", error);
    return NextResponse.json(
      { error: "Failed to create/fetch user" },
      { status: 500 }
    );
  }
}
