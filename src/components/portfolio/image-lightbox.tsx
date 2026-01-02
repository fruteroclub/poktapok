/**
 * ImageLightbox Component
 *
 * Full-screen image preview modal with navigation
 * Supports keyboard navigation and touch gestures
 */

'use client'

import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ImageLightboxProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const hasMultipleImages = images.length > 1
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < images.length - 1

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      onNavigate(currentIndex - 1)
    }
  }, [hasPrevious, currentIndex, onNavigate])

  const handleNext = useCallback(() => {
    if (hasNext) {
      onNavigate(currentIndex + 1)
    }
  }, [hasNext, currentIndex, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handlePrevious, handleNext, onClose])

  if (!isOpen || images.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-hidden border-none bg-black/95 p-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          aria-label="Close lightbox"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Navigation Buttons */}
        {hasMultipleImages && (
          <>
            {hasPrevious && (
              <button
                onClick={handlePrevious}
                className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {hasNext && (
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </>
        )}

        {/* Image Container */}
        <div className="relative flex h-[95vh] w-full items-center justify-center p-4">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2">
            <div className="rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}

        {/* Touch/Swipe hint for mobile */}
        {hasMultipleImages && (
          <div className="absolute bottom-16 left-1/2 z-40 -translate-x-1/2 sm:hidden">
            <p className="text-xs text-white/70">
              Swipe or use arrows to navigate
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
