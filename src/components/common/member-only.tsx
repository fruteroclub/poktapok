'use client'

import { useAuth } from '@/hooks/use-auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lock } from 'lucide-react'
import { ReactNode } from 'react'

interface MemberOnlyProps {
  children: ReactNode
  fallback?: ReactNode
  showMessage?: boolean
}

/**
 * Wrapper component that only renders children for active (full member) users.
 * Guest users see fallback content or a restriction message.
 */
export function MemberOnly({
  children,
  fallback,
  showMessage = true,
}: MemberOnlyProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  const isActiveMember = user?.accountStatus === 'active'

  if (isActiveMember) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showMessage) {
    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>Member Access Required</AlertTitle>
        <AlertDescription>
          This feature is only available to full members. Guest users must earn
          membership through program participation.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
