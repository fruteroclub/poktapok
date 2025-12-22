/**
 * Standard API Response Types
 *
 * All API endpoints use this envelope pattern for consistent, type-safe responses.
 *
 * Benefits:
 * - Discriminated unions enable type narrowing with TypeScript
 * - Consistent error structure across all endpoints
 * - Type-safe error handling in frontend code
 * - Self-documenting API contracts
 */

/**
 * Standard API Response Envelope
 *
 * All API endpoints return this structure. Use the `success` field
 * to discriminate between success and error responses.
 *
 * @example
 * ```typescript
 * const response = await fetch("/api/endpoint");
 * const json: ApiResponse<MyData> = await response.json();
 *
 * if (json.success) {
 *   // TypeScript knows json.data exists
 *   console.log(json.data);
 * } else {
 *   // TypeScript knows json.error exists
 *   console.error(json.error.message);
 * }
 * ```
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Success Response Structure
 *
 * Returned when an API call succeeds (HTTP 2xx status).
 *
 * @template T - The type of data being returned
 */
export interface ApiSuccessResponse<T> {
  /** Always true for success responses (discriminator) */
  success: true;

  /** The response data */
  data: T;

  /** Optional success message for user display */
  message?: string;

  /** Optional metadata (e.g., pagination, timestamps) */
  meta?: Record<string, unknown>;
}

/**
 * Error Response Structure
 *
 * Returned when an API call fails (HTTP 4xx/5xx status).
 *
 * Error codes:
 * - VALIDATION_ERROR: Request data failed validation (400)
 * - UNAUTHORIZED: Authentication required or invalid (401)
 * - FORBIDDEN: User lacks permission (403)
 * - NOT_FOUND: Resource doesn't exist (404)
 * - CONFLICT: Resource conflict (e.g., duplicate username) (409)
 * - INTERNAL_ERROR: Server error (500)
 */
export interface ApiErrorResponse {
  /** Always false for error responses (discriminator) */
  success: false;

  /** Error details */
  error: {
    /** Human-readable error message */
    message: string;

    /** Machine-readable error code (optional) */
    code?: string;

    /** Additional error details (e.g., validation errors) */
    details?: unknown;
  };
}

/**
 * Standard error codes used across the API
 */
export const API_ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
