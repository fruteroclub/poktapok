import { NextRequest, NextResponse } from "next/server";
import {
  getDirectoryProfiles,
  getDirectoryProfilesCount,
  type DirectoryFilters,
} from "@/lib/db/queries/profiles";

/**
 * GET /api/directory
 *
 * Public endpoint for fetching directory profiles with filters and pagination
 *
 * Query Parameters:
 * - search: string (min 2 chars) - Search username, displayName, bio
 * - track: "ai" | "crypto" | "privacy" - Filter by learning track
 * - status: "available" | "open_to_offers" | "unavailable" - Filter by availability
 * - country: string - Filter by country name
 * - page: number (default: 1) - Page number for pagination
 * - limit: number (default: 24, max: 100) - Items per page
 *
 * Response:
 * {
 *   profiles: DirectoryProfile[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number,
 *     hasMore: boolean
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate filters
    const search = searchParams.get("search") || undefined;
    const learningTrack = searchParams.get("track") as
      | "ai"
      | "crypto"
      | "privacy"
      | undefined;
    const availabilityStatus = searchParams.get("status") as
      | "available"
      | "open_to_offers"
      | "unavailable"
      | undefined;
    const country = searchParams.get("country") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "24"))
    );

    // Validate search length
    if (search && search.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate enum values
    if (
      learningTrack &&
      !["ai", "crypto", "privacy"].includes(learningTrack)
    ) {
      return NextResponse.json(
        { error: "Invalid learning track" },
        { status: 400 }
      );
    }

    if (
      availabilityStatus &&
      !["available", "open_to_offers", "unavailable"].includes(
        availabilityStatus
      )
    ) {
      return NextResponse.json(
        { error: "Invalid availability status" },
        { status: 400 }
      );
    }

    const filters: DirectoryFilters = {
      search,
      learningTrack,
      availabilityStatus,
      country,
      page,
      limit,
    };

    // Fetch profiles and total count in parallel
    const [profiles, total] = await Promise.all([
      getDirectoryProfiles(filters),
      getDirectoryProfilesCount(filters),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching directory profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch directory profiles" },
      { status: 500 }
    );
  }
}
