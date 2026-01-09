'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github, Twitter, Linkedin, MessageCircle } from 'lucide-react'

interface SocialAccountsFormProps {
  values: {
    githubUsername?: string
    twitterUsername?: string
    linkedinUrl?: string
    telegramUsername?: string
  }
  onChange: (field: string, value: string) => void
  errors?: Partial<Record<keyof SocialAccountsFormProps['values'], string>>
}

export function SocialAccountsForm({ values, onChange, errors }: SocialAccountsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Conecta tus cuentas sociales</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Vincula tus perfiles para que podamos validar tu identidad y actividad. GitHub es
          altamente recomendado.
        </p>
      </div>

      {/* GitHub */}
      <div className="space-y-2">
        <Label htmlFor="githubUsername" className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          Usuario de GitHub
          <span className="text-xs text-muted-foreground font-normal">(recomendado)</span>
        </Label>
        <Input
          id="githubUsername"
          type="text"
          placeholder="tu-usuario"
          value={values.githubUsername || ''}
          onChange={(e) => onChange('githubUsername', e.target.value)}
          className={errors?.githubUsername ? 'border-destructive' : ''}
        />
        {errors?.githubUsername && (
          <p className="text-sm text-destructive">{errors.githubUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">Tu nombre de usuario de GitHub (sin el @)</p>
      </div>

      {/* Twitter/X */}
      <div className="space-y-2">
        <Label htmlFor="twitterUsername" className="flex items-center gap-2">
          <Twitter className="h-4 w-4" />
          Usuario de X (Twitter)
          <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          id="twitterUsername"
          type="text"
          placeholder="tu_usuario"
          value={values.twitterUsername || ''}
          onChange={(e) => onChange('twitterUsername', e.target.value)}
          className={errors?.twitterUsername ? 'border-destructive' : ''}
        />
        {errors?.twitterUsername && (
          <p className="text-sm text-destructive">{errors.twitterUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre de usuario de X/Twitter (sin el @)
        </p>
      </div>

      {/* LinkedIn */}
      <div className="space-y-2">
        <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
          <Linkedin className="h-4 w-4" />
          URL de LinkedIn
          <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          id="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/tu-perfil"
          value={values.linkedinUrl || ''}
          onChange={(e) => onChange('linkedinUrl', e.target.value)}
          className={errors?.linkedinUrl ? 'border-destructive' : ''}
        />
        {errors?.linkedinUrl && (
          <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
        )}
        <p className="text-xs text-muted-foreground">La URL completa de tu perfil de LinkedIn</p>
      </div>

      {/* Telegram */}
      <div className="space-y-2">
        <Label htmlFor="telegramUsername" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Usuario de Telegram
          <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <Input
          id="telegramUsername"
          type="text"
          placeholder="tu_usuario"
          value={values.telegramUsername || ''}
          onChange={(e) => onChange('telegramUsername', e.target.value)}
          className={errors?.telegramUsername ? 'border-destructive' : ''}
        />
        {errors?.telegramUsername && (
          <p className="text-sm text-destructive">{errors.telegramUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">Tu nombre de usuario de Telegram (sin el @)</p>
      </div>
    </div>
  )
}
