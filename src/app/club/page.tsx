/**
 * Club Landing Page - Community showcase and engagement hub
 * Displays member highlights, activities preview, and community stats
 */

import type { Metadata } from 'next'
import { ClubContent } from './club-content'

export const metadata: Metadata = {
  title: 'Club - Comunidad Web3 | Frutero Club',
  description:
    'Conoce a nuestra comunidad de desarrolladores Web3. Explora portfolios, actividades disponibles, y la clasificación de miembros.',
}

export default function ClubPage() {
  return <ClubContent />
}
