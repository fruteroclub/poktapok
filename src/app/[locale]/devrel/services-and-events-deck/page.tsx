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
  GraduationCap,
  Calendar,
  TrendingUp,
  MessageSquare,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  params: Promise<{ locale: string }>
}

const content = {
  es: {
    header: {
      title: 'Frutero DevRel',
      subtitle: 'DevRel-as-a-Service para Protocolos Web3 — La Capa de Retención que Mantiene a tus Builders Construyendo',
    },
    problem: {
      title: 'El Problema',
      headline: 'Gastas $50K en patrocinar un hackathon. 200 builders participan. Dos semanas después, el 95% se fue.',
      description: 'Los protocolos enfrentan un problema crítico: la activación de builders sin retención es dinero quemado. Sin un engagement persistente post-evento, los developers prueban tu tech una vez y siguen adelante.',
      stats: [
        { label: 'Drop-off típico post-hackathon', value: '95%' },
        { label: 'Costo promedio por activación', value: '$250+' },
        { label: 'Builders perdidos = oportunidad perdida', value: '∞' },
      ],
    },
    solution: {
      title: 'La Solución Frutero',
      headline: 'La capa de retención persistente que mantiene builders shipeando en tu protocolo.',
      description: 'Frutero no organiza eventos — construimos pipelines de talento. Nuestro modelo DevRel-as-a-Service cubre el ciclo de vida completo del builder: desde el primer contacto universitario hasta el shipping de productos en mainnet.',
      differentiators: [
        { title: 'Puente Bilingüe', desc: 'Español/Inglés nativo — sin fricción cultural' },
        { title: 'Red LATAM Profunda', desc: '1,000+ builders, 15+ países, 17 mentores' },
        { title: 'Resultados Probados', desc: '70%+ éxito en hackathons, 32.7% tasa de completación' },
        { title: 'Operadores, No Organizadores', desc: 'Programación continua, no eventos únicos' },
      ],
    },
    services: {
      title: 'Servicios DevRel',
      description: 'Menú completo de servicios de desarrollo de ecosistema:',
    },
    packages: {
      title: 'Paquetes de Servicio',
      retainer: {
        name: '📅 RETAINER MENSUAL',
        price: '$3,500/mes',
        subtitle: 'Engagement Continuo de Builders',
        features: [
          'Activaciones universitarias (2-4/mes)',
          'Soporte de eventos Blitz',
          'Coworking semanal + office hours',
          'Misiones mensuales (challenges técnicos)',
          'Reporteo semanal de métricas de salud de builders',
          'Acceso a red de mentores',
          'Contenido técnico en español',
        ],
        note: 'Contrato mínimo: 3 meses',
        validated: 'Validado con Monad Foundation — $10,500/trimestre',
      },
      event: {
        name: '🎯 SOPORTE DE EVENTO',
        price: '$6,000/evento',
        subtitle: 'DevRel para Hackathons',
        features: [
          'Reclutamiento pre-evento (mínimo 20 builders)',
          'Mentoría técnica durante evento',
          'Workshops hands-on de tu stack',
          'Soporte post-evento (2 semanas)',
          'Reporte de engagement + leads',
          'Intros calientes a top performers',
        ],
        note: 'Disponible como add-on al retainer',
      },
      incubation: {
        name: '🚀 INCUBACIÓN DE BUILDERS',
        price: '$8K - $15K',
        subtitle: 'Programa Post-Hackathon',
        features: [
          'Programa de 3 meses ($8K) o 6 meses ($15K)',
          'Cohorte dedicada de 10-15 builders',
          'Mentoría técnica semanal',
          'Office hours con tu equipo',
          'Demo days mensuales',
          'Pipeline de talento para hiring',
          'Tracking de proyectos shipeados',
        ],
        note: 'El upsell del evento al partnership de largo plazo',
      },
    },
    events: {
      title: 'Servicios de Eventos',
      description: 'Activaciones de comunidad que generan resultados medibles:',
    },
    trackRecord: {
      title: 'Track Record',
      subtitle: 'Resultados que protocolos necesitan ver:',
    },
    caseStudy: {
      title: 'Case Study: Monad Foundation',
      description: 'Engagement activo desde Q4 2025',
      metrics: [
        { label: 'Contrato', value: '$10,500/trimestre' },
        { label: 'Builders activados', value: '50+' },
        { label: 'Eventos ejecutados', value: '8+' },
        { label: 'Universidades alcanzadas', value: '3' },
      ],
      services: [
        'Activaciones universitarias en CDMX',
        'Soporte de hackathon Blitz',
        'Coworking semanal en Casa Frutero',
        'Monad Missions mensuales',
        'Reporteo de métricas de builders',
      ],
    },
    whyFrutero: {
      title: '¿Por Qué Frutero?',
      comparison: {
        title: 'vs. Agencias DevRel Tradicionales',
      },
    },
    clients: {
      title: 'Protocolos que Confían en Nosotros',
      list: ['Monad', 'Base (Coinbase L2)', 'Solana Foundation', 'Polygon', 'The Graph', 'Scroll'],
      partners: 'ETHGlobal • BuidlGuidl • Universidades LATAM',
    },
    pricing: {
      title: 'Resumen de Precios',
    },
    nextSteps: {
      title: 'Siguientes Pasos',
      steps: [
        { num: '1', text: 'Llamada de descubrimiento (30 min) — Entender tus metas de ecosistema' },
        { num: '2', text: 'Propuesta custom — Paquete adaptado a tus necesidades' },
        { num: '3', text: 'Kickoff — Onboarding en 2 semanas' },
        { num: '4', text: 'Reporteo mensual — Métricas transparentes de builder health' },
      ],
    },
    cta: {
      title: 'Deja de Perder Builders',
      description: 'Cada hackathon sin retención post-evento es dinero quemado. Frutero es la capa persistente que convierte activaciones en ecosistema.',
      button: 'Agendar Llamada',
      email: 'ian@frutero.club',
    },
    footer: {
      quote: '"Gastas en activación. Nosotros entregamos retención. Tus builders shipean."',
      tagline: 'Frutero DevRel — La Capa de Retención de LATAM',
      built: 'Donde los builders se quedan.',
    },
    stats: {
      builders: { value: '1,000+', label: 'Builders en Red' },
      countries: { value: '15+', label: 'Países' },
      mentors: { value: '17', label: 'Mentores Activos' },
      hackathonWins: { value: '25+', label: 'Victorias Hackathon' },
      ethdenver: { value: '6', label: 'Ganadores ETHDenver 2025' },
      completion: { value: '32.7%', label: 'Tasa Completación' },
      success: { value: '70%+', label: 'Éxito Hackathon' },
      retention: { value: '2x', label: 'vs. Industria' },
    },
  },
  en: {
    header: {
      title: 'Frutero DevRel',
      subtitle: 'DevRel-as-a-Service for Web3 Protocols — The Retention Layer That Keeps Your Builders Building',
    },
    problem: {
      title: 'The Problem',
      headline: 'You spend $50K sponsoring a hackathon. 200 builders participate. Two weeks later, 95% are gone.',
      description: 'Protocols face a critical problem: builder activation without retention is burned money. Without persistent post-event engagement, developers try your tech once and move on.',
      stats: [
        { label: 'Typical post-hackathon drop-off', value: '95%' },
        { label: 'Average cost per activation', value: '$250+' },
        { label: 'Lost builders = lost opportunity', value: '∞' },
      ],
    },
    solution: {
      title: 'The Frutero Solution',
      headline: 'The persistent retention layer that keeps builders shipping on your protocol.',
      description: 'Frutero doesn\'t organize events — we build talent pipelines. Our DevRel-as-a-Service model covers the full builder lifecycle: from first university contact to mainnet product shipping.',
      differentiators: [
        { title: 'Bilingual Bridge', desc: 'Native Spanish/English — zero cultural friction' },
        { title: 'Deep LATAM Network', desc: '1,000+ builders, 15+ countries, 17 mentors' },
        { title: 'Proven Results', desc: '70%+ hackathon success, 32.7% completion rate' },
        { title: 'Operators, Not Organizers', desc: 'Continuous programming, not one-off events' },
      ],
    },
    services: {
      title: 'DevRel Services',
      description: 'Full menu of ecosystem development services:',
    },
    packages: {
      title: 'Service Packages',
      retainer: {
        name: '📅 MONTHLY RETAINER',
        price: '$3,500/month',
        subtitle: 'Continuous Builder Engagement',
        features: [
          'University activations (2-4/month)',
          'Blitz event support',
          'Weekly coworking + office hours',
          'Monthly Missions (technical challenges)',
          'Weekly builder health metrics reporting',
          'Mentor network access',
          'Spanish-language technical content',
        ],
        note: 'Minimum contract: 3 months',
        validated: 'Validated with Monad Foundation — $10,500/quarter',
      },
      event: {
        name: '🎯 EVENT SUPPORT',
        price: '$6,000/event',
        subtitle: 'Hackathon DevRel',
        features: [
          'Pre-event recruitment (minimum 20 builders)',
          'Technical mentorship during event',
          'Hands-on workshops for your stack',
          'Post-event support (2 weeks)',
          'Engagement report + leads',
          'Warm intros to top performers',
        ],
        note: 'Available as add-on to retainer',
      },
      incubation: {
        name: '🚀 BUILDER INCUBATION',
        price: '$8K - $15K',
        subtitle: 'Post-Hackathon Program',
        features: [
          '3-month ($8K) or 6-month ($15K) program',
          'Dedicated cohort of 10-15 builders',
          'Weekly technical mentorship',
          'Office hours with your team',
          'Monthly demo days',
          'Talent pipeline for hiring',
          'Shipped projects tracking',
        ],
        note: 'The upsell from event to long-term partnership',
      },
    },
    events: {
      title: 'Event Services',
      description: 'Community activations that generate measurable results:',
    },
    trackRecord: {
      title: 'Track Record',
      subtitle: 'Results protocols need to see:',
    },
    caseStudy: {
      title: 'Case Study: Monad Foundation',
      description: 'Active engagement since Q4 2025',
      metrics: [
        { label: 'Contract', value: '$10,500/quarter' },
        { label: 'Builders activated', value: '50+' },
        { label: 'Events executed', value: '8+' },
        { label: 'Universities reached', value: '3' },
      ],
      services: [
        'University activations in CDMX',
        'Blitz hackathon support',
        'Weekly coworking at Casa Frutero',
        'Monthly Monad Missions',
        'Builder metrics reporting',
      ],
    },
    whyFrutero: {
      title: 'Why Frutero?',
      comparison: {
        title: 'vs. Traditional DevRel Agencies',
      },
    },
    clients: {
      title: 'Protocols That Trust Us',
      list: ['Monad', 'Base (Coinbase L2)', 'Solana Foundation', 'Polygon', 'The Graph', 'Scroll'],
      partners: 'ETHGlobal • BuidlGuidl • LATAM Universities',
    },
    pricing: {
      title: 'Pricing Summary',
    },
    nextSteps: {
      title: 'Next Steps',
      steps: [
        { num: '1', text: 'Discovery call (30 min) — Understand your ecosystem goals' },
        { num: '2', text: 'Custom proposal — Package tailored to your needs' },
        { num: '3', text: 'Kickoff — Onboarding within 2 weeks' },
        { num: '4', text: 'Monthly reporting — Transparent builder health metrics' },
      ],
    },
    cta: {
      title: 'Stop Losing Builders',
      description: 'Every hackathon without post-event retention is burned money. Frutero is the persistent layer that converts activations into ecosystem.',
      button: 'Schedule a Call',
      email: 'ian@frutero.club',
    },
    footer: {
      quote: '"You spend on activation. We deliver retention. Your builders ship."',
      tagline: 'Frutero DevRel — LATAM\'s Retention Layer',
      built: 'Where builders stay.',
    },
    stats: {
      builders: { value: '1,000+', label: 'Builders in Network' },
      countries: { value: '15+', label: 'Countries' },
      mentors: { value: '17', label: 'Active Mentors' },
      hackathonWins: { value: '25+', label: 'Hackathon Victories' },
      ethdenver: { value: '6', label: 'ETHDenver 2025 Winners' },
      completion: { value: '32.7%', label: 'Completion Rate' },
      success: { value: '70%+', label: 'Hackathon Success' },
      retention: { value: '2x', label: 'vs. Industry' },
    },
  },
}

