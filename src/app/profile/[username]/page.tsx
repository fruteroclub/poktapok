'use client'

import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Loader2, MapPin, Github, Twitter, Linkedin, MessageCircle, ArrowLeft } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string

  const data = useQuery(api.profiles.getByUsername, { username })

  if (data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || !data.user) {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section>
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h1 className="text-2xl font-bold">Usuario no encontrado</h1>
                <p className="mt-2 text-muted-foreground">
                  El perfil @{username} no existe o no está disponible.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/directory">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al directorio
                  </Link>
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const { user, profile } = data

  // Only show active users publicly
  if (user.accountStatus !== 'active') {
    return (
      <PageWrapper>
        <div className="page">
          <div className="page-content">
            <Section>
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <h1 className="text-2xl font-bold">Perfil no disponible</h1>
                <p className="mt-2 text-muted-foreground">
                  Este perfil aún no está activo.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/directory">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al directorio
                  </Link>
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const initials = (user.displayName || user.username || '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-content space-y-6">
          {/* Back button */}
          <Section>
            <Button variant="ghost" asChild>
              <Link href="/directory">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Directorio
              </Link>
            </Button>
          </Section>

          {/* Profile Header */}
          <Section>
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold">
                      {user.displayName || user.username}
                    </h1>
                    <p className="text-lg text-muted-foreground">@{user.username}</p>

                    {/* Location */}
                    {profile?.city && profile?.country && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-muted-foreground sm:justify-start">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.city}, {profile.country}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {user.bio && (
                      <p className="mt-4 max-w-2xl text-muted-foreground">
                        {user.bio}
                      </p>
                    )}

                    {/* Learning Tracks */}
                    {profile?.learningTracks && profile.learningTracks.length > 0 && (
                      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                        {profile.learningTracks.map((track) => (
                          <Badge key={track} variant="secondary">
                            {track.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                      {profile?.githubUsername && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://github.com/${profile.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="mr-2 h-4 w-4" />
                            {profile.githubUsername}
                          </a>
                        </Button>
                      )}
                      {profile?.twitterUsername && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://twitter.com/${profile.twitterUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter className="mr-2 h-4 w-4" />
                            {profile.twitterUsername}
                          </a>
                        </Button>
                      )}
                      {profile?.linkedinUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="mr-2 h-4 w-4" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      {profile?.telegramUsername && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://t.me/${profile.telegramUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            {profile.telegramUsername}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Stats */}
          <Section>
            <div className="grid w-full gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Proyectos Completados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {profile?.completedBounties || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Ganado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    ${profile?.totalEarningsUsd || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Disponibilidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={
                      profile?.availabilityStatus === 'available'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-sm"
                  >
                    {profile?.availabilityStatus === 'available'
                      ? 'Disponible'
                      : profile?.availabilityStatus === 'open_to_offers'
                        ? 'Abierto a ofertas'
                        : 'No disponible'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* Future: Projects/Portfolio section */}
          {/* 
          <Section>
            <h2 className="text-2xl font-bold mb-4">Proyectos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Section>
          */}
        </div>
      </div>
    </PageWrapper>
  )
}
