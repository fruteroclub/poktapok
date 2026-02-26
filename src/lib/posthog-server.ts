import { PostHog } from 'posthog-node'

/**
 * Creates a PostHog client for server-side event tracking.
 * Always call `await posthog.shutdown()` after capturing events.
 * 
 * @example
 * const posthog = createPostHogServer()
 * posthog.capture({ distinctId: userId, event: 'signup_completed' })
 * await posthog.shutdown()
 */
export function createPostHogServer() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  })
}
