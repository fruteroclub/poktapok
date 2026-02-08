'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'
import { Loader2, Clock, Pencil, Check, X } from 'lucide-react'
import { useEffect } from 'react'
import PageWrapper from '@/components/layout/page-wrapper'
import { ProtectedRoute } from '@/components/layout/protected-route-wrapper'
import { Section } from '@/components/layout/section'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { toast } from 'sonner'
import { AvatarUpload } from '@/components/profile/avatar-upload'

/**
 * Profile Page - User's own profile with inline editing
 */
export default function ProfilePage() {
  const { authenticated, ready, getAccessToken } = usePrivy()
  const router = useRouter()
  const { user, profile, isLoading } = useAuth()

  const [isEditingUser, setIsEditingUser] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const updateUserMutation = useMutation(api.auth.updateUser)
  const updateProfileMutation = useMutation(api.profiles.update)

  // Initialize form values when data loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setBio(user.bio || '')
    }
    if (profile) {
      setCity(profile.city || '')
      setCountry(profile.country || '')
    }
  }, [user, profile])

  // Redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/')
    }
  }, [authenticated, ready, router])

  // Redirect if user hasn't completed onboarding
  useEffect(() => {
    if (user) {
      if (user.accountStatus === 'incomplete' || !user.username) {
        router.push('/onboarding')
      }
    }
  }, [user, router])

  // Get privyDid from Privy
  const privyDid = usePrivy().user?.id

  const handleSaveUser = async () => {
    if (!user || !privyDid) return
    setIsSaving(true)
    try {
      await updateUserMutation({
        privyDid,
        displayName,
        bio,
      })
      toast.success('Perfil actualizado')
      setIsEditingUser(false)
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error al actualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      await updateProfileMutation({
        profileId: profile.id as any,
        city,
        country,
      })
      toast.success('Perfil actualizado')
      setIsEditingProfile(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      const token = await getAccessToken()
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profiles/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      const data = await response.json()
      toast.success('Avatar actualizado')
      // Refresh will happen automatically via Convex
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Error al subir avatar')
    }
  }

  // Loading state
  if (!ready || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
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
            {/* Page Header */}
            <div className="header-section">
              <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
              <p className="text-muted-foreground">
                Ve y edita tu información de perfil
              </p>

              {/* Pending Approval Banner */}
              {user.accountStatus === 'pending' && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900 dark:text-amber-100">
                    Perfil en Revisión
                  </AlertTitle>
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    Tu perfil está siendo revisado por nuestro equipo.
                    Te notificaremos por email cuando sea aprobado.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Section>
              <div className="grid w-full gap-6 md:grid-cols-2">
                {/* User Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Información Básica</CardTitle>
                    {!isEditingUser ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingUser(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingUser(false)}
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveUser}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback className="text-xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <AvatarUpload
                        currentAvatarUrl={user.avatarUrl}
                        username={user.username || undefined}
                        displayName={user.displayName}
                        onFileSelect={async (file) => {
                          if (file) await handleAvatarUpload(file)
                        }}
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <Label className="text-muted-foreground">Username</Label>
                      <p className="font-medium">@{user.username}</p>
                    </div>

                    {/* Display Name */}
                    <div>
                      <Label>Nombre</Label>
                      {isEditingUser ? (
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Tu nombre"
                        />
                      ) : (
                        <p className="font-medium">
                          {user.displayName || '-'}
                        </p>
                      )}
                    </div>

                    {/* Bio */}
                    <div>
                      <Label>Bio</Label>
                      {isEditingUser ? (
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Cuéntanos sobre ti..."
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {user.bio || 'Sin bio'}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    {user.email && (
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="text-sm">{user.email}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div>
                      <Label className="text-muted-foreground">Estado</Label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            user.accountStatus === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {user.accountStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Card */}
                {profile && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Detalles del Perfil</CardTitle>
                      {!isEditingProfile ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingProfile(true)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingProfile(false)}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Location */}
                      <div>
                        <Label>Ubicación</Label>
                        {isEditingProfile ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Ciudad"
                            />
                            <Input
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              placeholder="País"
                            />
                          </div>
                        ) : (
                          <p className="font-medium">
                            {profile.city && profile.country
                              ? `${profile.city}, ${profile.country}`
                              : 'Sin ubicación'}
                          </p>
                        )}
                      </div>

                      {/* Learning Tracks */}
                      {profile.learningTracks &&
                        profile.learningTracks.length > 0 && (
                          <div>
                            <Label className="text-muted-foreground">
                              Learning Tracks
                            </Label>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {profile.learningTracks.map((track) => (
                                <Badge key={track} variant="secondary">
                                  {track.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Availability */}
                      <div>
                        <Label className="text-muted-foreground">
                          Disponibilidad
                        </Label>
                        <p className="text-sm capitalize">
                          {profile.availabilityStatus?.replace(/_/g, ' ') ||
                            'No especificado'}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-2xl font-bold">
                            {profile.completedBounties || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Proyectos
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            ${profile.totalEarningsUsd || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ganado
                          </p>
                        </div>
                      </div>

                      {/* Social Links */}
                      {(profile.githubUsername || profile.twitterUsername) && (
                        <div className="pt-4 border-t">
                          <Label className="text-muted-foreground">
                            Redes Sociales
                          </Label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {profile.githubUsername && (
                              <Badge variant="outline">
                                GitHub: {profile.githubUsername}
                              </Badge>
                            )}
                            {profile.twitterUsername && (
                              <Badge variant="outline">
                                Twitter: {profile.twitterUsername}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </Section>
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  )
}
