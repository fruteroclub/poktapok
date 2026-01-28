/**
 * Directory utility functions
 * Helper functions for directory page components
 */

/**
 * Convert country code to flag emoji
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "AR", "BR")
 * @returns Flag emoji or empty string if invalid
 */
export function getCountryFlag(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return ''

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))

  return String.fromCodePoint(...codePoints)
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum character length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string | null, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Get learning track label
 * @param track - Learning track value
 * @returns Human-readable label
 */
export function getLearningTrackLabel(
  track: 'ai' | 'crypto' | 'privacy',
): string {
  const labels = {
    ai: 'Code: AI',
    crypto: 'Crypto/DeFi',
    privacy: 'Privacy',
  }
  return labels[track]
}

/**
 * Get availability status label
 * @param status - Availability status value
 * @returns Human-readable label
 */
export function getAvailabilityLabel(
  status: 'available' | 'open_to_offers' | 'unavailable',
): string {
  const labels = {
    available: 'Available',
    open_to_offers: 'Open to Offers',
    unavailable: 'Unavailable',
  }
  return labels[status]
}

/**
 * Get availability status color
 * @param status - Availability status value
 * @returns Tailwind color class
 */
export function getAvailabilityColor(
  status: 'available' | 'open_to_offers' | 'unavailable',
): string {
  const colors = {
    available: 'bg-green-500',
    open_to_offers: 'bg-blue-500',
    unavailable: 'bg-gray-400',
  }
  return colors[status]
}

/**
 * Get learning track badge variant
 * @param track - Learning track value
 * @returns Badge styling classes
 */
export function getLearningTrackStyles(
  track: 'ai' | 'crypto' | 'privacy',
): string {
  const styles = {
    ai: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    crypto:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    privacy:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }
  return styles[track]
}

/**
 * Format profile count for display
 * @param count - Number of profiles
 * @returns Formatted string (e.g., "156 builders found")
 */
export function formatProfileCount(count: number): string {
  if (count === 0) return 'No builders found'
  if (count === 1) return '1 builder found'
  return `${count} builders found`
}

/**
 * Get initials from name for avatar fallback
 * @param name - Display name or username
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string | null): string {
  if (!name) return '?'

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
