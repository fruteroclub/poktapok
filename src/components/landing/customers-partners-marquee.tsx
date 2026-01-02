'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Marquee } from '@/components/ui/marquee'

interface Partner {
  name: string
  logo: string
  url: string
}

const partners: Partner[] = [
  {
    name: 'Base',
    logo: '/images/logos/partners/base-logo-black.svg',
    url: 'https://base.org',
  },
  {
    name: 'Scroll',
    logo: '/images/logos/partners/scroll-logo-black.svg',
    url: 'https://scroll.io',
  },
  {
    name: '0x Protocol',
    logo: '/images/logos/partners/0x-logo-black.svg',
    url: 'https://0x.org',
  },
  {
    name: 'BuidlGuidl',
    logo: '/images/logos/partners/buidlguidl-logo-black.svg',
    url: 'https://buidlguidl.com',
  },
  {
    name: 'Monad',
    logo: '/images/logos/partners/monad-logo-blacl.svg',
    url: 'https://monad.xyz',
  },
  {
    name: 'ETHGlobal',
    logo: '/images/logos/partners/ethglobal-logo-color.svg',
    url: 'https://ethglobal.com',
  },
  {
    name: 'The Graph',
    logo: '/images/logos/partners/thegraph-logo-black.svg',
    url: 'https://thegraph.com',
  },
  {
    name: 'Polygon',
    logo: '/images/logos/partners/polygon-logo-black.svg',
    url: 'https://polygon.com',
  },
]

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function CustomersPartnersMarquee() {
  const [shuffledPartners, setShuffledPartners] = useState<Partner[]>(partners)

  useEffect(() => {
    setShuffledPartners(shuffleArray(partners))
  }, [])

  return (
    <div className="page-content space-y-8">
      <div className="flex flex-col gap-y-2 text-center">
        <h3 className="text-xl text-foreground md:text-2xl">
          Respaldados por los mejores del ecosistema
        </h3>
      </div>

      {/* Marquee container with fade edges */}
      <div className="relative">
        {/* Left fade overlay */}
        <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent md:w-32" />

        {/* Right fade overlay */}
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent md:w-32" />

        <Marquee pauseOnHover className="[--duration:40s] [--gap:2rem]">
          {shuffledPartners.map((partner) => (
            <Link
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center px-4 py-6"
            >
              <div className="relative h-12 w-32 md:h-16 md:w-40">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  fill
                  className="object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            </Link>
          ))}
        </Marquee>
      </div>

      <div className="pt-4 text-center md:pt-8">
        <p className="mx-auto max-w-2xl text-xl text-foreground md:text-2xl">
          Líderes de tecnología que respaldan nuestra garantía:{' '}
          <span className="font-bold text-primary">Frescura Certificada</span>,{' '}
          <span className="font-bold text-accent">Calidad Orgánica</span>
        </p>
      </div>
    </div>
  )
}
