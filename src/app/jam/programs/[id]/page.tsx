/**
 * Program Detail Page - Dynamic route for individual program details
 * Shows program overview, stats, upcoming sessions, and activities
 */

import type { Metadata } from 'next'
import { ProgramDetailContent } from './program-detail-content'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params: _params }: PageProps): Promise<Metadata> {
  return {
    title: `Programa - Jam | Frutero Club`,
    description: 'Detalles del programa de aprendizaje, sesiones próximas y actividades disponibles.',
  }
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const { id } = await params

  return <ProgramDetailContent programId={id} />
}
