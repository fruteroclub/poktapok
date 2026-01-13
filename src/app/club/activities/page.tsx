/**
 * Activities Directory - Browse all active activities
 * Shows filterable list of activities with search and difficulty filters
 */

import type { Metadata } from 'next'
import { ActivitiesContent } from './activities-content'

export const metadata: Metadata = {
  title: 'Actividades - Club | Frutero Club',
  description:
    'Explora todas las actividades disponibles para ganar $PULPA tokens. Filtra por tipo, dificultad y encuentra desafíos perfectos para ti.',
}

export default function ActivitiesPage() {
  return <ActivitiesContent />
}
