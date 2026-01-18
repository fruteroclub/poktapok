'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

interface GoalInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function GoalInput({ value, onChange, error }: GoalInputProps) {
  const minLength = 140
  const maxLength = 280
  const currentLength = value.length
  const isValid = currentLength >= minLength && currentLength <= maxLength
  const isTooShort = currentLength > 0 && currentLength < minLength
  const isTooLong = currentLength > maxLength

  return (
    <div className="space-y-2">
      <Label htmlFor="goal" className="text-base font-semibold">
        Tu meta para el próximo mes <span className="text-orange-500">*</span>
      </Label>
      <p className="text-sm text-muted-foreground">
        Describe qué quieres lograr en el próximo mes. Debe ser específico, medible y alcanzable.
        Por ejemplo: &quot;Completar un portafolio web con 3 proyectos y conseguir mi primer
        cliente freelance&quot;.
      </p>

      <Textarea
        id="goal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tu meta aquí..."
        className={`min-h-[120px] resize-none ${
          error || isTooShort || isTooLong ? 'border-orange-400' : ''
        } ${isValid && currentLength > 0 ? 'border-green-500' : ''}`}
        maxLength={maxLength}
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isTooShort && (
            <span className="flex items-center gap-1 text-orange-500">
              <AlertCircle className="h-4 w-4" />
              Mínimo {minLength} caracteres
            </span>
          )}
          {isTooLong && (
            <span className="flex items-center gap-1 text-orange-500">
              <AlertCircle className="h-4 w-4" />
              Máximo {maxLength} caracteres
            </span>
          )}
          {isValid && (
            <span className="text-green-600 dark:text-green-500">✓ Meta válida</span>
          )}
        </div>

        <span
          className={`font-mono ${
            isTooLong ? 'text-orange-500' : 'text-muted-foreground'
          }`}
        >
          {currentLength}/{maxLength}
        </span>
      </div>

      {error && (
        <p className="text-sm text-orange-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
