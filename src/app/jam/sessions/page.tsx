/**
 * Sessions Directory - Browse all sessions
 * Shows filterable list of sessions with program context
 */

import type { Metadata } from 'next'
import { SessionsContent } from './sessions-content'

export const metadata: Metadata = {
  title: 'Sesiones - Jam | Frutero Club',
  description:
    'Explora todas las sesiones de aprendizaje disponibles. Filtra por programa, próximas sesiones, o sesiones independientes.',
}

export default function SessionsPage() {
  return <SessionsContent />
}
