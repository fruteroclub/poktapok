import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

export default defineConfig({
  // Schema location
  schema: './drizzle/schema/index.ts',

  // Output directory for migrations
  out: './drizzle/migrations',

  // Database dialect
  dialect: 'postgresql',

  // Database credentials
  dbCredentials: {
    // Use non-pooling URL for migrations (direct connection)
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },

  // Verbose logging
  verbose: true,

  // Strict mode (fail on warnings)
  strict: true,

  // Migration configuration
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public',
  },
})
