import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16+
  turbopack: {
    // Resolve only these extensions
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },

  // Only process these file extensions as pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Exclude problematic packages from server-side bundling
  serverExternalPackages: [
    'thread-stream',
    'pino',
    'pino-pretty',
    '@reown/appkit',
    '@privy-io/server-auth',
  ],

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/profile_images/**',
      },
      {
        // Convex storage for user avatars
        protocol: 'https',
        hostname: '**.convex.cloud',
        port: '',
        pathname: '/api/storage/**',
      },
      {
        // Luma CDN for event cover images
        protocol: 'https',
        hostname: 'images.lumacdn.com',
        port: '',
        pathname: '/**',
      },
      {
        // Luma alternative CDN
        protocol: 'https',
        hostname: 'cdn.lu.ma',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
