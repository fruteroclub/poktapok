/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format a date for event display (full format with day, month, time)
 * Example: "mié, 14 ene, 10:00 a.m."
 */
export function formatEventDate(dateStr: string | Date): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-MX', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format a date for detailed event display (full format with year)
 * Example: "miércoles, 14 de enero de 2025, 10:00 a.m."
 */
export function formatEventDateLong(dateStr: string | Date): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(dateStr)
  }
}

/**
 * Extract day and month for calendar-style display
 * Returns: { day: 14, month: 'ENE' }
 */
export function formatCalendarDate(dateStr: string | Date): {
  day: number
  month: string
} {
  const date = new Date(dateStr)
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase(),
  }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateStr: string | Date): boolean {
  return new Date(dateStr) < new Date()
}

/**
 * Get relative time string (e.g., "en 3 días", "hace 2 horas")
 */
export function getRelativeTime(dateStr: string | Date): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      return 'ahora'
    }
    return diffHours > 0 ? `en ${diffHours} horas` : `hace ${Math.abs(diffHours)} horas`
  }

  if (diffDays > 0) {
    return diffDays === 1 ? 'mañana' : `en ${diffDays} días`
  }

  return diffDays === -1 ? 'ayer' : `hace ${Math.abs(diffDays)} días`
}
