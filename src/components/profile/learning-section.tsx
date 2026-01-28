'use client'

import { useFormContext } from 'react-hook-form'
import { ProfileFormData } from '@/lib/validators/profile'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Cpu, Wallet, Lock } from 'lucide-react'

const LEARNING_TRACKS = [
  {
    value: 'ai' as const,
    label: 'AI',
    description: 'Inteligencia Artificial y Machine Learning',
    icon: Cpu,
  },
  {
    value: 'crypto' as const,
    label: 'Crypto/DeFi',
    description: 'Blockchain y Finanzas Descentralizadas',
    icon: Wallet,
  },
  {
    value: 'privacy' as const,
    label: 'Privacy',
    description: 'Privacidad y Seguridad',
    icon: Lock,
  },
]

const AVAILABILITY_OPTIONS = [
  {
    value: 'available' as const,
    label: 'Learning',
    description: 'Aprendiendo activamente',
    color: 'border-blue-500 bg-blue-500/5',
  },
  {
    value: 'open_to_offers' as const,
    label: 'Building',
    description: 'Trabajando en proyectos',
    color: 'border-green-500 bg-green-500/5',
  },
  {
    value: 'unavailable' as const,
    label: 'Open to Bounties',
    description: 'Disponible para oportunidades',
    color: 'border-purple-500 bg-purple-500/5',
  },
]

/**
 * LearningSection - Learning track and availability status selection
 * - Single selection radio for learning track (AI, Crypto, Privacy)
 * - Single selection radio for availability status
 */
export function LearningSection() {
  const form = useFormContext<ProfileFormData>()

  return (
    <div className="space-y-6">
      {/* Learning Track */}
      <div className="space-y-4">
        <div>
          <h3 className="mb-1 text-lg font-semibold">Área de Aprendizaje</h3>
          <p className="text-sm text-muted-foreground">
            ¿Qué te interesa aprender?
          </p>
        </div>

        <FormField
          control={form.control}
          name="learningTrack"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Selecciona tu área principal{' '}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="grid gap-3">
                  {LEARNING_TRACKS.map((track) => {
                    const Icon = track.icon
                    return (
                      <div
                        key={track.value}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${
                          field.value === track.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                        onClick={() => field.onChange(track.value)}
                      >
                        <input
                          type="radio"
                          checked={field.value === track.value}
                          onChange={() => field.onChange(track.value)}
                          className="mt-0.5 h-4 w-4"
                        />
                        <Icon className="mt-0.5 h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <Label className="cursor-pointer font-medium">
                            {track.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {track.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Availability Status */}
      <div className="space-y-4">
        <div>
          <h3 className="mb-1 text-lg font-semibold">Estado Actual</h3>
          <p className="text-sm text-muted-foreground">
            ¿Cuál es tu situación actual?
          </p>
        </div>

        <FormField
          control={form.control}
          name="availabilityStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Disponibilidad <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="grid gap-3">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition ${
                        field.value === option.value
                          ? option.color
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                      onClick={() => field.onChange(option.value)}
                    >
                      <input
                        type="radio"
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <Label className="cursor-pointer font-medium">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
