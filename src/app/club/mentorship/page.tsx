/**
 * Mentorship Hub - Placeholder for future mentorship feature
 * Coming soon page with signup for updates
 */

import type { Metadata } from 'next'
import { MentorshipContent } from './mentorship-content'

export const metadata: Metadata = {
  title: 'Mentoría - Club | Frutero Club',
  description:
    'Programa de mentoría personalizada para acelerar tu carrera en Web3. Próximamente disponible.',
}

export default function MentorshipPage() {
  return <MentorshipContent />
}
