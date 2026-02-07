'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { ProtectedRoute } from '@/components/layout/protected-route-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Section } from '@/components/layout/section'

/**
 * Dashboard Page - User's home page after completing profile
 * - Displays user info and profile summary
 * - Shows completion status
 * - Links to profile edit
 */
export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, isLoading, isAuthenticated } = useAuth()

  // Redirect if user hasn't completed onboarding
  useEffect(() => {
    if (user) {
      if (user.accountStatus === 'incomplete' || !user.username) {
        router.push('/onboarding')
      } else if (!profile) {
        // User completed onboarding but not profile
        router.push('/profile')
      }
    }
  }, [user, profile, router])

  // Handle unauthenticated state
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <PageWrapper>
          <div className="page">
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </PageWrapper>
      </ProtectedRoute>
    )
  }

  // No data state
  if (!user || !profile) {
    return null
  }

  const initials = (user.displayName || user.username || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            {/* Welcome Header */}
            <div className="header-section">
              <h1 className="text-3xl font-bold tracking-tight">
                ¡Hola {user.displayName || user.username}!
              </h1>
            </div>

            <Section className="gap-y-4">
              {/* User Profile Card */}
              <Card className="w-full">
                {/* <CardHeader>
                  <CardTitle>Tu Perfil</CardTitle>
                  <CardDescription>
                    Así es como apareces en el directorio de talento
                  </CardDescription>
                </CardHeader> */}
                <CardContent className="space-y-4">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">
                        {user.displayName || user.username}
                      </h3>
                      <p className="text-muted-foreground">@{user.username}</p>
                      {user.bio && <p className="text-sm">{user.bio}</p>}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="grid gap-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Ubicación
                        </p>
                        <p className="text-sm">
                          {profile.city}, {profile.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Learning Track
                        </p>
                        <p className="text-sm capitalize">
                          {profile.learningTracks[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Estado
                        </p>
                        <p className="text-sm capitalize">
                          {profile.availabilityStatus.replace(/_/g, ' ')}
                        </p>
                      </div>
                      {user.email && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Email
                          </p>
                          <p className="text-sm">{user.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex w-full justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/profile')}
                    >
                      Editar Perfil
                    </Button>
                    <Button onClick={() => router.push('/directory')}>
                      Ver Directorio
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats / Future sections can go here */}
              <div className="grid w-full gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Perfil Completo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      100%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Todos los campos requeridos completados
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Estado de Cuenta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">
                      {user.accountStatus}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tu cuenta está activa
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Visibilidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Público</div>
                    <p className="text-xs text-muted-foreground">
                      Visible en el directorio de talento
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  )
}
