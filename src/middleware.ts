import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from './i18n/config'

// Routes that should use i18n
const i18nRoutes = ['/casa-frutero', '/devrel', '/proposals']

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this path should use i18n
  const shouldUseI18n = i18nRoutes.some(
    (route) =>
      pathname.startsWith(route) ||
      locales.some(
        (locale) =>
          pathname.startsWith(`/${locale}${route}`) ||
          pathname === `/${locale}`,
      ),
  )

  // Only apply intl middleware to i18n routes
  if (shouldUseI18n) {
    return intlMiddleware(request)
  }

  // For all other routes, continue without locale handling
  return NextResponse.next()
}

export const config = {
  // Match all paths except static files and api routes
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
