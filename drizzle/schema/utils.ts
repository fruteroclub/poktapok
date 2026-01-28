import { sql } from 'drizzle-orm'
import { timestamp, jsonb } from 'drizzle-orm/pg-core'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

/**
 * Standard timestamp columns for audit trail
 * Used across all tables to track creation and updates
 */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}

/**
 * Soft delete column
 * Allows marking records as deleted without physical deletion
 * Enables audit trail and data recovery
 */
export const softDelete = {
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}

/**
 * Metadata column for extensibility
 * JSONB allows flexible data storage without schema migrations
 * Queryable with PostgreSQL JSON operators
 */
export const metadata = {
  metadata: jsonb('metadata')
    .default(sql`'{}'::jsonb`)
    .notNull(),
}

/**
 * Helper function to check if a value matches a regex pattern
 * Used for CHECK constraints (email format, wallet format, etc.)
 *
 * @param column - The column to check
 * @param pattern - Regex pattern (PostgreSQL ~* syntax)
 * @returns SQL expression for CHECK constraint
 */
export function checkPattern(column: AnyPgColumn, pattern: string) {
  return sql`${column} ~* ${pattern}`
}

/**
 * Common regex patterns for validation
 */
export const PATTERNS = {
  // Email: standard format (RFC 5322 simplified)
  EMAIL: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',

  // Ethereum address: 0x followed by 40 hex characters
  ETH_ADDRESS: '^0x[a-fA-F0-9]{40}$',

  // Username: lowercase alphanumeric + underscores, 3-50 chars
  USERNAME: '^[a-z0-9_]{3,50}$',

  // Country code: ISO 3166-1 alpha-2 (2 uppercase letters)
  COUNTRY_CODE: '^[A-Z]{2}$',

  // Invitation code: URL-safe base64-like string, 16-32 chars
  INVITE_CODE: '^[A-Za-z0-9_-]{16,32}$',
} as const
