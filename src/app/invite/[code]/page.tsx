'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Loader2, UserPlus, Gift, AlertCircle } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const { authenticated, ready, login } = usePrivy()

  // Validate invitation code
  const validation = useQuery(api.invitations.validate, { inviteCode: code })

  // If authenticated, redirect to onboarding with invite code
  useEffect(() => {
    if (ready && authenticated) {
      router.push(`/onboarding?invite=${code}`)
    }
  }, [ready, authenticated, router, code])

  // Loading state
  if (!ready || validation === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If authenticated, show loading while redirecting
  if (authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Redirigiendo al onboarding...</p>
        </div>
      </div>
    )
  }

  // Invalid or expired invitation
  if (!validation.valid) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section>
              <Card className="mx-auto max-w-md">
                <CardHeader className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                  <CardTitle className="mt-4">Invitación no válida</CardTitle>
                  <CardDescription>
                    {validation.error || 'Este código de invitación no es válido o ha expirado.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={() => router.push('/')}>
                    Ir al inicio
                  </Button>
                </CardContent>
              </Card>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // Valid invitation - show login prompt
  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content">
          <Section>
            <Card className="mx-auto max-w-md">
              <CardHeader className="text-center">
                <Gift className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4">¡Estás invitado!</CardTitle>
                <CardDescription>
                  {validation.inviter?.displayName || validation.inviter?.username} te ha invitado a unirte a Frutero Club
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <UserPlus className="h-4 w-4" />
                  <AlertDescription>
                    Como invitado, tu cuenta será <strong>activada automáticamente</strong> sin necesidad de esperar aprobación.
                  </AlertDescription>
                </Alert>
                
                <div className="text-center">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Crea tu cuenta para continuar
                  </p>
                  <Button size="lg" onClick={() => {
                    // Save invite code before login (Privy may redirect elsewhere)
                    localStorage.setItem('pendingInviteCode', code)
                    login()
                  }}>
                    Crear cuenta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    </PageWrapper>
  )
}
