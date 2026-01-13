/**
 * MentorshipCTA component - Call-to-action section for mentorship
 * Placeholder for future mentorship functionality
 */

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export function MentorshipCTA() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="size-8 text-primary" />
            </div>
            <h2 className="mt-6 text-3xl font-bold">¿Necesitas orientación?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Conecta con mentores experimentados en Web3, blockchain, y
              desarrollo de software. Recibe guía personalizada para acelerar
              tu aprendizaje.
            </p>
            <div className="mt-8">
              <Button size="lg" disabled>
                Solicita mentoría (Próximamente)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
