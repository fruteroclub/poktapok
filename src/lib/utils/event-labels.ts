/**
 * Event label utilities for consistent display across the application
 */

export type EventType = 'in-person' | 'virtual' | 'hybrid'

/**
 * Get Spanish label for event type
 */
export function getEventTypeLabel(eventType: EventType): string {
  const labels: Record<EventType, string> = {
    'in-person': 'Presencial',
    virtual: 'Virtual',
    hybrid: 'Híbrido',
  }
  return labels[eventType] || eventType
}

/**
 * Get status label for event
 */
export function getEventStatusLabel(isPast: boolean): string {
  return isPast ? 'Pasado' : 'Próximo'
}
