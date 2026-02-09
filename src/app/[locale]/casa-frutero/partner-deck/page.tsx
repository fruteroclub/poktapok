import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import {
  DeckLayout,
  DeckHeader,
  DeckSection,
  DeckTable,
  DeckStats,
  DeckCTA,
  LocaleSwitcher,
} from '@/components/decks'
import {
  Users,
  Globe,
  Trophy,
  Target,
  Zap,
  Brain,
  Shield,
  Cpu,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  params: Promise<{ locale: string }>
}

const content = {
  es: {
    header: {
      title: 'Casa Frutero',
      subtitle: 'El Hogar del Impact Tech en LATAM — Hub Comunitario Premier de CDMX para AI, Crypto, Privacy, Robotics & Cultura',
    },
    opportunity: {
      title: 'La Oportunidad',
      description: 'Ciudad de México es la metrópolis más grande de LATAM (21M+ personas) con talento tech creciente — pero no existe un ancla física permanente para el ecosistema de Impact Tech.',
      problem: 'Builders talentosos trabajan en aislamiento. Empresas luchan por acceder a comunidades auténticas de desarrolladores LATAM.',
      solution: 'Casa Frutero resuelve esto: un hub comunitario permanente donde 1,000+ builders de AI, Crypto, Privacy, Robotics y Cultura se reúnen semanalmente para aprender, construir y conectar.',
      forSponsors: 'Para sponsors: Acceso auténtico a la comunidad de Impact Tech más comprometida de LATAM.',
    },
    whySponsor: {
      title: '¿Por Qué Patrocinar Casa Frutero?',
      subtitle: 'Acceso Auténtico, No Impresiones de Anuncios',
    },
    community: {
      title: 'La Comunidad Que Alcanzarás',
      primary: 'Primario: Builders activos (no consumidores pasivos)',
      demographics: {
        title: 'Demografía',
        items: [
          '22-32 años, técnicos o semi-técnicos',
          'Nativos hispanohablantes de LATAM',
          'Experimentando con AI, Crypto, Privacy',
          'Activamente shipeando productos',
        ],
      },
      location: {
        title: 'Ventaja de Ubicación',
        items: [
          'Distrito profesional en CDMX (acceso corporativo)',
          'Cerca de universidades (pipeline de talento)',
          'Accesible por Metro (amplio alcance)',
        ],
      },
    },
    whatSponsorsGet: {
      title: 'Lo Que Obtienen los Sponsors',
      brand: {
        title: 'Integración de Marca',
        items: [
          'Colocación de logo (website + venue físico)',
          'Mención en comunicaciones comunitarias (1,000+ alcance)',
          'Atribución en redes sociales',
          'Oportunidades de contenido co-branded',
        ],
      },
      access: {
        title: 'Acceso a la Comunidad',
        items: [
          'Exposición directa a builders activos',
          'Intros calientes a top talent',
          'Loops de feedback de producto/protocolo',
          'Pipeline de talento para hiring',
        ],
      },
      education: {
        title: 'Entrega Educativa',
        items: [
          'Slots de workshop para tu contenido técnico',
          'Oportunidades de demo en eventos mensuales',
          'Sesiones de onboarding para developers',
          'Programación custom (tiers superiores)',
        ],
      },
    },
    tiers: {
      title: 'Tiers de Patrocinio',
      bronze: {
        name: '🥉 BRONZE',
        price: '$250/mes',
        subtitle: 'Community Supporter',
        features: [
          'Logo en website + venue',
          'Mención en newsletter mensual',
          'Thank you en redes sociales (1x/mes)',
        ],
        note: 'Sin restricciones de exclusividad',
      },
      silver: {
        name: '🥈 SILVER',
        price: '$500/mes',
        subtitle: 'Ecosystem Partner',
        includes: 'Todo en Bronze, más:',
        features: [
          '4 horas/mes de tiempo dedicado para eventos',
          'Hostea meetup, demo, o AMA',
          'Acceso a espacio + equipamiento',
          'Frutero promueve a la comunidad',
          'Anuncios prioritarios a la comunidad',
          'Reporte de impacto trimestral',
        ],
        note: 'Máximo 4 partners Silver',
      },
      gold: {
        name: '🥇 GOLD',
        price: '$1,000/mes',
        subtitle: 'Strategic Partner',
        includes: 'Todo en Silver, más:',
        features: [
          '2 workshops mensuales entregados por Frutero',
          'Contenido custom sobre tu protocolo/producto',
          'Sesiones hands-on con builders',
          'Grabaciones para tus canales',
          'Colocación de partner destacado',
          'Liaison dedicado de Frutero',
          'Acceso a pipeline de talento',
          'Oportunidades de contenido co-branded',
        ],
        note: 'Máximo 3 partners Gold',
      },
      founding: {
        name: '🏆 FOUNDING PARTNER',
        price: '$1,750/mes',
        subtitle: 'Hub Co-Builder',
        includes: 'Todo en Gold, más:',
        features: [
          'Reconocimiento nombrado como Founding Partner',
          'Input en programación y temas',
          'Sesiones estratégicas trimestrales exclusivas',
          'Primer acceso a nuevos programas',
          'Derechos de co-host para eventos mayores',
          'Branding dedicado en espacio (opción de sala nombrada)',
          'Retrospectiva anual de impacto + case study',
        ],
        note: 'Máximo 2 Founding Partners',
      },
    },
    focusAreas: {
      title: 'Áreas de Enfoque de Impact Tech',
      description: 'Casa Frutero sirve el stack completo de Impact Tech:',
      note: 'Tu patrocinio apoya el ecosistema completo, no solo una vertical.',
    },
    trackRecord: {
      title: 'Track Record',
    },
    sampleProgramming: {
      title: 'Programación de Ejemplo',
      subtitle: 'Cómo Luce un Mes Patrocinado',
    },
    whyNow: {
      title: '¿Por Qué Ahora?',
      latam: {
        title: 'LATAM Se Está Volviendo Crítico',
        items: [
          'Adopción de crypto de más rápido crecimiento globalmente',
          'Pool de talento AI sin explotar con ventaja de costo',
          'Alineación de zona horaria con mercados US',
          'Puente cultural a 650M+ hispanohablantes',
        ],
      },
      entryPoint: {
        title: 'Casa Frutero es el Punto de Entrada',
        items: [
          'Único hub permanente de Impact Tech en México',
          'Operador probado (3+ años de programación continua)',
          'Comunidad auténtica (builders, no turistas)',
          'Resultados medibles (trackeamos todo)',
        ],
      },
    },
    tracking: {
      title: 'Lo Que Trackeamos y Reportamos',
      description: 'Reportes Mensuales/Trimestrales Incluyen:',
      items: [
        'Asistencia a workshops + tasas de completación',
        'Engagement de builders con contenido del sponsor',
        'Proyectos iniciados/shipeados usando tech del sponsor',
        'Intros de talento realizadas',
        'Alcance y engagement en redes sociales',
        'Métricas de conversión (donde aplique)',
      ],
      note: 'Sabrás exactamente qué produce tu inversión.',
    },
    nextSteps: {
      title: 'Siguientes Pasos',
      steps: [
        { num: '1', text: 'Elige tu tier — Bronze hasta Founding Partner' },
        { num: '2', text: 'Agenda llamada intro — 30 min de conversación de alineación' },
        { num: '3', text: 'Formaliza partnership — Acuerdo simple, facturación mensual' },
        { num: '4', text: 'Intégrate — Onboarding en 2 semanas' },
      ],
    },
    location: {
      title: 'Ubicación',
      address: 'Insurgentes Sur 1877, Guadalupe Inn, CDMX',
      features: [
        '5 min del Metro Barranca del Muerto',
        'Distrito profesional, colonia segura',
        '25 estaciones de trabajo · 50 capacidad de eventos',
        'Completamente equipado (AV, grabación, streaming)',
      ],
    },
    cta: {
      title: 'Conviértete en Partner',
      description: 'Tu marca puede ser parte de los cimientos del hub de Impact Tech de LATAM.',
      button: 'Agendar Llamada',
      email: 'mel@frutero.club',
    },
    footer: {
      quote: '"Construimos la organización. Ahora estamos construyendo el hogar. Tu marca puede ser parte de los cimientos."',
      tagline: 'Casa Frutero — Donde los Builders Suben de Nivel',
      built: 'Crece con Impact Tech. Las oportunidades siguen.',
    },
    stats: {
      developers: { value: '1,000+', label: 'Desarrolladores' },
      countries: { value: '15+', label: 'Países' },
      mentors: { value: '17', label: 'Mentores Activos' },
      hackathonWins: { value: '25+', label: 'Victorias Hackathon' },
      ethdenver: { value: '6', label: 'Ganadores ETHDenver 2025' },
      completion: { value: '32.7%', label: 'Tasa Completación' },
      success: { value: '70%+', label: 'Éxito Hackathon' },
    },
  },
  en: {
    header: {
      title: 'Casa Frutero',
      subtitle: 'The Home for Impact Tech in LATAM — Mexico City\'s Premier Community Hub for AI, Crypto, Privacy, Robotics & Culture',
    },
    opportunity: {
      title: 'The Opportunity',
      description: 'Mexico City is LATAM\'s largest metro (21M+ people) with growing tech talent — but no permanent physical anchor for the Impact Tech ecosystem.',
      problem: 'Talented builders work in isolation. Companies struggle to access authentic LATAM developer communities.',
      solution: 'Casa Frutero solves this: a permanent community hub where 1,000+ builders across AI, Crypto, Privacy, Robotics, and Culture gather weekly to learn, build, and connect.',
      forSponsors: 'For sponsors: Authentic access to LATAM\'s most engaged Impact Tech community.',
    },
    whySponsor: {
      title: 'Why Sponsor Casa Frutero?',
      subtitle: 'Authentic Access, Not Ad Impressions',
    },
    community: {
      title: 'The Community You\'ll Reach',
      primary: 'Primary: Active builders (not passive consumers)',
      demographics: {
        title: 'Demographics',
        items: [
          '22-32 years old, technical or semi-technical',
          'Spanish-speaking LATAM natives',
          'Experimenting with AI, Crypto, Privacy tech',
          'Actively shipping products',
        ],
      },
      location: {
        title: 'Location Advantage',
        items: [
          'Professional district in CDMX (corporate access)',
          'Near universities (talent pipeline)',
          'Metro-accessible (broad reach)',
        ],
      },
    },
    whatSponsorsGet: {
      title: 'What Sponsors Get',
      brand: {
        title: 'Brand Integration',
        items: [
          'Logo placement (website + physical venue)',
          'Mention in community communications (1,000+ reach)',
          'Social media attribution',
          'Co-branded content opportunities',
        ],
      },
      access: {
        title: 'Community Access',
        items: [
          'Direct exposure to active builders',
          'Warm introductions to top talent',
          'Product/protocol feedback loops',
          'Talent pipeline for hiring',
        ],
      },
      education: {
        title: 'Education Delivery',
        items: [
          'Workshop slots for your technical content',
          'Demo opportunities at monthly events',
          'Developer onboarding sessions',
          'Custom programming (higher tiers)',
        ],
      },
    },
    tiers: {
      title: 'Sponsorship Tiers',
      bronze: {
        name: '🥉 BRONZE',
        price: '$250/month',
        subtitle: 'Community Supporter',
        features: [
          'Logo on website + venue',
          'Monthly newsletter mention',
          'Social media thank you (1x/month)',
        ],
        note: 'No exclusivity constraints',
      },
      silver: {
        name: '🥈 SILVER',
        price: '$500/month',
        subtitle: 'Ecosystem Partner',
        includes: 'Everything in Bronze, plus:',
        features: [
          '4 hours/month dedicated event time',
          'Host meetup, demo, or AMA',
          'Access to space + equipment',
          'Frutero promotes to community',
          'Priority community announcements',
          'Quarterly impact report',
        ],
        note: 'Maximum 4 Silver partners',
      },
      gold: {
        name: '🥇 GOLD',
        price: '$1,000/month',
        subtitle: 'Strategic Partner',
        includes: 'Everything in Silver, plus:',
        features: [
          '2 monthly workshops delivered by Frutero',
          'Custom content about your protocol/product',
          'Hands-on builder sessions',
          'Recordings for your channels',
          'Featured partner placement',
          'Dedicated Frutero liaison',
          'Talent pipeline access',
          'Co-branded content opportunities',
        ],
        note: 'Maximum 3 Gold partners',
      },
      founding: {
        name: '🏆 FOUNDING PARTNER',
        price: '$1,750/month',
        subtitle: 'Hub Co-Builder',
        includes: 'Everything in Gold, plus:',
        features: [
          'Named recognition as Founding Partner',
          'Input on programming and topics',
          'Exclusive quarterly strategy sessions',
          'First access to new programs',
          'Co-host rights for major events',
          'Dedicated space branding (named room option)',
          'Annual impact retrospective + case study',
        ],
        note: 'Maximum 2 Founding Partners',
      },
    },
    focusAreas: {
      title: 'Impact Tech Focus Areas',
      description: 'Casa Frutero serves the full Impact Tech stack:',
      note: 'Your sponsorship supports the entire ecosystem, not just one vertical.',
    },
    trackRecord: {
      title: 'Track Record',
    },
    sampleProgramming: {
      title: 'Sample Programming',
      subtitle: 'What a Sponsored Month Looks Like',
    },
    whyNow: {
      title: 'Why Now?',
      latam: {
        title: 'LATAM is Becoming Critical',
        items: [
          'Fastest-growing crypto adoption globally',
          'Untapped AI talent pool with cost advantage',
          'Time zone alignment with US markets',
          'Cultural bridge to 650M+ Spanish speakers',
        ],
      },
      entryPoint: {
        title: 'Casa Frutero is the Entry Point',
        items: [
          'Only permanent Impact Tech hub in Mexico',
          'Proven operator (3+ years continuous programming)',
          'Authentic community (builders, not tourists)',
          'Measurable outcomes (we track everything)',
        ],
      },
    },
    tracking: {
      title: 'What We Track & Report',
      description: 'Monthly/Quarterly Reports Include:',
      items: [
        'Workshop attendance + completion rates',
        'Builder engagement with sponsor content',
        'Projects started/shipped using sponsor tech',
        'Talent intros made',
        'Social media reach and engagement',
        'Conversion metrics (where applicable)',
      ],
      note: 'You\'ll know exactly what your investment produces.',
    },
    nextSteps: {
      title: 'Next Steps',
      steps: [
        { num: '1', text: 'Choose your tier — Bronze through Founding Partner' },
        { num: '2', text: 'Schedule intro call — 30 min alignment conversation' },
        { num: '3', text: 'Formalize partnership — Simple agreement, monthly billing' },
        { num: '4', text: 'Get integrated — Onboarding within 2 weeks' },
      ],
    },
    location: {
      title: 'Location',
      address: 'Insurgentes Sur 1877, Guadalupe Inn, CDMX',
      features: [
        '5 min from Metro Barranca del Muerto',
        'Professional district, safe neighborhood',
        '25 workstations · 50 event capacity',
        'Fully equipped (AV, recording, streaming)',
      ],
    },
    cta: {
      title: 'Become a Partner',
      description: 'Your brand can be part of the foundation of LATAM\'s Impact Tech hub.',
      button: 'Schedule a Call',
      email: 'mel@frutero.club',
    },
    footer: {
      quote: '"We built the organization. Now we\'re building the home. Your brand can be part of the foundation."',
      tagline: 'Casa Frutero — Where Builders Level Up',
      built: 'Grow with Impact Tech. Opportunities follow.',
    },
    stats: {
      developers: { value: '1,000+', label: 'Developers' },
      countries: { value: '15+', label: 'Countries' },
      mentors: { value: '17', label: 'Active Mentors' },
      hackathonWins: { value: '25+', label: 'Hackathon Victories' },
      ethdenver: { value: '6', label: 'ETHDenver 2025 Winners' },
      completion: { value: '32.7%', label: 'Completion Rate' },
      success: { value: '70%+', label: 'Hackathon Success' },
    },
  },
}

