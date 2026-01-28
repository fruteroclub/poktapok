'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import MultiStepOnboardingFormEnhanced from '@/components/onboarding/multi-step-onboarding-form-enhanced'
import PageWrapper from '@/components/layout/page-wrapper'
import { ProtectedRoute } from '@/components/layout/protected-route-wrapper'
import { Section } from '@/components/layout/section'

export default function OnboardingPage() {
  const { authenticated, ready } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    // Redirect to home if not authenticated
    if (ready && !authenticated) {
      router.push('/')
    }
  }, [authenticated, ready, router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <div className="header-section">
              <h1 className="text-3xl font-bold">Completa tu perfil</h1>
              <p className="text-muted-foreground">
                Completa tu información para empezar a usar la plataforma
              </p>
            </div>
            <Section className="gap-y-4 pt-0!">
              <MultiStepOnboardingFormEnhanced />
            </Section>
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  )
}
