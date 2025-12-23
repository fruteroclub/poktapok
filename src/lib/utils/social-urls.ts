/**
 * Build full URL for social media platforms
 *
 * @param platform - The social media platform (github, twitter, linkedin, telegram)
 * @param handle - The username/handle (without @ symbol)
 * @returns Full URL to the profile
 */
export function buildSocialUrl(platform: string, handle: string): string {
  const urlMap: Record<string, string> = {
    github: `https://github.com/${handle}`,
    twitter: `https://twitter.com/${handle}`,
    linkedin: `https://linkedin.com/in/${handle}`,
    telegram: `https://t.me/${handle}`,
  };

  return urlMap[platform.toLowerCase()] || "#";
}

/**
 * Extract handle from full social URL
 * Useful for storing handles without full URLs
 *
 * @param platform - The social media platform
 * @param url - Full URL to extract handle from
 * @returns The handle/username
 */
export function extractHandleFromUrl(
  platform: string,
  url: string
): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    switch (platform.toLowerCase()) {
      case "github":
        return pathname.split("/")[1] || null;
      case "twitter":
        return pathname.split("/")[1] || null;
      case "linkedin":
        return pathname.split("/in/")[1]?.replace("/", "") || null;
      case "telegram":
        return pathname.replace("/", "") || null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Validate social media handle format
 *
 * @param platform - The social media platform
 * @param handle - The handle to validate
 * @returns true if handle is valid
 */
export function isValidHandle(platform: string, handle: string): boolean {
  if (!handle || handle.trim().length === 0) {
    return false;
  }

  // Remove @ symbol if present
  const cleanHandle = handle.replace(/^@/, "");

  // Basic validation patterns
  const patterns: Record<string, RegExp> = {
    github: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
    twitter: /^[a-zA-Z0-9_]{1,15}$/,
    linkedin: /^[a-zA-Z0-9-]+$/,
    telegram: /^[a-zA-Z0-9_]{5,32}$/,
  };

  const pattern = patterns[platform.toLowerCase()];
  if (!pattern) {
    return false;
  }

  return pattern.test(cleanHandle);
}
