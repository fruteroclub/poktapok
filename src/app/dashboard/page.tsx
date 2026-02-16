'use client'

import { useAuth } from '@/hooks/use-auth'
import { useAuthWithConvex } from '@/hooks/use-auth-with-convex'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Loader2, Copy, Check, Trash2, UserPlus, Gift, Target, ArrowRight, Clock, GraduationCap } from 'lucide-react'
import { useMyBounties, useOpenBounties, getDifficultyColor, getDifficultyDisplayName, formatReward } from '@/hooks/use-bounties'
import Link from 'next/link'
import PageWrapper from '@/components/layout/page-wrapper'
import { ProtectedRoute } from '@/components/layout/protected-route-wrapper'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Section } from '@/components/layout/section'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { user: privyUser } = usePrivy()
  const { user, profile, isLoading, isAuthenticated } = useAuth()
  const { convexUser } = useAuthWithConvex()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const privyDid = privyUser?.id

  // Invitations
  const invitationsData = useQuery(
    api.invitations.getMyInvitations,
    privyDid ? { privyDid } : 'skip'
  )
  
  // Bootcamp
  const bootcampStatus = useQuery(
    api.bootcamp.getUserBootcampStatus,
    convexUser?._id ? { userId: convexUser._id } : 'skip'
  )

  // Bounties
  const { claims: myBounties, isLoading: bountiesLoading } = useMyBounties(convexUser?._id)
  const { bounties: openBounties } = useOpenBounties({ limit: 1 })
  const showBountiesSection = myBounties.length > 0 || openBounties.length > 0
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
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al crear invitación')
    }
  }

  const handleCopyCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/invite/${code}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedCode(code)
    toast.success('Link copiado al portapapeles')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!privyDid) return
    try {
      await removeInvitation({ invitationId: invitationId as Id<"invitations">, privyDid })
      toast.success('Invitación eliminada')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar')
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

                  <div className="flex w-full flex-wrap justify-center gap-3">
                    <Button variant="outline" onClick={() => router.push('/profile')}>
                      Editar Perfil
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/portfolio')}>
                      Mi Portfolio
                    </Button>
                    <Button onClick={() => router.push('/directory')}>Ver Directorio</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bootcamp Progress */}
              {bootcampStatus?.isParticipant && bootcampStatus.enrollments.length > 0 && (
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          Mi Bootcamp
                        </CardTitle>
                        <CardDescription>
                          Tu progreso en programas activos
                        </CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/bootcamp/vibecoding">
                          Ir al Bootcamp
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bootcampStatus.enrollments.map(({ enrollment, program }) => (
                        <div key={enrollment._id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{program?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.status === 'completed'
                                ? 'Completado'
                                : `${enrollment.sessionsCompleted}/${program?.sessionsCount || 5} sesiones`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32">
                              <Progress value={enrollment.progress} className="h-2" />
                            </div>
                            <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                              {enrollment.progress}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                              <code className="rounded border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-sm text-primary">
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

              {/* Mis Bounties - only show if there are bounties or user has claims */}
              {showBountiesSection && (
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Mis Bounties
                        </CardTitle>
                        <CardDescription>
                          Tus bounties reclamados y en progreso
                        </CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/bounties">
                          Ver todos
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {bountiesLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : myBounties.length > 0 ? (
                      <div className="space-y-3">
                        {myBounties.slice(0, 5).map((claim) => (
                          <Link
                            key={claim._id}
                            href={`/bounties/${claim.bountyId}`}
                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                          >
                            <div className="flex-1">
                              <p className="font-medium line-clamp-1">
                                {claim.bounty?.title || 'Bounty'}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                {claim.bounty && (
                                  <>
                                    <Badge className={getDifficultyColor(claim.bounty.difficulty)}>
                                      {getDifficultyDisplayName(claim.bounty.difficulty)}
                                    </Badge>
                                    <span className="text-green-600 dark:text-green-400">
                                      {formatReward(claim.bounty.rewardAmount, claim.bounty.rewardCurrency)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <Badge
                                variant={
                                  claim.status === 'approved' ? 'default' :
                                  claim.status === 'submitted' ? 'secondary' :
                                  claim.status === 'active' ? 'outline' :
                                  'destructive'
                                }
                              >
                                {claim.status === 'active' ? 'En progreso' :
                                 claim.status === 'submitted' ? 'En revisión' :
                                 claim.status === 'approved' ? 'Aprobado' :
                                 claim.status === 'rejected' ? 'Rechazado' :
                                 claim.status === 'expired' ? 'Expirado' : 'Abandonado'}
                              </Badge>
                              {claim.status === 'active' && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {new Date(claim.expiresAt).toLocaleDateString('es-MX')}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No tienes bounties aún
                        </p>
                        <Button asChild className="mt-4">
                          <Link href="/bounties">Explorar Bounties</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid w-full gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ganado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${profile.totalEarningsUsd || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">total USD</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Proyectos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{profile.projectsCount || 0}</div>
                    <p className="text-xs text-muted-foreground">en portfolio</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Invitaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inviteUsed}/{inviteLimit}</div>
                    <p className="text-xs text-muted-foreground">usadas</p>
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
