import { NextResponse } from "next/server";
import { getDirectoryCountries } from "@/lib/db/queries/profiles";

/**
 * GET /api/directory/countries
 *
 * Public endpoint for fetching list of countries with at least one profile
 * Used to populate the country filter dropdown
 *
 * Response:
 * [
 *   { country: "Argentina", countryCode: "AR", count: 15 },
 *   { country: "Brazil", countryCode: "BR", count: 23 },
 *   ...
 * ]
 */
export async function GET() {
  try {
    const countries = await getDirectoryCountries();
    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching directory countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
