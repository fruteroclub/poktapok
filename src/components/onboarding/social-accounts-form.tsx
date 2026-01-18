'use client'

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

// Static class - never changes
const INPUT_CLASS = 'h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-base outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200'

export function SocialAccountsForm({
  values,
  onChange,
  errors,
}: SocialAccountsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">
          Conecta tus cuentas sociales
        </h3>
        <p className="text-sm text-muted-foreground">
          Vincula tus perfiles para que podamos validar tu identidad y
          actividad. GitHub es altamente recomendado.
        </p>
      </div>

      {/* GitHub */}
      <div className="space-y-2">
        <Label htmlFor="github-input" className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          Usuario de GitHub
          <span className="text-xs font-normal text-muted-foreground">
            (recomendado)
          </span>
        </Label>
        <input
          id="github-input"
          name="githubUsername"
          type="text"
          autoComplete="off"
          placeholder="tu-usuario"
          defaultValue={values.githubUsername || ''}
          onChange={(e) => onChange('githubUsername', e.target.value)}
          className={INPUT_CLASS}
        />
        {errors?.githubUsername && (
          <p className="text-sm text-orange-600">{errors.githubUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre de usuario de GitHub (sin el @)
        </p>
      </div>

      {/* Twitter/X */}
      <div className="space-y-2">
        <Label htmlFor="twitter-input" className="flex items-center gap-2">
          <Twitter className="h-4 w-4" />
          Usuario de X (Twitter)
          <span className="text-xs font-normal text-muted-foreground">
            (opcional)
          </span>
        </Label>
        <input
          id="twitter-input"
          name="twitterUsername"
          type="text"
          autoComplete="off"
          placeholder="tu_usuario"
          defaultValue={values.twitterUsername || ''}
          onChange={(e) => onChange('twitterUsername', e.target.value)}
          className={INPUT_CLASS}
        />
        {errors?.twitterUsername && (
          <p className="text-sm text-orange-600">{errors.twitterUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre de usuario de X/Twitter (sin el @)
        </p>
      </div>

      {/* LinkedIn */}
      <div className="space-y-2">
        <Label htmlFor="linkedin-input" className="flex items-center gap-2">
          <Linkedin className="h-4 w-4" />
          URL de LinkedIn
          <span className="text-xs font-normal text-muted-foreground">
            (opcional)
          </span>
        </Label>
        <input
          id="linkedin-input"
          name="linkedinUrl"
          type="text"
          autoComplete="off"
          placeholder="https://linkedin.com/in/tu-perfil"
          defaultValue={values.linkedinUrl || ''}
          onChange={(e) => onChange('linkedinUrl', e.target.value)}
          className={INPUT_CLASS}
        />
        {errors?.linkedinUrl && (
          <p className="text-sm text-orange-600">{errors.linkedinUrl}</p>
        )}
        <p className="text-xs text-muted-foreground">
          La URL completa de tu perfil de LinkedIn
        </p>
      </div>

      {/* Telegram */}
      <div className="space-y-2">
        <Label htmlFor="telegram-input" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Usuario de Telegram
          <span className="text-xs font-normal text-muted-foreground">
            (opcional)
          </span>
        </Label>
        <input
          id="telegram-input"
          name="telegramUsername"
          type="text"
          autoComplete="off"
          placeholder="tu_usuario"
          defaultValue={values.telegramUsername || ''}
          onChange={(e) => onChange('telegramUsername', e.target.value)}
          className={INPUT_CLASS}
        />
        {errors?.telegramUsername && (
          <p className="text-sm text-orange-600">{errors.telegramUsername}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Tu nombre de usuario de Telegram (sin el @)
        </p>
      </div>
    </div>
  )
}