const tableData = {
  comparison: {
    es: {
      columns: [
        { key: 'traditional', header: 'Patrocinio Tradicional' },
        { key: 'casafrutero', header: 'Partnership Casa Frutero' },
      ],
      data: [
        { traditional: 'Logo en website', casafrutero: 'Integrado en touchpoints semanales' },
        { traditional: 'Booth en conferencia (1 día)', casafrutero: 'Presencia recurrente por meses' },
        { traditional: 'Exposición pasiva de marca', casafrutero: 'Entrega activa de educación técnica' },
        { traditional: 'Conversión desconocida', casafrutero: 'Engagement trackeable de builders' },
        { traditional: 'Transaccional', casafrutero: 'Construcción de relaciones' },
      ],
    },
    en: {
      columns: [
        { key: 'traditional', header: 'Traditional Sponsorship' },
        { key: 'casafrutero', header: 'Casa Frutero Partnership' },
      ],
      data: [
        { traditional: 'Logo on website', casafrutero: 'Integrated into weekly community touchpoints' },
        { traditional: 'Conference booth (1 day)', casafrutero: 'Recurring presence over months' },
        { traditional: 'Passive brand exposure', casafrutero: 'Active technical education delivery' },
        { traditional: 'Unknown conversion', casafrutero: 'Trackable builder engagement' },
        { traditional: 'Transactional', casafrutero: 'Relationship-building' },
      ],
    },
  },
  focusAreas: {
    es: {
      columns: [
        { key: 'tech', header: 'Tecnología' },
        { key: 'strength', header: 'Fortaleza de Comunidad' },
      ],
      data: [
        { tech: 'AI', strength: 'AgentCamp (6 ganadores ETHDenver), integración AI x Crypto' },
        { tech: 'Crypto', strength: 'Ethereum, L2s, protocolos DeFi, creadores de stablecoins (LaDAO/$XOC)' },
        { tech: 'Privacy', strength: 'Workshops de ZK, tech preservadora de privacidad' },
        { tech: 'Robotics', strength: 'Integración hardware x software (emergente)' },
        { tech: 'Culture', strength: 'Comunidades de builders, innovación regional' },
      ],
    },
    en: {
      columns: [
        { key: 'tech', header: 'Technology' },
        { key: 'strength', header: 'Community Strength' },
      ],
      data: [
        { tech: 'AI', strength: 'AgentCamp (6 ETHDenver winners), AI x Crypto integration' },
        { tech: 'Crypto', strength: 'Ethereum, L2s, DeFi protocols, stablecoin creators (LaDAO/$XOC)' },
        { tech: 'Privacy', strength: 'ZK workshops, privacy-preserving tech' },
        { tech: 'Robotics', strength: 'Hardware x software integration (emerging)' },
        { tech: 'Culture', strength: 'Builder communities, regional innovation' },
      ],
    },
  },
  sampleMonth: {
    es: {
      columns: [
        { key: 'week', header: 'Semana' },
        { key: 'activity', header: 'Actividad' },
      ],
      data: [
        { week: 'Semana 1', activity: 'Mié: Open Coworking + Office Hours (15-25 builders) · Jue: [TU WORKSHOP] "Building on [Tu Protocolo]"' },
        { week: 'Semana 2', activity: 'Mié: Open Coworking + Office Hours · Vie: [TU DEMO] Lanzamiento de Nuevas Features' },
        { week: 'Semana 3', activity: 'Mié: Open Coworking + Office Hours · Jue: [TU WORKSHOP] "Advanced [Tu Tech]"' },
        { week: 'Semana 4', activity: 'Mié: Open Coworking + Office Hours · Sáb: Community Meetup (30-50 asistentes) — Eres featured' },
      ],
    },
    en: {
      columns: [
        { key: 'week', header: 'Week' },
        { key: 'activity', header: 'Activity' },
      ],
      data: [
        { week: 'Week 1', activity: 'Wed: Open Coworking + Office Hours (15-25 builders) · Thu: [YOUR WORKSHOP] "Building on [Your Protocol]"' },
        { week: 'Week 2', activity: 'Wed: Open Coworking + Office Hours · Fri: [YOUR DEMO] New Features Launch' },
        { week: 'Week 3', activity: 'Wed: Open Coworking + Office Hours · Thu: [YOUR WORKSHOP] "Advanced [Your Tech]"' },
        { week: 'Week 4', activity: 'Wed: Open Coworking + Office Hours · Sat: Community Meetup (30-50 attendees) — You\'re featured' },
      ],
    },
  },
}

