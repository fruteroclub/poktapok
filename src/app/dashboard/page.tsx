'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Loader2, Copy, Check, Trash2, UserPlus, Gift } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { ProtectedRoute } from '@/components/layout/protected-route-wrapper'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Section } from '@/components/layout/section'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { user: privyUser } = usePrivy()
  const { user, profile, isLoading, isAuthenticated } = useAuth()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const privyDid = privyUser?.id

  // Invitations
  const invitationsData = useQuery(
    api.invitations.getMyInvitations,
    privyDid ? { privyDid } : 'skip'
  )
  const createInvitation = useMutation(api.invitations.create)
  const removeInvitation = useMutation(api.invitations.remove)

  // Redirects
  useEffect(() => {
    if (user) {
      if (user.accountStatus === 'incomplete' || !user.username) {
        router.push('/onboarding')
      } else if (!profile) {
        router.push('/profile')
      }
    }
  }, [user, profile, router])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  const handleCreateInvitation = async () => {
    if (!privyDid) return
    try {
      const result = await createInvitation({ inviterPrivyDid: privyDid })
      toast.success(`Invitación creada: ${result.inviteCode}`)
    } catch (error: any) {
      toast.error(error.message || 'Error al crear invitación')
    }
  }

  const handleCopyCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/onboarding?invite=${code}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedCode(code)
    toast.success('Link copiado al portapapeles')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!privyDid) return
    try {
      await removeInvitation({ invitationId: invitationId as any, privyDid })
      toast.success('Invitación eliminada')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar')
    }
  }

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

  if (!user || !profile) {
    return null
  }

  const initials = (user.displayName || user.username || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const invitations = invitationsData?.invitations || []
  const inviteLimit = invitationsData?.limit || 2
  const inviteUsed = invitationsData?.used || 0
  const canCreateInvite = user.accountStatus === 'active' && inviteUsed < inviteLimit

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
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">
                        {user.displayName || user.username}
                      </h3>
                      <p className="text-muted-foreground">@{user.username}</p>
                      {user.bio && <p className="text-sm">{user.bio}</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                        <p className="text-sm">{profile.city}, {profile.country}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Learning Track</p>
                        <p className="text-sm capitalize">{profile.learningTracks[0]}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full justify-center gap-3">
                    <Button variant="outline" onClick={() => router.push('/profile')}>
                      Editar Perfil
                    </Button>
                    <Button onClick={() => router.push('/directory')}>Ver Directorio</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Invitations Section */}
              {user.accountStatus === 'active' && (
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Gift className="h-5 w-5" />
                          Invitaciones
                        </CardTitle>
                        <CardDescription>
                          Invita amigos a unirse ({inviteUsed}/{inviteLimit} usadas)
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handleCreateInvitation}
                        disabled={!canCreateInvite}
                        size="sm"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Nueva Invitación
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {invitations.length > 0 ? (
                      <div className="space-y-3">
                        {invitations.map((inv) => (
                          <div
                            key={inv._id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                {inv.inviteCode}
                              </code>
                              <Badge
                                variant={
                                  inv.status === 'redeemed'
                                    ? 'default'
                                    : inv.status === 'expired'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {inv.status === 'redeemed'
                                  ? 'Usada'
                                  : inv.status === 'expired'
                                    ? 'Expirada'
                                    : 'Pendiente'}
                              </Badge>
                              {inv.redeemer && (
                                <span className="text-sm text-muted-foreground">
                                  por @{inv.redeemer.username}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {inv.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopyCode(inv.inviteCode)}
                                  >
                                    {copiedCode === inv.inviteCode ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteInvitation(inv._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No tienes invitaciones aún. ¡Crea una para invitar a tus amigos!
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid w-full gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Perfil Completo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <p className="text-xs text-muted-foreground">Todos los campos completados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Estado de Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{user.accountStatus}</div>
                    <p className="text-xs text-muted-foreground">
                      {user.accountStatus === 'active' ? 'Tu cuenta está activa' : 'Pendiente de aprobación'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Invitaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inviteUsed}/{inviteLimit}</div>
                    <p className="text-xs text-muted-foreground">Invitaciones usadas</p>
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
