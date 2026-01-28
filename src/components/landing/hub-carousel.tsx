'use client'

import { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface HubCarouselProps {
  className?: string
}

// Casa Frutero images from public/images/landing/casa-frutero/
const HUB_IMAGES = [
  '/images/landing/casa-frutero/coworking-office.jpg',
  '/images/landing/casa-frutero/coworking-open-space.jpg',
  '/images/landing/casa-frutero/coworking-sala-juntas.jpg',
]

export default function HubCarousel({ className }: HubCarouselProps) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      duration: 20,
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
      }),
    ],
  )

  // Use stable order for SSR, shuffle only on client after mount
  const [images, setImages] = useState(HUB_IMAGES)

  useEffect(() => {
    // Shuffle images after client-side mount to avoid hydration mismatch
    setImages([...HUB_IMAGES].sort(() => Math.random() - 0.5))
  }, [])

  return (
    <div className={cn('overflow-hidden rounded-xl border-2 bg-card shadow-sm', className)}>
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative min-w-0 shrink-0 grow-0 basis-full h-full"
            >
              <Image
                src={image}
                alt={`Casa Frutero space ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
