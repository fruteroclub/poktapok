/**
 * Leaderboard Page - Community rankings
 * Shows top performers by earnings, projects, and activity
 */

import type { Metadata } from 'next'
import { LeaderboardContent } from './leaderboard-content'

export const metadata: Metadata = {
  title: 'Clasificación - Club | Frutero Club',
  description:
    'Descubre los mejores miembros de la comunidad. Clasificación por ganancias, proyectos completados y participación.',
}

export default function LeaderboardPage() {
  return <LeaderboardContent />
}