const tableData = {
  services: {
    es: {
      columns: [
        { key: 'service', header: 'Servicio' },
        { key: 'description', header: 'Descripción' },
        { key: 'frequency', header: 'Frecuencia' },
      ],
      data: [
        { service: 'Activaciones Universitarias', description: 'Workshops, charlas, y reclutamiento en campus', frequency: '2-4/mes' },
        { service: 'Soporte de Hackathons', description: 'Mentoría técnica + reclutamiento pre/post evento', frequency: 'Por evento' },
        { service: 'Coworking + Office Hours', description: 'Espacio dedicado para builders de tu protocolo', frequency: 'Semanal' },
        { service: 'Misiones Técnicas', description: 'Challenges mensuales con premios', frequency: 'Mensual' },
        { service: 'Contenido Técnico', description: 'Tutoriales, guías, docs en español', frequency: 'Continuo' },
        { service: 'Reporteo de Métricas', description: 'Builder health, engagement, proyectos shipeados', frequency: 'Semanal' },
      ],
    },
    en: {
      columns: [
        { key: 'service', header: 'Service' },
        { key: 'description', header: 'Description' },
        { key: 'frequency', header: 'Frequency' },
      ],
      data: [
        { service: 'University Activations', description: 'Workshops, talks, and campus recruitment', frequency: '2-4/month' },
        { service: 'Hackathon Support', description: 'Technical mentorship + pre/post event recruitment', frequency: 'Per event' },
        { service: 'Coworking + Office Hours', description: 'Dedicated space for your protocol\'s builders', frequency: 'Weekly' },
        { service: 'Technical Missions', description: 'Monthly challenges with prizes', frequency: 'Monthly' },
        { service: 'Technical Content', description: 'Tutorials, guides, docs in Spanish', frequency: 'Ongoing' },
        { service: 'Metrics Reporting', description: 'Builder health, engagement, shipped projects', frequency: 'Weekly' },
      ],
    },
  },
  events: {
    es: {
      columns: [
        { key: 'event', header: 'Tipo de Evento' },
        { key: 'capacity', header: 'Capacidad' },
        { key: 'deliverables', header: 'Entregables' },
      ],
      data: [
        { event: 'Workshop Técnico', capacity: '15-30 builders', deliverables: 'Hands-on session, grabación, leads' },
        { event: 'Hackathon Local', capacity: '50-100 builders', deliverables: 'Mentoría, premios, post-event follow-up' },
        { event: 'Demo Day', capacity: '30-50 asistentes', deliverables: 'Project showcases, networking, video' },
        { event: 'Meetup Comunitario', capacity: '30-50 asistentes', deliverables: 'Charla técnica, Q&A, intros' },
        { event: 'Blitz (Mini-hack)', capacity: '20-40 builders', deliverables: '4-8hr build session, submissions' },
      ],
    },
    en: {
      columns: [
        { key: 'event', header: 'Event Type' },
        { key: 'capacity', header: 'Capacity' },
        { key: 'deliverables', header: 'Deliverables' },
      ],
      data: [
        { event: 'Technical Workshop', capacity: '15-30 builders', deliverables: 'Hands-on session, recording, leads' },
        { event: 'Local Hackathon', capacity: '50-100 builders', deliverables: 'Mentorship, prizes, post-event follow-up' },
        { event: 'Demo Day', capacity: '30-50 attendees', deliverables: 'Project showcases, networking, video' },
        { event: 'Community Meetup', capacity: '30-50 attendees', deliverables: 'Tech talk, Q&A, intros' },
        { event: 'Blitz (Mini-hack)', capacity: '20-40 builders', deliverables: '4-8hr build session, submissions' },
      ],
    },
  },
  comparison: {
    es: {
      columns: [
        { key: 'aspect', header: 'Aspecto' },
        { key: 'traditional', header: 'Agencia Tradicional' },
        { key: 'frutero', header: 'Frutero' },
      ],
      data: [
        { aspect: 'Ubicación', traditional: 'US/EU based', frutero: 'LATAM nativo' },
        { aspect: 'Idioma', traditional: 'Solo inglés', frutero: 'Bilingüe ES/EN' },
        { aspect: 'Red de builders', traditional: 'Genérica', frutero: '1,000+ LATAM builders' },
        { aspect: 'Retención', traditional: 'No incluida', frutero: 'Core del servicio' },
        { aspect: 'Costo', traditional: '$5K-$20K/mes', frutero: '$3,500/mes' },
        { aspect: 'Resultados', traditional: 'Métricas de vanidad', frutero: 'Proyectos shipeados' },
        { aspect: 'Track record', traditional: 'Variable', frutero: '70%+ éxito hackathon' },
      ],
    },
    en: {
      columns: [
        { key: 'aspect', header: 'Aspect' },
        { key: 'traditional', header: 'Traditional Agency' },
        { key: 'frutero', header: 'Frutero' },
      ],
      data: [
        { aspect: 'Location', traditional: 'US/EU based', frutero: 'LATAM native' },
        { aspect: 'Language', traditional: 'English only', frutero: 'Bilingual ES/EN' },
        { aspect: 'Builder network', traditional: 'Generic', frutero: '1,000+ LATAM builders' },
        { aspect: 'Retention', traditional: 'Not included', frutero: 'Core service' },
        { aspect: 'Cost', traditional: '$5K-$20K/month', frutero: '$3,500/month' },
        { aspect: 'Results', traditional: 'Vanity metrics', frutero: 'Shipped projects' },
        { aspect: 'Track record', traditional: 'Variable', frutero: '70%+ hackathon success' },
      ],
    },
  },
  pricing: {
    es: {
      columns: [
        { key: 'package', header: 'Paquete' },
        { key: 'price', header: 'Precio' },
        { key: 'best', header: 'Mejor Para' },
      ],
      data: [
        { package: 'Retainer Mensual', price: '$3,500/mes', best: 'Engagement continuo de ecosistema' },
        { package: 'Soporte de Evento', price: '$6,000/evento', best: 'Hackathons, conferencias' },
        { package: 'Incubación 3 meses', price: '$8,000', best: 'Pipeline de talento post-hackathon' },
        { package: 'Incubación 6 meses', price: '$15,000', best: 'Partnership de largo plazo' },
        { package: 'Custom Enterprise', price: 'Cotizar', best: 'Necesidades de escala' },
      ],
    },
    en: {
      columns: [
        { key: 'package', header: 'Package' },
        { key: 'price', header: 'Price' },
        { key: 'best', header: 'Best For' },
      ],
      data: [
        { package: 'Monthly Retainer', price: '$3,500/month', best: 'Continuous ecosystem engagement' },
        { package: 'Event Support', price: '$6,000/event', best: 'Hackathons, conferences' },
        { package: 'Incubation 3 months', price: '$8,000', best: 'Post-hackathon talent pipeline' },
        { package: 'Incubation 6 months', price: '$15,000', best: 'Long-term partnership' },
        { package: 'Custom Enterprise', price: 'Quote', best: 'Scale needs' },
      ],
    },
  },
}

