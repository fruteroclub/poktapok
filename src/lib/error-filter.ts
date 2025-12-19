'use client'

// Suppress specific React DOM warnings from third-party libraries
// This runs immediately when the module is imported on the client side
const originalError = console.error
console.error = (...args: unknown[]) => {
  const errorString = args.join(' ')

  // Suppress SVG attribute warnings from Privy's internal components
  if (
    (errorString.includes('fill-rule') && errorString.includes('fillRule')) ||
    (errorString.includes('clip-rule') && errorString.includes('clipRule')) ||
    (errorString.includes('stroke-width') && errorString.includes('strokeWidth')) ||
    (errorString.includes('stroke-linecap') && errorString.includes('strokeLinecap')) ||
    (errorString.includes('stroke-linejoin') && errorString.includes('strokeLinejoin'))
  ) {
    return
  }

  // Suppress hydration warnings from Privy's modal HTML nesting
  // Privy's styled-components render <div> inside <p> tags in help text
  if (
    errorString.includes('cannot be a descendant of') &&
    errorString.includes('HelpTextContainer') &&
    errorString.includes('hydration')
  ) {
    return
  }

  // Suppress Coinbase Wallet SDK COOP check failures (development only)
  // SDK checks Cross-Origin-Opener-Policy but resource returns 404 in dev
  if (
    errorString.includes('Cross-Origin-Opener-Policy') &&
    errorString.includes('HTTP error! status: 404')
  ) {
    return
  }

  originalError.apply(console, args)
}

const errorFilterConfig = {}
export default errorFilterConfig
