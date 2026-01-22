'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface GoalInputProps {
  goal: string
  onGoalChange: (value: string) => void
  goalError?: string
  motivationText: string
  onMotivationChange: (value: string) => void
  motivationError?: string
}

const EXISTING_MEMBER_TEXT = 'Ya soy parte de la comunidad Frutero'

export function GoalInput({
  goal,
  onGoalChange,
  goalError,
  motivationText,
  onMotivationChange,
  motivationError,
}: GoalInputProps) {
  const goalMinLength = 1
  const goalMaxLength = 280
  const goalCurrentLength = goal.length
  const isGoalValid = goalCurrentLength >= goalMinLength && goalCurrentLength <= goalMaxLength
  const isGoalTooShort = goalCurrentLength > 0 && goalCurrentLength < goalMinLength
  const isGoalTooLong = goalCurrentLength > goalMaxLength

  const motivationMaxLength = 500
  const motivationCurrentLength = motivationText.length
  const isMotivationValid = motivationCurrentLength >= 1 && motivationCurrentLength <= motivationMaxLength
  const isMotivationTooLong = motivationCurrentLength > motivationMaxLength

  const handleExistingMemberClick = () => {
    onMotivationChange(EXISTING_MEMBER_TEXT)
  }

  return (
    <div className="space-y-8">
      {/* Goal Section */}
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
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder="Escribe tu meta aquí..."
          className={`min-h-[120px] resize-none ${
            goalError || isGoalTooShort || isGoalTooLong ? 'border-orange-400' : ''
          } ${isGoalValid && goalCurrentLength > 0 ? 'border-green-500' : ''}`}
          maxLength={goalMaxLength}
        />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isGoalTooShort && (
              <span className="flex items-center gap-1 text-orange-500">
                <AlertCircle className="h-4 w-4" />
                Mínimo {goalMinLength} caracteres
              </span>
            )}
            {isGoalTooLong && (
              <span className="flex items-center gap-1 text-orange-500">
                <AlertCircle className="h-4 w-4" />
                Máximo {goalMaxLength} caracteres
              </span>
            )}
            {isGoalValid && (
              <span className="text-green-600 dark:text-green-500">✓ Meta válida</span>
            )}
          </div>

          <span
            className={`font-mono ${
              isGoalTooLong ? 'text-orange-500' : 'text-muted-foreground'
            }`}
          >
            {goalCurrentLength}/{goalMaxLength}
          </span>
        </div>

        {goalError && (
          <p className="text-sm text-orange-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {goalError}
          </p>
        )}
      </div>

      {/* Motivation Section */}
      <div className="space-y-2">
        <Label htmlFor="motivation" className="text-base font-semibold">
          ¿Por qué quieres unirte a Frutero? <span className="text-orange-500">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Cuéntanos qué te motivó a aplicar y qué esperas obtener de la comunidad.
        </p>

        <div className="flex items-center gap-2 pb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExistingMemberClick}
            className={`text-xs ${
              motivationText === EXISTING_MEMBER_TEXT
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : ''
            }`}
          >
            {motivationText === EXISTING_MEMBER_TEXT ? '✓ ' : ''}
            Ya soy parte de la comunidad
          </Button>
        </div>

        <Textarea
          id="motivation"
          value={motivationText}
          onChange={(e) => onMotivationChange(e.target.value)}
          placeholder="Cuéntanos tu motivación..."
          className={`min-h-[100px] resize-none ${
            motivationError || isMotivationTooLong ? 'border-orange-400' : ''
          } ${isMotivationValid ? 'border-green-500' : ''}`}
          maxLength={motivationMaxLength}
        />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isMotivationTooLong && (
              <span className="flex items-center gap-1 text-orange-500">
                <AlertCircle className="h-4 w-4" />
                Máximo {motivationMaxLength} caracteres
              </span>
            )}
            {isMotivationValid && (
              <span className="text-green-600 dark:text-green-500">✓ Válido</span>
            )}
          </div>

          <span
            className={`font-mono ${
              isMotivationTooLong ? 'text-orange-500' : 'text-muted-foreground'
            }`}
          >
            {motivationCurrentLength}/{motivationMaxLength}
          </span>
        </div>

        {motivationError && (
          <p className="text-sm text-orange-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {motivationError}
          </p>
        )}
      </div>
    </div>
  )
}
