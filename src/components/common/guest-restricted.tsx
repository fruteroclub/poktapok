'use client'

import { useMe } from '@/hooks/use-auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { ReactNode } from 'react'

interface GuestRestrictedProps {
  children: ReactNode
  fallback?: ReactNode
  showMessage?: boolean
}

/**
 * Wrapper component that prevents guest users from accessing content.
 * Only active members and non-guest users see the children.
 */
export function GuestRestricted({
  children,
  fallback,
  showMessage = true,
}: GuestRestrictedProps) {
  const { data, isLoading } = useMe()

  if (isLoading) {
    return null
  }

  const isGuest = data?.user.accountStatus === 'guest'

  if (!isGuest) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showMessage) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Guest Access Restricted</AlertTitle>
        <AlertDescription>
          This feature is not available for guest users. Continue participating
          in your program to earn full membership.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
