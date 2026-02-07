'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2 } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * AdminRoute - Frontend protection for admin-only pages
 *
 * Checks if user is authenticated and has admin role before rendering children.
 * Redirects to appropriate page if checks fail:
 * - Not authenticated → redirect to home
 * - Authenticated but not admin → redirect to activities page
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter()
  const { authenticated, ready } = usePrivy()
  const { user, isLoading } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/')
    }
  }, [authenticated, ready, router])

  // Redirect if not admin
  useEffect(() => {
    if (ready && authenticated && user && !isAdmin) {
      router.push('/activities')
    }
  }, [ready, authenticated, user, isAdmin, router])

  // Loading state
  if (!ready || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated or not admin
  if (!authenticated || !user || !isAdmin) {
    return null
  }

  // User is admin - render protected content
  return <>{children}</>
}
