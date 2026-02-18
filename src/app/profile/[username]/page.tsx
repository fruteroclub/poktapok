'use client'

import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Loader2, MapPin, Github, Twitter, Linkedin, MessageCircle, ArrowLeft, ExternalLink, Play, GraduationCap } from 'lucide-react'
import PageWrapper from '@/components/layout/page-wrapper'
import { Section } from '@/components/layout/section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SkillsSection } from '@/components/skills/skills-section'
import { useAuth } from '@/hooks'

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { user: currentUser } = useAuth()

  const data = useQuery(api.profiles.getByUsername, { username })
  const projectsData = useQuery(api.projects.getByUsername, { username })
  const bootcampEnrollments = useQuery(api.bootcamp.getEnrollmentsByUsername, { username })
  
  const projects = projectsData?.projects ?? []
  const isOwnProfile = currentUser?.username === username

  if (data === undefined || projectsData === undefined) {
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

  const { user, profile, invitedBy } = data

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

                    {/* Invited By */}
                    {invitedBy && (
                      <p className="text-sm text-muted-foreground">
                        Invitado por{' '}
                        <Link 
                          href={`/profile/${invitedBy.username}`}
                          className="text-primary hover:underline"
                        >
                          @{invitedBy.username}
                        </Link>
                      </p>
                    )}

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

          {/* Skills Section - only show if own profile or has skills */}
          <SkillsSectionWrapper username={username} isOwnProfile={isOwnProfile} />

          {/* Bootcamp Enrollments */}
          {bootcampEnrollments && bootcampEnrollments.length > 0 && (
            <Section>
              <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Programas
              </h2>
              <div className="grid w-full gap-4">
                {bootcampEnrollments.map(({ enrollment, program }) => (
                  <Card key={enrollment._id} className={enrollment.status === 'completed' ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {enrollment.status === 'completed' && (
                              <span className="text-2xl">🏅</span>
                            )}
                            <h3 className="font-semibold text-lg">{program?.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.status === 'completed'
                              ? '✅ Completado'
                              : `${enrollment.sessionsCompleted}/${program?.sessionsCount || 5} sesiones`}
                          </p>
                          {enrollment.status === 'completed' && enrollment.poapClaimedAt && (
                            <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                              🏆 POAP Certificado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${enrollment.status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>
                              {enrollment.progress}%
                            </p>
                          </div>
                          {enrollment.status !== 'completed' && (
                            <div className="w-32">
                              <Progress value={enrollment.progress} className="h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>
          )}

          {/* Stats */}
          <Section>
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Proyectos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {profile?.projectsCount || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bounties Completados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {profile?.completedBounties || 0}
                  </p>
                </CardContent>
              </Card>

              {(profile?.totalEarningsUsd ?? 0) > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Ganado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${profile?.totalEarningsUsd?.toLocaleString() || 0}
                    </p>
                  </CardContent>
                </Card>
              )}

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

          {/* Projects Section */}
          {projects.length > 0 && (
            <Section>
              <h2 className="mb-4 text-2xl font-bold">Portfolio</h2>
              <div className="grid w-full gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <Card key={project._id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                      {project.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {/* Tech Stack */}
                      {project.techStack && project.techStack.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {project.techStack.map((tech, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-primary/20 bg-primary/5 text-foreground">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {/* Links */}
                      <div className="flex flex-wrap gap-2">
                        {project.githubUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="mr-1 h-3 w-3" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demoUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Demo
                            </a>
                          </Button>
                        )}
                        {project.videoUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={project.videoUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="mr-1 h-3 w-3" />
                              Video
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

/**
 * Wrapper that only shows skills card if there are skills
 */
function SkillsSectionWrapper({ username, isOwnProfile }: { username: string; isOwnProfile: boolean }) {
  const skillsData = useQuery(api.skills.getUserSkillsByUsername, { username })
  
  // Loading state - don't show anything
  if (skillsData === undefined) return null
  
  // No skills and not own profile - don't show
  if (skillsData.length === 0 && !isOwnProfile) return null
  
  return (
    <Section>
      <Card className="w-full">
        <CardContent className="pt-6">
          <SkillsSection username={username} isOwnProfile={isOwnProfile} />
        </CardContent>
      </Card>
    </Section>
  )
}
