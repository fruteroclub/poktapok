'use client'

import { useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Github, Twitter, Linkedin, MessageCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
type SocialField = 'githubUsername' | 'twitterUsername' | 'linkedinUsername' | 'telegramUsername'

interface SocialAccountsFormProps {
  values: Partial<Record<SocialField, string>>
  onChange: (field: string, value: string) => void
  errors?: Partial<Record<SocialField, string>>
}

interface SocialInputConfig {
  field: SocialField
  label: string
  icon: LucideIcon
  prefix: string
  placeholder: string
  helpText: string
  optional: boolean
  noWrap?: boolean
}

// Static configuration - defined outside component to avoid re-creation
const SOCIAL_INPUTS: SocialInputConfig[] = [
  {
    field: 'githubUsername',
    label: 'GitHub',
    icon: Github,
    prefix: 'github.com/',
    placeholder: 'tu-usuario',
    helpText: 'Tu nombre de usuario de GitHub (altamente recomendado)',
    optional: false,
  },
  {
    field: 'linkedinUsername',
    label: 'LinkedIn',
    icon: Linkedin,
    prefix: 'linkedin.com/in/',
    placeholder: 'tu-perfil',
    helpText: 'El identificador de tu perfil de LinkedIn',
    optional: true,
    noWrap: true,
  },
  {
    field: 'twitterUsername',
    label: 'X (Twitter)',
    icon: Twitter,
    prefix: 'x.com/',
    placeholder: 'tu_usuario',
    helpText: 'Tu nombre de usuario de X/Twitter',
    optional: true,
  },
  {
    field: 'telegramUsername',
    label: 'Telegram',
    icon: MessageCircle,
    prefix: '@',
    placeholder: 'tu_usuario',
    helpText: 'Tu nombre de usuario de Telegram para comunicación directa',
    optional: true,
  },
]

// Pure function - extract username from URL or handle @ symbol
function processValue(val: string, prefix: string): string {
  let processed = val
  if (prefix !== '@' && processed.includes(prefix)) {
    processed = processed.split(prefix).pop() || ''
  }
  return processed.replace('@', '')
}

const INPUT_CLASS_NAME = "h-9 w-full min-w-0 rounded-r-md border border-input bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function SocialAccountsFormEnhanced({
  values,
  onChange,
  errors,
}: SocialAccountsFormProps) {
  // Refs for uncontrolled inputs
  const inputRefs = useRef<Record<SocialField, HTMLInputElement | null>>({
    githubUsername: null,
    twitterUsername: null,
    linkedinUsername: null,
    telegramUsername: null,
  })

  // Sync initial values on mount only
  useEffect(() => {
    SOCIAL_INPUTS.forEach(({ field }) => {
      const ref = inputRefs.current[field]
      const value = values[field]
      if (ref && value && !ref.value) {
        ref.value = value
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

      {SOCIAL_INPUTS.map(({ field, label, icon: Icon, prefix, placeholder, helpText, optional, noWrap }) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={field} className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
            {optional && (
              <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
            )}
          </Label>
          <div className="flex items-stretch">
            <span className={cn(
              "flex items-center px-3 text-sm bg-orange-100 text-orange-700 rounded-l-md border border-r-0",
              noWrap && "whitespace-nowrap"
            )}>
              {prefix}
            </span>
            <input
              ref={(el) => { inputRefs.current[field] = el }}
              id={field}
              name={field}
              type="text"
              placeholder={placeholder}
              defaultValue={values[field] || ''}
              onBlur={(e) => {
                const processed = processValue(e.target.value, prefix)
                e.target.value = processed
                onChange(field, processed)
              }}
              onChange={(e) => {
                const processed = processValue(e.target.value, prefix)
                onChange(field, processed)
              }}
              className={cn(
                INPUT_CLASS_NAME,
                errors?.[field] && 'border-orange-400'
              )}
            />
          </div>
          {errors?.[field] && (
            <p className="text-sm text-orange-500">{errors[field]}</p>
          )}
          <p className="text-xs text-muted-foreground">{helpText}</p>
        </div>
      ))}

      {/* Help text */}
      <div className="rounded-lg bg-amber-50 p-4 text-sm">
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
