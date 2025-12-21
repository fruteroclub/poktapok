import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

/**
 * Database connection configuration
 *
 * Uses DATABASE_URL_UNPOOLED for migrations (direct connection)
 * Uses DATABASE_URL for application queries (connection pooling)
 *
 * Environment variables from Neon DB integration in Vercel
 */

// Get connection string from environment
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create node-postgres pool with connection pooling
export const pool = new Pool({
  connectionString,
  max: 10,                      // Maximum connections in pool
  idleTimeoutMillis: 20000,     // Close idle connections after 20 seconds
  connectionTimeoutMillis: 10000, // Connection timeout (10 seconds)
})

// Create Drizzle ORM instance
export const db = drizzle({ client: pool })

/**
 * Graceful shutdown helper
 * Call this when your application is shutting down
 */
export async function closeDatabase() {
  await pool.end()
  console.log('Database connection closed')
}
