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
  Sparkles,
  Heart,
  Map,
  Rocket,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  params: Promise<{ locale: string }>
}

const content = {
  es: {
    header: {
      title: 'DevRel Services & Events',
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
      title: 'La Solución',
      headline: 'La capa de retención persistente que mantiene builders shipeando en tu protocolo.',
      description: 'No organizamos eventos — construimos pipelines de talento. Nuestro modelo DevRel-as-a-Service cubre el ciclo de vida completo del builder: desde el primer contacto universitario hasta el shipping de productos en mainnet.',
      differentiators: [
        { icon: '🌎', title: 'Puente Bilingüe', desc: 'Español/Inglés nativo — sin fricción cultural' },
        { icon: '🤝', title: 'Red LATAM Profunda', desc: '1,000+ builders, 15+ países, 17 mentores' },
        { icon: '🏆', title: 'Resultados Probados', desc: '70%+ éxito en hackathons, 32.7% tasa de completación' },
        { icon: '⚡', title: 'Operadores, No Organizadores', desc: 'Programación continua, no eventos únicos' },
      ],
    },
    services: {
      title: 'Servicios DevRel',
      description: 'Menú completo de servicios de desarrollo de ecosistema:',
    },
    packages: {
      title: 'Paquetes de Servicio',
      description: 'Opciones flexibles adaptadas a tus necesidades de ecosistema:',
      retainer: {
        name: 'RETAINER MENSUAL',
        emoji: '📅',
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
      },
      event: {
        name: 'SOPORTE DE EVENTO',
        emoji: '🎯',
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
        name: 'INCUBACIÓN DE BUILDERS',
        emoji: '🚀',
        subtitle: 'Programa Post-Hackathon',
        features: [
          'Programa de 3 o 6 meses',
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
    caseStudies: {
      title: 'Nuestros Programas en Acción',
      description: 'Eventos y programas que hemos ejecutado con éxito:',
      items: [
        {
          name: 'ETH Cinco de Mayo',
          year: '2024 & 2025',
          desc: 'El evento premier de comunidad Ethereum en México. Reunimos builders, fundadores y protocolos para celebrar y construir.',
          highlight: 'Evento insignia de LATAM',
        },
        {
          name: 'Mobil3 Hackathon',
          year: '',
          desc: 'Hackathon enfocado en mobile-first Web3. Los participantes construyeron aplicaciones reales que usuarios pueden usar.',
          highlight: 'Mobile-first Web3',
        },
        {
          name: 'Frutero Jam',
          year: '',
          desc: 'Sesiones intensivas de building donde developers shipean proyectos en tiempo récord con mentoría dedicada.',
          highlight: 'Build sprints intensivos',
        },
        {
          name: 'Verano En Cadena',
          year: '',
          desc: 'Programa de verano on-chain para builders. Formación práctica, mentoría y proyectos reales en protocolos activos.',
          highlight: 'Programa de verano',
        },
        {
          name: 'Founders House',
          year: '',
          desc: 'Residencia para fundadores LATAM. Espacio dedicado para iterar, conectar con mentores y preparar para el mercado global.',
          highlight: 'Residencia de fundadores',
        },
        {
          name: 'Hacker Houses',
          year: '',
          desc: 'Múltiples hacker houses ejecutadas a lo largo de LATAM, creando espacios temporales para building intensivo y networking.',
          highlight: 'Across LATAM',
        },
      ],
    },
    whyDifferent: {
      title: '¿Qué Nos Hace Diferentes?',
      items: [
        { icon: '🌎', title: 'Nativos LATAM', desc: 'Operamos donde está el talento — bilingüe, bicultural, con raíces profundas en la región.' },
        { icon: '🔄', title: 'Retención como Core', desc: 'No solo activamos builders — los mantenemos construyendo con programación continua post-evento.' },
        { icon: '📊', title: 'Proyectos Shipeados, No Vanidad', desc: 'Medimos éxito por lo que se shipea. 70%+ de nuestros builders terminan lo que empiezan.' },
        { icon: '🏗️', title: 'Infraestructura Permanente', desc: 'Casa Frutero en CDMX — un espacio físico dedicado para tu comunidad de builders.' },
        { icon: '🎓', title: 'Pipeline Universitario', desc: 'Relaciones con universidades top de LATAM para reclutamiento temprano de talento.' },
        { icon: '🤝', title: 'Red de Mentores', desc: '17 mentores activos que guían builders desde idea hasta mainnet.' },
      ],
    },
    clients: {
      title: 'Protocolos que Confían en Nosotros',
      description: 'Trabajamos con protocolos Web3 líderes para activar y retener talento en LATAM.',
      partners: 'ETHGlobal • BuidlGuidl • Universidades LATAM',
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
      description: 'Cada hackathon sin retención post-evento es dinero quemado. Somos la capa persistente que convierte activaciones en ecosistema.',
      button: 'Agendar Llamada',
      email: 'ian@frutero.club',
    },
    footer: {
      quote: '"Gastas en activación. Nosotros entregamos retención. Tus builders shipean."',
      tagline: 'DevRel Services — La Capa de Retención de LATAM',
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
      title: 'DevRel Services & Events',
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
      title: 'The Solution',
      headline: 'The persistent retention layer that keeps builders shipping on your protocol.',
      description: 'We don\'t organize events — we build talent pipelines. Our DevRel-as-a-Service model covers the full builder lifecycle: from first university contact to mainnet product shipping.',
      differentiators: [
        { icon: '🌎', title: 'Bilingual Bridge', desc: 'Native Spanish/English — zero cultural friction' },
        { icon: '🤝', title: 'Deep LATAM Network', desc: '1,000+ builders, 15+ countries, 17 mentors' },
        { icon: '🏆', title: 'Proven Results', desc: '70%+ hackathon success, 32.7% completion rate' },
        { icon: '⚡', title: 'Operators, Not Organizers', desc: 'Continuous programming, not one-off events' },
      ],
    },
    services: {
      title: 'DevRel Services',
      description: 'Full menu of ecosystem development services:',
    },
    packages: {
      title: 'Service Packages',
      description: 'Flexible options tailored to your ecosystem needs:',
      retainer: {
        name: 'MONTHLY RETAINER',
        emoji: '📅',
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
      },
      event: {
        name: 'EVENT SUPPORT',
        emoji: '🎯',
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
        name: 'BUILDER INCUBATION',
        emoji: '🚀',
        subtitle: 'Post-Hackathon Program',
        features: [
          '3-month or 6-month program',
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
    caseStudies: {
      title: 'Our Programs in Action',
      description: 'Events and programs we\'ve successfully executed:',
      items: [
        {
          name: 'ETH Cinco de Mayo',
          year: '2024 & 2025',
          desc: 'Mexico\'s premier Ethereum community event. Bringing together builders, founders, and protocols to celebrate and build.',
          highlight: 'LATAM\'s flagship event',
        },
        {
          name: 'Mobil3 Hackathon',
          year: '',
          desc: 'Mobile-first Web3 hackathon. Participants built real applications that users can actually use.',
          highlight: 'Mobile-first Web3',
        },
        {
          name: 'Frutero Jam',
          year: '',
          desc: 'Intensive building sessions where developers ship projects in record time with dedicated mentorship.',
          highlight: 'Intensive build sprints',
        },
        {
          name: 'Verano En Cadena',
          year: '',
          desc: 'Summer on-chain program for builders. Practical training, mentorship, and real projects on active protocols.',
          highlight: 'Summer program',
        },
        {
          name: 'Founders House',
          year: '',
          desc: 'Residency for LATAM founders. Dedicated space to iterate, connect with mentors, and prepare for the global market.',
          highlight: 'Founder residency',
        },
        {
          name: 'Hacker Houses',
          year: '',
          desc: 'Multiple hacker houses executed across LATAM, creating temporary spaces for intensive building and networking.',
          highlight: 'Across LATAM',
        },
      ],
    },
    whyDifferent: {
      title: 'What Makes Us Different',
      items: [
        { icon: '🌎', title: 'LATAM Native', desc: 'We operate where the talent is — bilingual, bicultural, with deep roots in the region.' },
        { icon: '🔄', title: 'Retention as Core', desc: 'We don\'t just activate builders — we keep them building with continuous post-event programming.' },
        { icon: '📊', title: 'Shipped Projects, Not Vanity', desc: 'We measure success by what ships. 70%+ of our builders finish what they start.' },
        { icon: '🏗️', title: 'Permanent Infrastructure', desc: 'Casa Frutero in CDMX — a dedicated physical space for your builder community.' },
        { icon: '🎓', title: 'University Pipeline', desc: 'Relationships with top LATAM universities for early talent recruitment.' },
        { icon: '🤝', title: 'Mentor Network', desc: '17 active mentors guiding builders from idea to mainnet.' },
      ],
    },
    clients: {
      title: 'Trusted by Leading Web3 Protocols',
      description: 'We work with leading Web3 protocols to activate and retain talent across LATAM.',
      partners: 'ETHGlobal • BuidlGuidl • LATAM Universities',
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
      description: 'Every hackathon without post-event retention is burned money. We are the persistent layer that converts activations into ecosystem.',
      button: 'Schedule a Call',
      email: 'ian@frutero.club',
    },
    footer: {
      quote: '"You spend on activation. We deliver retention. Your builders ship."',
      tagline: 'DevRel Services — LATAM\'s Retention Layer',
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
}

function PackageCard({
  name,
  emoji,
  subtitle,
  features,
  note,
  highlight = false,
}: {
  name: string
  emoji: string
  subtitle: string
  features: string[]
  note: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 space-y-4 shadow-lg transition-transform hover:scale-[1.02]',
        highlight
          ? 'border-2 border-primary bg-primary/5 ring-2 ring-primary/10'
          : 'border-2 border-primary/20 bg-background/80'
      )}
    >
      <div className="text-center space-y-1">
        <span className="text-3xl">{emoji}</span>
        <h3 className="font-funnel text-lg font-bold tracking-wide text-foreground">{name}</h3>
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
      <p className="text-xs text-foreground/60 italic border-t border-primary/10 pt-3">{note}</p>
    </div>
  )
}

function CaseStudyCard({
  name,
  year,
  desc,
  highlight,
}: {
  name: string
  year: string
  desc: string
  highlight: string
}) {
  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-background/80 p-5 shadow-md space-y-3 transition-transform hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-funnel text-lg font-bold text-foreground">
          {name} {year && <span className="text-primary">{year}</span>}
        </h4>
      </div>
      <span className="inline-block rounded-full border-2 border-primary bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
        {highlight}
      </span>
      <p className="text-sm text-foreground/70">{desc}</p>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title:
      locale === 'es'
        ? 'DevRel Services & Events | Frutero'
        : 'DevRel Services & Events | Frutero',
    description:
      locale === 'es'
        ? 'DevRel-as-a-Service para protocolos Web3 — La capa de retención que mantiene a tus builders construyendo'
        : 'DevRel-as-a-Service for Web3 protocols — The retention layer that keeps your builders building',
    openGraph: {
      title: 'DevRel Services & Events',
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
          <p className="font-funnel text-2xl font-bold text-secondary">{t.problem.headline}</p>
          <p className="max-w-2xl mx-auto text-foreground/80">{t.problem.description}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {t.problem.stats.map((stat, i) => (
              <div key={i} className="rounded-2xl border-2 border-secondary/30 bg-secondary/5 p-4 text-center shadow-md">
                <p className="font-funnel text-2xl font-bold text-secondary">{stat.value}</p>
                <p className="text-sm text-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </DeckSection>

      {/* The Solution */}
      <DeckSection title={t.solution.title} variant="highlight">
        <div className="text-center space-y-6">
          <p className="font-funnel text-xl font-bold text-primary">{t.solution.headline}</p>
          <p className="max-w-2xl mx-auto text-foreground/80">{t.solution.description}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.solution.differentiators.map((diff, i) => (
              <div key={i} className="rounded-2xl border-2 border-primary/20 bg-background/80 p-5 shadow-md">
                <span className="text-2xl">{diff.icon}</span>
                <p className="font-funnel font-semibold text-foreground mt-2">{diff.title}</p>
                <p className="text-sm text-foreground/70 mt-1">{diff.desc}</p>
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

      {/* Case Studies — Real Programs */}
      <DeckSection title={t.caseStudies.title} description={t.caseStudies.description} variant="highlight">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.caseStudies.items.map((item, i) => (
            <CaseStudyCard key={i} {...item} />
          ))}
        </div>
      </DeckSection>

      {/* Services */}
      <DeckSection title={t.services.title} description={t.services.description}>
        <DeckTable columns={tables.services.columns} data={tables.services.data} />
      </DeckSection>

      {/* Service Packages */}
      <DeckSection title={t.packages.title} description={t.packages.description}>
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

      {/* What Makes Us Different */}
      <DeckSection title={t.whyDifferent.title}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.whyDifferent.items.map((item, i) => (
            <div key={i} className="rounded-2xl border-2 border-primary/20 bg-background/80 p-5 shadow-md space-y-2">
              <span className="text-2xl">{item.icon}</span>
              <h4 className="font-funnel font-bold text-foreground">{item.title}</h4>
              <p className="text-sm text-foreground/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </DeckSection>

      {/* Clients */}
      <DeckSection title={t.clients.title}>
        <div className="text-center space-y-4">
          <p className="text-foreground/70 max-w-2xl mx-auto">{t.clients.description}</p>
          <p className="text-sm text-foreground/60">{t.clients.partners}</p>
        </div>
      </DeckSection>

      {/* Next Steps */}
      <DeckSection title={t.nextSteps.title}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.nextSteps.steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-5 rounded-2xl border-2 border-primary/20 bg-background/80 shadow-md">
              <span className="font-funnel text-3xl font-bold text-primary mb-2">{step.num}</span>
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
          href: 'https://cal.com/troopdegen/lets-build-together?duration=20&overlayCalendar=true',
        }}
      />

      {/* Footer */}
      <footer className="space-y-4 text-center text-foreground/60">
        <p className="italic">{t.footer.quote}</p>
        <div>
          <p className="font-funnel text-lg font-bold text-foreground">{t.footer.tagline}</p>
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
