'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { type ReactNode } from 'react'

// Create the Convex client
// Fallback to production URL if env var is missing
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://brainy-porcupine-595.convex.cloud"
const convex = new ConvexReactClient(convexUrl)

/**
 * Convex Provider
 *
 * Wraps the app with Convex context for real-time queries.
 * The NEXT_PUBLIC_CONVEX_URL is set automatically by `npx convex dev`
 * and should be added to Vercel environment variables for production.
 */
export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
