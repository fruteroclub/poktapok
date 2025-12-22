import { getDirectoryCountries } from "@/lib/db/queries/profiles";
import { apiSuccess, apiError } from "@/lib/api/response";
import { API_ERROR_CODES } from "@/types/api-response";

/**
 * GET /api/directory/countries
 *
 * Public endpoint for fetching list of countries with at least one profile
 * Used to populate the country filter dropdown
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     countries: [
 *       { country: "Argentina", countryCode: "AR", count: 15 },
 *       { country: "Brazil", countryCode: "BR", count: 23 },
 *       ...
 *     ]
 *   }
 * }
 */
export async function GET() {
  try {
    const countries = await getDirectoryCountries();
    return apiSuccess({ countries });
  } catch (error) {
    console.error("Error fetching directory countries:", error);
    return apiError("Failed to fetch countries", {
      code: API_ERROR_CODES.INTERNAL_ERROR,
      status: 500,
    });
  }
}