function TierCard({
  name,
  price,
  subtitle,
  includes,
  features,
  note,
  highlight = false,
}: {
  name: string
  price: string
  subtitle: string
  includes?: string
  features: string[]
  note: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 space-y-4',
        highlight
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border/50 bg-card/50'
      )}
    >
      <div className="text-center">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-2xl font-bold text-primary">{price}</p>
        <p className="text-sm text-foreground/70">{subtitle}</p>
      </div>
      {includes && (
        <p className="text-sm font-medium text-foreground/80">{includes}</p>
      )}
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-foreground/60 italic">{note}</p>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title:
      locale === 'es'
        ? 'Casa Frutero — Partner Deck | Frutero'
        : 'Casa Frutero — Partner Deck | Frutero',
    description:
      locale === 'es'
        ? 'Conviértete en partner de Casa Frutero — El hogar del Impact Tech en LATAM'
        : 'Become a Casa Frutero partner — The home for Impact Tech in LATAM',
    openGraph: {
      title: 'Casa Frutero — Sponsorship Opportunities',
      description:
        locale === 'es'
          ? 'Acceso auténtico a la comunidad de Impact Tech más comprometida de LATAM'
          : 'Authentic access to LATAM\'s most engaged Impact Tech community',
      type: 'website',
      images: ['/og/casa-frutero-partner.png'],
    },
  }
}

