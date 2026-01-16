'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { User, Mail, AtSign, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import debounce from 'lodash.debounce'

interface UserInfoFormProps {
  values: {
    avatarFile: File | null
    username: string
    email: string
    displayName: string
    bio: string
  }
  onChange: (field: string, value: string | File | null) => void
  errors?: Partial<Record<keyof UserInfoFormProps['values'], string>>
  checkUsernameAvailability?: (username: string) => Promise<boolean>
  currentUser?: {
    email?: string
    ethAddress?: `0x${string}` | null
  }
}

export function UserInfoForm({
  values,
  onChange,
  errors,
  checkUsernameAvailability,
  currentUser,
}: UserInfoFormProps) {
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  // Debounced username availability check
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (!checkUsernameAvailability || !username || username.length < 3) {
        setUsernameAvailable(null)
        return
      }

      // Validate format first
      const validFormat = /^[a-z0-9_]{3,50}$/.test(username)
      if (!validFormat) {
        setUsernameAvailable(null)
        return
      }

      setIsCheckingUsername(true)
      try {
        const available = await checkUsernameAvailability(username)
        setUsernameAvailable(available)
      } catch (error) {
        console.error('Error checking username:', error)
        setUsernameAvailable(null)
      } finally {
        setIsCheckingUsername(false)
      }
    }, 500),
    [checkUsernameAvailability]
  )

  // Check username when it changes
  useEffect(() => {
    if (values.username) {
      checkUsername(values.username)
    } else {
      setUsernameAvailable(null)
    }
  }, [values.username, checkUsername])

  // Pre-fill email from current user if available
  useEffect(() => {
    if (currentUser?.email && !values.email) {
      onChange('email', currentUser.email)
    }
  }, [currentUser?.email, values.email, onChange])

  const handleAvatarSelect = (file: File | null) => {
    onChange('avatarFile', file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Crea tu perfil</h3>
        <p className="text-sm text-muted-foreground">
          Configura tu información básica para que otros puedan conocerte.
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4">
        <AvatarUpload
          currentAvatarUrl={null}
          username={values.username}
          displayName={values.displayName}
          ethAddress={currentUser?.ethAddress}
          onFileSelect={handleAvatarSelect}
        />
        <p className="text-xs text-muted-foreground text-center">
          Sube una foto de perfil (opcional)
        </p>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username" className="flex items-center gap-2">
          <AtSign className="h-4 w-4" />
          Nombre de usuario
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="username"
            type="text"
            placeholder="tu_nombre_usuario"
            value={values.username}
            onChange={(e) => {
              const value = e.target.value.toLowerCase()
              onChange('username', value)
            }}
            className={cn(
              errors?.username ? 'border-destructive' : '',
              values.username && !errors?.username && 'pr-10'
            )}
          />
          {/* Username status indicator */}
          {values.username && !errors?.username && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCheckingUsername ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : usernameAvailable === true ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : usernameAvailable === false ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : null}
            </div>
          )}
        </div>
        {errors?.username && (
          <p className="text-sm text-destructive">{errors.username}</p>
        )}
        {!errors?.username && usernameAvailable === false && (
          <p className="text-sm text-destructive">Este nombre de usuario ya está en uso</p>
        )}
        <p className="text-xs text-muted-foreground">
          3-50 caracteres, solo minúsculas, números y guiones bajos
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Correo electrónico
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@correo.com"
          value={values.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={errors?.email ? 'border-destructive' : ''}
          disabled={!!currentUser?.email}
        />
        {errors?.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
        {currentUser?.email && (
          <p className="text-xs text-muted-foreground">
            Usando el correo de tu cuenta
          </p>
        )}
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Nombre para mostrar
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Tu Nombre Completo"
          value={values.displayName}
          onChange={(e) => onChange('displayName', e.target.value)}
          className={errors?.displayName ? 'border-destructive' : ''}
          maxLength={100}
        />
        {errors?.displayName && (
          <p className="text-sm text-destructive">{errors.displayName}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre real o el nombre que prefieres usar
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Biografía
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <div className="relative">
          <Textarea
            id="bio"
            placeholder="Cuéntanos un poco sobre ti..."
            value={values.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            className={cn(
              'min-h-[100px] resize-none',
              errors?.bio ? 'border-destructive' : ''
            )}
            maxLength={280}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {values.bio.length}/280
          </div>
        </div>
        {errors?.bio && (
          <p className="text-sm text-destructive">{errors.bio}</p>
        )}
      </div>
    </div>
  )
}