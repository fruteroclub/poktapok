/**
 * Jam Landing Page - Central hub for learning opportunities
 * Shows active programs, upcoming sessions, and featured activities
 */

import type { Metadata } from 'next'
import { JamContent } from './jam-content'

export const metadata: Metadata = {
  title: 'Jam - Aprende y Gana | Frutero Club',
  description:
    'Explora programas de aprendizaje, sesiones en vivo, y actividades para ganar $PULPA tokens mientras construyes tu carrera en Web3.',
}

export default function JamPage() {
  return <JamContent />
}