function PackageCard({
  name,
  price,
  subtitle,
  features,
  note,
  validated,
  highlight = false,
}: {
  name: string
  price: string
  subtitle: string
  features: string[]
  note: string
  validated?: string
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
        <h3 className="text-lg font-bold">{name}</h3>
        <p className="text-2xl font-bold text-primary">{price}</p>
        <p className="text-sm text-foreground/70">{subtitle}</p>
      </div>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-foreground/60 italic">{note}</p>
      {validated && (
        <p className="text-xs font-medium text-green-600 bg-green-50 rounded-lg p-2 text-center">
          ✓ {validated}
        </p>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title:
      locale === 'es'
        ? 'Frutero DevRel — Servicios y Eventos | Frutero'
        : 'Frutero DevRel — Services and Events | Frutero',
    description:
      locale === 'es'
        ? 'DevRel-as-a-Service para protocolos Web3 — La capa de retención que mantiene a tus builders construyendo'
        : 'DevRel-as-a-Service for Web3 protocols — The retention layer that keeps your builders building',
    openGraph: {
      title: 'Frutero DevRel — Services and Events',
      description:
        locale === 'es'
          ? 'La capa de retención de LATAM para protocolos Web3'
          : 'LATAM\'s retention layer for Web3 protocols',
      type: 'website',
      images: ['/og/frutero-devrel.png'],
    },
  }
}

export default async function DevRelServicesDeckPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = content[locale as 'es' | 'en'] || content.es
  const tables = {
    services: tableData.services[locale as 'es' | 'en'] || tableData.services.es,
    events: tableData.events[locale as 'es' | 'en'] || tableData.events.es,
    comparison: tableData.comparison[locale as 'es' | 'en'] || tableData.comparison.es,
    pricing: tableData.pricing[locale as 'es' | 'en'] || tableData.pricing.es,
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

      {/* The Problem */}
      <DeckSection title={t.problem.title}>
        <div className="text-center space-y-6">
          <p className="text-2xl font-bold text-red-600">{t.problem.headline}</p>
          <p className="max-w-2xl mx-auto text-foreground/80">{t.problem.description}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {t.problem.stats.map((stat, i) => (
              <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stat.value}</p>
                <p className="text-sm text-red-800">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </DeckSection>

      {/* The Solution */}
      <DeckSection title={t.solution.title} variant="highlight">
        <div className="text-center space-y-6">
          <p className="text-xl font-bold text-primary">{t.solution.headline}</p>
          <p className="max-w-2xl mx-auto text-foreground/80">{t.solution.description}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.solution.differentiators.map((diff, i) => (
              <div key={i} className="rounded-lg border border-primary/30 bg-white p-4">
                <p className="font-semibold text-primary">{diff.title}</p>
                <p className="text-sm text-foreground/70">{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </DeckSection>

      {/* Track Record */}
      <DeckSection title={t.trackRecord.title} description={t.trackRecord.subtitle}>
        <DeckStats
          stats={[
            { ...t.stats.builders, icon: Users, accent: 'primary' },
            { ...t.stats.success, icon: Trophy, accent: 'secondary' },
            { ...t.stats.completion, icon: Target, accent: 'primary' },
            { ...t.stats.retention, icon: TrendingUp, accent: 'accent' },
          ]}
          columns={4}
        />
        <div className="mt-6">
          <DeckStats
            stats={[
              { ...t.stats.hackathonWins, icon: Trophy, accent: 'secondary' },
              { ...t.stats.ethdenver, icon: Trophy, accent: 'primary' },
              { ...t.stats.countries, icon: Globe, accent: 'accent' },
              { ...t.stats.mentors, icon: GraduationCap, accent: 'secondary' },
            ]}
            columns={4}
          />
        </div>
      </DeckSection>

      {/* Services */}
      <DeckSection title={t.services.title} description={t.services.description}>
        <DeckTable columns={tables.services.columns} data={tables.services.data} />
      </DeckSection>

      {/* Service Packages */}
      <DeckSection title={t.packages.title}>
        <div className="grid gap-6 lg:grid-cols-3">
          <PackageCard {...t.packages.retainer} highlight />
          <PackageCard {...t.packages.event} />
          <PackageCard {...t.packages.incubation} />
        </div>
      </DeckSection>

      {/* Event Services */}
      <DeckSection title={t.events.title} description={t.events.description}>
        <DeckTable columns={tables.events.columns} data={tables.events.data} />
      </DeckSection>

      {/* Case Study */}
      <DeckSection title={t.caseStudy.title} description={t.caseStudy.description} variant="highlight">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-semibold mb-4">{locale === 'es' ? 'Métricas' : 'Metrics'}</h4>
            <div className="grid grid-cols-2 gap-3">
              {t.caseStudy.metrics.map((metric, i) => (
                <div key={i} className="rounded-lg bg-white border border-border/50 p-3 text-center">
                  <p className="text-xl font-bold text-primary">{metric.value}</p>
                  <p className="text-xs text-foreground/70">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{locale === 'es' ? 'Servicios Entregados' : 'Services Delivered'}</h4>
            <ul className="space-y-2">
              {t.caseStudy.services.map((service, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DeckSection>

      {/* Why Frutero */}
      <DeckSection title={t.whyFrutero.title}>
        <h4 className="font-semibold mb-4 text-center">{t.whyFrutero.comparison.title}</h4>
        <DeckTable columns={tables.comparison.columns} data={tables.comparison.data} />
      </DeckSection>

      {/* Clients */}
      <DeckSection title={t.clients.title}>
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            {t.clients.list.map((client, i) => (
              <span key={i} className="rounded-full bg-primary/10 px-4 py-2 font-medium">
                {client}
              </span>
            ))}
          </div>
          <p className="text-sm text-foreground/60">{t.clients.partners}</p>
        </div>
      </DeckSection>

      {/* Pricing Summary */}
      <DeckSection title={t.pricing.title}>
        <DeckTable columns={tables.pricing.columns} data={tables.pricing.data} />
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

      {/* CTA */}
      <DeckCTA
        title={t.cta.title}
        description={t.cta.description}
        primaryAction={{
          label: t.cta.button,
          href: `mailto:${t.cta.email}?subject=Frutero%20DevRel%20Inquiry`,
        }}
        secondaryAction={{
          label: 'Mel — CEO',
          href: 'mailto:mel@frutero.club?subject=Frutero%20DevRel%20Inquiry',
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
