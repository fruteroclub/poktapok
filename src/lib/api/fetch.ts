import type { ApiResponse } from "@/types/api-response";

/**
 * Custom error class for API errors
 *
 * Thrown by apiFetch when an API call fails. Contains structured error data
 * from the server including error code, details, and HTTP status.
 */
export class ApiError extends Error {
  /** Machine-readable error code (e.g., "VALIDATION_ERROR") */
  code?: string;

  /** Additional error details (e.g., validation errors from Zod) */
  details?: unknown;

  /** HTTP status code */
  status?: number;

  constructor(
    message: string,
    options?: { code?: string; details?: unknown; status?: number }
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options?.code;
    this.details = options?.details;
    this.status = options?.status;
  }
}

/**
 * Type-safe API fetch wrapper with standard error handling
 *
 * This wrapper automatically handles the standard API response envelope,
 * unwraps the `data` field, and throws ApiError for error responses.
 *
 * Benefits:
 * - Automatic error handling (no need for response.ok checks)
 * - Type-safe responses (returns T directly, not ApiResponse<T>)
 * - Consistent error structure across all API calls
 * - Better error messages for network issues and invalid JSON
 *
 * @template T - The expected data type from the API
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns The unwrapped data of type T
 * @throws {ApiError} When the API returns an error response or network fails
 *
 * @example
 * ```typescript
 * // Simple GET request
 * const data = await apiFetch<{ user: User }>("/api/auth/me");
 *
 * // POST with body
 * const data = await apiFetch<{ profile: Profile }>("/api/profiles", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ city: "Buenos Aires" }),
 * });
 *
 * // Error handling in components
 * try {
 *   const data = await apiFetch<{ user: User }>(url);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(error.message, error.code, error.details);
 *   }
 * }
 *
 * // Error handling in TanStack Query
 * const mutation = useMutation({
 *   mutationFn: (data) => apiFetch<{ profile: Profile }>("/api/profiles", {...}),
 *   onError: (error: ApiError) => {
 *     toast.error(error.message);
 *     if (error.code === "VALIDATION_ERROR") {
 *       // Handle validation errors specifically
 *     }
 *   }
 * });
 * ```
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    // Make the request
    const response = await fetch(url, options);

    // Parse JSON (throws if invalid)
    let json: ApiResponse<T>;
    try {
      json = await response.json();
    } catch (parseError) {
      // JSON parsing failed - likely server returned HTML error page
      throw new ApiError("Invalid JSON response from server", {
        code: "INVALID_RESPONSE",
        status: response.status,
      });
    }

    // Check discriminated union - success or error?
    if (json.success) {
      // Success response - return unwrapped data
      return json.data;
    } else {
      // Error response - throw ApiError
      throw new ApiError(json.error.message, {
        code: json.error.code,
        details: json.error.details,
        status: response.status,
      });
    }
  } catch (error) {
    // Re-throw ApiError as-is (already structured)
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or other fetch failure
    if (error instanceof TypeError) {
      throw new ApiError("Network error - please check your connection", {
        code: "NETWORK_ERROR",
      });
    }

    // Unknown error
    if (error instanceof Error) {
      throw new ApiError(error.message, {
        code: "UNKNOWN_ERROR",
      });
    }

    // Fallback for non-Error objects
    throw new ApiError("An unexpected error occurred", {
      code: "UNKNOWN_ERROR",
    });
  }
}

/**
 * Helper to check if an error is an ApiError
 *
 * @example
 * ```typescript
 * try {
 *   await apiFetch(url);
 * } catch (error) {
 *   if (isApiError(error)) {
 *     console.log(error.code, error.details);
 *   }
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
