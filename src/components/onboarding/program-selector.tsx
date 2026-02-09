'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Infinity } from 'lucide-react'
import { useActivePrograms } from '@/hooks/use-onboarding'

interface ProgramSelectorProps {
  value: string
  onChange: (programId: string) => void
  error?: string
}

export function ProgramSelector({
  value,
  onChange,
  error,
}: ProgramSelectorProps) {
  const { data, isLoading, error: fetchError } = useActivePrograms()
  const programs = data?.programs || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Cargando programas...
        </span>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="rounded-lg border border-orange-400 bg-orange-100 p-4">
        <p className="text-sm text-orange-500">
          Failed to load programs
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          Selecciona un programa <span className="text-orange-500">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Elige el programa que mejor se alinee con tus objetivos de aprendizaje
        </p>
      </div>

      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {programs.map((program) => (
          <Card
            key={program.id}
            className={`cursor-pointer transition-colors ${
              value === program.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onChange(program.id)}
          >
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={program.id} id={program.id} />
                  <Label
                    htmlFor={program.id}
                    className="cursor-pointer text-base font-semibold"
                  >
                    {program.name}
                  </Label>
                </div>
                <Badge
                  variant={
                    program.programType === 'cohort' ? 'default' : 'secondary'
                  }
                >
                  {program.programType === 'cohort' ? (
                    <>
                      <Calendar className="mr-1 h-3 w-3" />
                      Intensivo
                    </>
                  ) : (
                    <>
                      <Infinity className="mr-1 h-3 w-3" />
                      Continuo
                    </>
                  )}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {program.description}
              </CardDescription>
            </CardHeader>

            {program.programType === 'cohort' &&
              (program.startDate || program.endDate) && (
                <CardContent className="pt-0 pb-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {program.startDate && (
                      <div>
                        <span className="font-medium">Inicio:</span>{' '}
                        {new Date(program.startDate).toLocaleDateString(
                          'es-MX',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          },
                        )}
                      </div>
                    )}
                    {program.endDate && (
                      <div>
                        <span className="font-medium">Fin:</span>{' '}
                        {new Date(program.endDate).toLocaleDateString('es-MX', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
          </Card>
        ))}
      </RadioGroup>

      {error && <p className="text-sm text-orange-500">{error}</p>}
    </div>
  )
}
