'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import Image from 'next/image'

import { cn } from '@/lib/utils'

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full bg-secondary/25',
        className,
      )}
      {...props}
    />
  )
}

interface AvatarImageProps extends Omit<React.ComponentProps<typeof AvatarPrimitive.Image>, 'src'> {
  src?: string | null
}

/**
 * Optimized AvatarImage using Next.js Image for:
 * - Automatic image optimization (WebP, resizing)
 * - Browser caching with proper Cache-Control headers
 * - Reduced bandwidth (up to 90% smaller files)
 */
function AvatarImage({
  className,
  src,
  alt,
  ...props
}: AvatarImageProps) {
  const [hasError, setHasError] = React.useState(false)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false)
    setIsLoaded(false)
  }, [src])

  // If no src or error, render nothing (fallback will show)
  if (!src || hasError) {
    return null
  }

  return (
    <>
      {/* Hidden Radix image to trigger fallback behavior */}
      <AvatarPrimitive.Image
        data-slot="avatar-image"
        className="hidden"
        src={isLoaded ? src : undefined}
        {...props}
      />
      {/* Optimized Next.js Image */}
      <Image
        src={src}
        alt={alt || ''}
        fill
        sizes="80px"
        className={cn(
          'aspect-square size-full object-cover',
          className,
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </>
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