export default async function PartnerDeckPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = content[locale as 'es' | 'en'] || content.es
  const tables = {
    comparison: tableData.comparison[locale as 'es' | 'en'] || tableData.comparison.es,
    focusAreas: tableData.focusAreas[locale as 'es' | 'en'] || tableData.focusAreas.es,
    sampleMonth: tableData.sampleMonth[locale as 'es' | 'en'] || tableData.sampleMonth.es,
  }

  return (
    <DeckLayout>
      {/* Language switcher */}
      <div className="flex justify-end print:hidden">
        <LocaleSwitcher />
      </div>

      {/* Header */}
      <DeckHeader
        title={t.header.title}
        subtitle={t.header.subtitle}
        logo={{
          src: '/images/logos/frutero-logo.svg',
          alt: 'Frutero',
          width: 100,
          height: 100,
        }}
      />

      {/* The Opportunity */}
      <DeckSection title={t.opportunity.title} description={t.opportunity.description}>
        <p className="mb-4 text-foreground/80">{t.opportunity.problem}</p>
        <p className="mb-4 text-lg font-medium">{t.opportunity.solution}</p>
        <p className="rounded-lg bg-primary/10 p-4 text-primary font-semibold text-center">
          {t.opportunity.forSponsors}
        </p>
      </DeckSection>

      {/* Why Sponsor */}
      <DeckSection title={t.whySponsor.title} description={t.whySponsor.subtitle}>
        <DeckTable columns={tables.comparison.columns} data={tables.comparison.data} />
      </DeckSection>

      {/* The Community */}
      <DeckSection title={t.community.title}>
        <p className="mb-6 text-lg font-medium text-primary">{t.community.primary}</p>
        <DeckStats
          stats={[
            { ...t.stats.developers, icon: Users, accent: 'primary' },
            { ...t.stats.hackathonWins, icon: Trophy, accent: 'secondary' },
            { ...t.stats.success, icon: Target, accent: 'accent' },
            { ...t.stats.completion, icon: Target, accent: 'primary' },
          ]}
          columns={4}
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border/50 p-4">
            <h4 className="font-semibold mb-2">{t.community.demographics.title}</h4>
            <ul className="space-y-1 text-sm text-foreground/80">
              {t.community.demographics.items.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border/50 p-4">
            <h4 className="font-semibold mb-2">{t.community.location.title}</h4>
            <ul className="space-y-1 text-sm text-foreground/80">
              {t.community.location.items.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </DeckSection>

      {/* What Sponsors Get */}
      <DeckSection title={t.whatSponsorsGet.title}>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border/50 p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t.whatSponsorsGet.brand.title}
            </h4>
            <ul className="space-y-1 text-sm">
              {t.whatSponsorsGet.brand.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border/50 p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t.whatSponsorsGet.access.title}
            </h4>
            <ul className="space-y-1 text-sm">
              {t.whatSponsorsGet.access.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border/50 p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {t.whatSponsorsGet.education.title}
            </h4>
            <ul className="space-y-1 text-sm">
              {t.whatSponsorsGet.education.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DeckSection>

      {/* Sponsorship Tiers */}
      <DeckSection title={t.tiers.title} variant="highlight">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TierCard {...t.tiers.bronze} />
          <TierCard {...t.tiers.silver} />
          <TierCard {...t.tiers.gold} highlight />
          <TierCard {...t.tiers.founding} />
        </div>
      </DeckSection>

      {/* Focus Areas */}
      <DeckSection title={t.focusAreas.title} description={t.focusAreas.description}>
        <DeckTable columns={tables.focusAreas.columns} data={tables.focusAreas.data} />
        <p className="mt-4 text-center font-medium text-primary">{t.focusAreas.note}</p>
      </DeckSection>

      {/* Track Record */}
      <DeckSection title={t.trackRecord.title}>
        <DeckStats
          stats={[
            { ...t.stats.developers, icon: Users, accent: 'primary' },
            { ...t.stats.countries, icon: Globe, accent: 'secondary' },
            { ...t.stats.mentors, icon: Users, accent: 'accent' },
            { ...t.stats.hackathonWins, icon: Trophy, accent: 'primary' },
            { ...t.stats.ethdenver, icon: Trophy, accent: 'secondary' },
            { ...t.stats.completion, icon: Target, accent: 'accent' },
          ]}
          columns={3}
        />
      </DeckSection>

      {/* Sample Programming */}
      <DeckSection title={t.sampleProgramming.title} description={t.sampleProgramming.subtitle}>
        <DeckTable columns={tables.sampleMonth.columns} data={tables.sampleMonth.data} />
      </DeckSection>

      {/* Why Now */}
      <DeckSection title={t.whyNow.title}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border/50 p-6 space-y-4">
            <h4 className="text-lg font-semibold">{t.whyNow.latam.title}</h4>
            <ul className="space-y-2">
              {t.whyNow.latam.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">→</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 space-y-4">
            <h4 className="text-lg font-semibold">{t.whyNow.entryPoint.title}</h4>
            <ul className="space-y-2">
              {t.whyNow.entryPoint.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DeckSection>

      {/* What We Track */}
      <DeckSection title={t.tracking.title} description={t.tracking.description}>
        <div className="grid gap-3 sm:grid-cols-2">
          {t.tracking.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border/50 p-3">
              <span className="text-primary">📊</span>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center font-semibold text-primary">{t.tracking.note}</p>
      </DeckSection>

      {/* Next Steps */}
      <DeckSection title={t.nextSteps.title}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.nextSteps.steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 rounded-lg border border-border/50">
              <span className="text-3xl font-bold text-primary mb-2">{step.num}</span>
              <span className="text-sm">{step.text}</span>
            </div>
          ))}
        </div>
      </DeckSection>

      {/* Location */}
      <DeckSection title={t.location.title}>
        <div className="text-center space-y-4">
          <p className="text-xl">📍 <strong>{t.location.address}</strong></p>
          <div className="flex flex-wrap justify-center gap-3">
            {t.location.features.map((feature, i) => (
              <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-sm">
                {feature}
              </span>
            ))}
          </div>
        </div>
      </DeckSection>

      {/* CTA */}
      <DeckCTA
        title={t.cta.title}
        description={t.cta.description}
        primaryAction={{
          label: t.cta.button,
          href: `mailto:${t.cta.email}?subject=Casa%20Frutero%20Sponsorship`,
        }}
        secondaryAction={{
          label: 'Ian — BD',
          href: 'mailto:ian@frutero.club?subject=Casa%20Frutero%20Sponsorship',
        }}
        contactEmail={t.cta.email}
      />

      {/* Footer */}
      <footer className="space-y-4 text-center text-foreground/60">
        <p className="italic">{t.footer.quote}</p>
        <div>
          <p className="text-lg font-bold text-foreground">{t.footer.tagline}</p>
          <p>{t.footer.built}</p>
        </div>
        <div className="flex justify-center gap-4 text-sm">
          <a href="https://frutero.club" className="hover:text-primary">frutero.club</a>
          <span>•</span>
          <a href="https://x.com/FruteroClub" className="hover:text-primary">@FruteroClub</a>
        </div>
      </footer>
    </DeckLayout>
  )
}
