import { Metadata } from 'next'
import { EventosContent } from './eventos-content'

export const metadata: Metadata = {
  title: 'Eventos | Frutero Club',
  description:
    'Descubre y únete a los eventos de la comunidad Frutero Club. Hackathons, workshops, meetups y más.',
}

export default function EventosPage() {
  return <EventosContent />
}
