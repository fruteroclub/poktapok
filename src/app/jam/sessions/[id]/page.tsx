/**
 * Session Detail Page - Dynamic route for individual session details
 * Shows session info, activities, and conditional meeting URL access
 */

import type { Metadata } from 'next'
import { SessionDetailContent } from './session-detail-content'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Sesión - Jam | Frutero Club`,
    description: 'Detalles de la sesión de aprendizaje, actividades y enlace de reunión.',
  }
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { id } = await params

  return <SessionDetailContent sessionId={id} />
}
