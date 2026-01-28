'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { ProfileFormData } from '@/lib/validators/profile'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronUp,
  Github,
  Twitter,
  Linkedin,
  Send,
} from 'lucide-react'

/**
 * SocialLinksSection - Optional social media links (collapsible)
 * - GitHub, Twitter, LinkedIn, Telegram
 * - All fields are optional
 * - Collapsed by default for progressive disclosure
 */
export function SocialLinksSection() {
  const form = useFormContext<ProfileFormData>()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Redes Sociales</h3>
          <p className="text-sm text-muted-foreground">Opcional</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          {isExpanded ? (
            <>
              Ocultar <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Agregar <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* GitHub */}
          <FormField
            control={form.control}
            name="socialLinks.github"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </FormLabel>
                <FormControl>
                  <Input type="text" placeholder="usuario" {...field} />
                </FormControl>
                <FormDescription>
                  Tu nombre de usuario de GitHub
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Twitter */}
          <FormField
            control={form.control}
            name="socialLinks.twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter / X
                </FormLabel>
                <FormControl>
                  <Input placeholder="@usuario o usuario" {...field} />
                </FormControl>
                <FormDescription>
                  Tu nombre de usuario (con o sin @)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* LinkedIn */}
          <FormField
            control={form.control}
            name="socialLinks.linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </FormLabel>
                <FormControl>
                  <Input type="text" placeholder="usuario" {...field} />
                </FormControl>
                <FormDescription>
                  Tu nombre de usuario de LinkedIn (linkedin.com/in/usuario)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Telegram */}
          <FormField
            control={form.control}
            name="socialLinks.telegram"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Telegram
                </FormLabel>
                <FormControl>
                  <Input placeholder="@usuario o usuario" {...field} />
                </FormControl>
                <FormDescription>
                  Tu nombre de usuario de Telegram (con o sin @)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
