/**
 * Activity Detail Page - Dynamic route for individual activity details
 * Shows activity info, requirements, and submission form
 */

import type { Metadata } from 'next'
import { ActivityDetailContent } from './activity-detail-content'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params: _params }: PageProps): Promise<Metadata> {
  return {
    title: `Actividad - Club | Frutero Club`,
    description: 'Detalles de la actividad, requisitos de evidencia y formulario de entrega.',
  }
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id } = await params

  return <ActivityDetailContent activityId={id} />
}
