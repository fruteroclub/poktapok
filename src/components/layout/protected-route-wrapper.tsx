'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Spinner from '../common/spinner'
import PageWrapper from '../layout/page-wrapper'
import { toast } from 'sonner'
import { usePrivy } from '@privy-io/react-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authenticated: isAuthenticated, ready: isPrivyReady } = usePrivy()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isPrivyReady && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isPrivyReady, router, pathname])

  if (!isPrivyReady) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content flex flex-col items-center gap-y-8 pb-12 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <Spinner size="12" />
            <p className="text-center text-2xl">Loading...</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!isAuthenticated) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content flex flex-col items-center gap-y-8 pb-12 md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <Spinner size="12" />
            <p className="text-center text-2xl">Redirecting...</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return <>{children}</>
}
