import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiErrorCode,
} from "@/types/api-response";
import { API_ERROR_CODES } from "@/types/api-response";

/**
 * Create a standardized success response
 *
 * @param data - The response data
 * @param options - Optional message, metadata, and HTTP status
 * @returns NextResponse with standard success structure
 *
 * @example
 * ```typescript
 * return apiSuccess({ user, profile });
 *
 * return apiSuccess(
 *   { profiles },
 *   { meta: { pagination: { page: 1, total: 100 } } }
 * );
 *
 * return apiSuccess(
 *   { user },
 *   { message: "Profile updated successfully", status: 201 }
 * );
 * ```
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    message?: string;
    meta?: Record<string, unknown>;
    status?: number;
  }
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(options?.message && { message: options.message }),
      ...(options?.meta && { meta: options.meta }),
    },
    { status: options?.status || 200 }
  );
}

/**
 * Create a standardized error response
 *
 * @param message - Human-readable error message
 * @param options - Optional error code, details, and HTTP status
 * @returns NextResponse with standard error structure
 *
 * @example
 * ```typescript
 * return apiError("User not found", {
 *   code: "NOT_FOUND",
 *   status: 404
 * });
 *
 * return apiError("Invalid request", {
 *   code: "VALIDATION_ERROR",
 *   details: { field: "email", message: "Invalid format" },
 *   status: 400
 * });
 * ```
 */
export function apiError(
  message: string,
  options?: {
    code?: ApiErrorCode | string;
    details?: unknown;
    status?: number;
  }
): NextResponse<ApiErrorResponse> {
  const error: ApiErrorResponse["error"] = { message };

  if (options?.code) {
    error.code = options.code;
  }

  if (options?.details) {
    error.details = options.details;
  }

  return NextResponse.json(
    {
      success: false as const,
      error,
    },
    { status: options?.status || 500 }
  );
}

/**
 * Create a standardized validation error response from Zod
 *
 * @param zodError - ZodError from schema validation
 * @returns NextResponse with validation error structure
 *
 * @example
 * ```typescript
 * const result = profileSchema.safeParse(data);
 * if (!result.success) {
 *   return apiValidationError(result.error);
 * }
 * ```
 */
export function apiValidationError(
  zodError: ZodError
): NextResponse<ApiErrorResponse> {
  return apiError("Validation failed", {
    code: API_ERROR_CODES.VALIDATION_ERROR,
    details: zodError.format(),
    status: 400,
  });
}

/**
 * Common error response creators
 */
export const apiErrors = {
  /** 401 Unauthorized */
  unauthorized: (message = "Unauthorized") =>
    apiError(message, {
      code: API_ERROR_CODES.UNAUTHORIZED,
      status: 401,
    }),

  /** 404 Not Found */
  notFound: (resource = "Resource") =>
    apiError(`${resource} not found`, {
      code: API_ERROR_CODES.NOT_FOUND,
      status: 404,
    }),

  /** 409 Conflict */
  conflict: (message: string) =>
    apiError(message, {
      code: API_ERROR_CODES.CONFLICT,
      status: 409,
    }),

  /** 500 Internal Server Error */
  internal: (message = "Internal server error") =>
    apiError(message, {
      code: API_ERROR_CODES.INTERNAL_ERROR,
      status: 500,
    }),
};
