/**
 * Programs Directory - Browse all active programs
 * Shows filterable list of learning programs with search
 */

import type { Metadata } from 'next'
import { ProgramsContent } from './programs-content'

export const metadata: Metadata = {
  title: 'Programas - Jam | Frutero Club',
  description:
    'Explora todos los programas de aprendizaje disponibles. Filtra por tipo (cohort o abierto) y encuentra el programa perfecto para tu carrera en Web3.',
}

export default function ProgramsPage() {
  return <ProgramsContent />
}
