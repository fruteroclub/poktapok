'use client'

import { useState, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface HeroCarouselProps {
  className?: string
}

// Hero images from public/images/landing/hero/
const HERO_IMAGES = [
  '/images/landing/hero/202401-ethcdm-hackerhouse-meetup.jpeg',
  '/images/landing/hero/202409-workshop-puebla-gvt.jpeg',
  '/images/landing/hero/54947768322_d067c8ed97_o.jpg',
  '/images/landing/hero/ariutokintumi-frutero-tee.jpg',
  '/images/landing/hero/ETHCDM Sury CDMX 2.png',
  '/images/landing/hero/ETHCDM Sury CDMX.png',
  '/images/landing/hero/ETHCDM Sury GDL.png',
  '/images/landing/hero/Ethereum_Mty-1-269.jpg',
  '/images/landing/hero/mexi-20240204_102705.jpg',
  '/images/landing/hero/mexi-IMG_20240202_124219.jpg',
  '/images/landing/hero/mexi-IMG_20240202_204348.jpg',
  '/images/landing/hero/photo_2026-01-22_12-24-20.jpg',
  '/images/landing/hero/photo_2026-01-22_12-24-21.jpg',
  '/images/landing/hero/photo_2026-01-22_12-24-22.jpg',
]

export default function HeroCarousel({ className }: HeroCarouselProps) {
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
  const [images, setImages] = useState(HERO_IMAGES)

  useEffect(() => {
    // Shuffle images after client-side mount to avoid hydration mismatch
    setImages([...HERO_IMAGES].sort(() => Math.random() - 0.5))
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
                alt={`Community event ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
