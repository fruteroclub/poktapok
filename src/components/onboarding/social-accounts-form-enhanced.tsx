'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialAccountsFormProps {
  values: {
    githubUsername?: string
    twitterUsername?: string
    linkedinUsername?: string
    telegramUsername?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Partial<Record<keyof SocialAccountsFormProps['values'], string>>
}

export function SocialAccountsFormEnhanced({
  values,
  onChange,
  errors,
}: SocialAccountsFormProps) {
  // Helper to create input groups with URL prefixes
  const InputWithPrefix = ({
    id,
    label,
    icon: Icon,
    prefix,
    placeholder,
    value,
    field,
    error,
    helpText,
    optional = true,
  }: {
    id: string
    label: string
    icon: typeof Github
    prefix: string
    placeholder: string
    value?: string
    field: string
    error?: string
    helpText: string
    optional?: boolean
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        )}
      </Label>
      <div className="flex items-stretch">
        <span className="flex items-center px-3 text-sm text-muted-foreground bg-secondary rounded-l-md border border-r-0">
          {prefix}
        </span>
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => {
            // Remove any URL prefix if user pastes full URL
            let val = e.target.value
            if (val.includes(prefix)) {
              val = val.split(prefix).pop() || ''
            }
            // Remove @ if present
            val = val.replace('@', '')
            onChange(field, val)
          }}
          className={cn(
            'rounded-l-none',
            error ? 'border-destructive' : ''
          )}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">
          Conecta tus cuentas sociales
        </h3>
        <p className="text-sm text-muted-foreground">
          Vincula tus perfiles para que podamos validar tu identidad y
          actividad. Solo ingresa tu nombre de usuario.
        </p>
      </div>

      {/* GitHub */}
      <InputWithPrefix
        id="githubUsername"
        label="GitHub"
        icon={Github}
        prefix="github.com/"
        placeholder="tu-usuario"
        value={values.githubUsername}
        field="githubUsername"
        error={errors?.githubUsername}
        helpText="Tu nombre de usuario de GitHub (altamente recomendado)"
        optional={false}
      />

      {/* LinkedIn */}
      <InputWithPrefix
        id="linkedinUsername"
        label="LinkedIn"
        icon={Linkedin}
        prefix="linkedin.com/in/"
        placeholder="tu-perfil"
        value={values.linkedinUsername}
        field="linkedinUsername"
        error={errors?.linkedinUsername}
        helpText="El identificador de tu perfil de LinkedIn"
      />

      {/* Twitter/X */}
      <InputWithPrefix
        id="twitterUsername"
        label="X (Twitter)"
        icon={Twitter}
        prefix="x.com/"
        placeholder="tu_usuario"
        value={values.twitterUsername}
        field="twitterUsername"
        error={errors?.twitterUsername}
        helpText="Tu nombre de usuario de X/Twitter"
      />

      {/* Telegram */}
      <div className="space-y-2">
        <Label htmlFor="telegramUsername" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Telegram
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <div className="flex items-stretch">
          <span className="flex items-center px-3 text-sm text-muted-foreground bg-secondary rounded-l-md border border-r-0">
            @
          </span>
          <Input
            id="telegramUsername"
            type="text"
            placeholder="tu_usuario"
            value={values.telegramUsername || ''}
            onChange={(e) => {
              // Remove @ if user includes it
              const val = e.target.value.replace('@', '')
              onChange('telegramUsername', val)
            }}
            className={cn(
              'rounded-l-none',
              errors?.telegramUsername ? 'border-destructive' : ''
            )}
          />
        </div>
        {errors?.telegramUsername && (
          <p className="text-sm text-destructive">{errors.telegramUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre de usuario de Telegram para comunicación directa
        </p>
      </div>

      {/* Help text */}
      <div className="rounded-lg bg-secondary/50 p-4 text-sm">
        <p className="font-medium mb-2">💡 Tip:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Solo ingresa tu nombre de usuario, sin URLs completas</li>
          <li>• GitHub es altamente recomendado para validar tu experiencia técnica</li>
          <li>• Las demás cuentas son opcionales pero ayudan a completar tu perfil</li>
        </ul>
      </div>
    </div>
  )
}