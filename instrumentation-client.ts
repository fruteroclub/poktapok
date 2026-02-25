import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2026-01-30',
  // Capture pageviews automatically
  capture_pageview: true,
  // Capture clicks and other interactions
  autocapture: true,
})

export { posthog }
