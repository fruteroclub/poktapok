/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji
 *
 * @param countryCode - Two-letter country code (e.g., "US", "AR", "GB")
 * @returns Flag emoji (e.g., "🇺🇸", "🇦🇷", "🇬🇧")
 *
 * @example
 * getCountryFlag("US") // "🇺🇸"
 * getCountryFlag("ar") // "🇦🇷" (case-insensitive)
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return ''
  }

  // Convert country code to uppercase
  const code = countryCode.toUpperCase()

  // Convert to regional indicator symbols (Unicode)
  // Regional indicator symbols start at U+1F1E6 (🇦)
  // A = 0x41, so we subtract 0x41 and add 0x1F1E6
  const codePoints = code
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 0x41)

  return String.fromCodePoint(...codePoints)
}

/**
 * Get country name from country code
 * Uses Intl.DisplayNames API for localized country names
 *
 * @param countryCode - Two-letter country code
 * @param locale - Locale for display name (default: "en")
 * @returns Country name in specified locale
 *
 * @example
 * getCountryName("US") // "United States"
 * getCountryName("AR") // "Argentina"
 */
export function getCountryName(
  countryCode: string,
  locale: string = 'en',
): string {
  if (!countryCode || countryCode.length !== 2) {
    return ''
  }

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
    return displayNames.of(countryCode.toUpperCase()) || countryCode
  } catch {
    return countryCode
  }
}

/**
 * Format location with flag emoji
 *
 * @param city - City name (optional)
 * @param country - Country name (optional)
 * @param countryCode - Two-letter country code (optional)
 * @returns Formatted location string with flag
 *
 * @example
 * formatLocation("Buenos Aires", "Argentina", "AR") // "Buenos Aires, Argentina 🇦🇷"
 * formatLocation(null, "United States", "US") // "United States 🇺🇸"
 * formatLocation("London", null, "GB") // "London 🇬🇧"
 */
export function formatLocation(
  city: string | null,
  country: string | null,
  countryCode: string | null,
): string {
  const parts: string[] = []

  if (city) {
    parts.push(city)
  }

  if (country) {
    parts.push(country)
  }

  const location = parts.join(', ')
  const flag = countryCode ? getCountryFlag(countryCode) : ''

  return [location, flag].filter(Boolean).join(' ')
}
