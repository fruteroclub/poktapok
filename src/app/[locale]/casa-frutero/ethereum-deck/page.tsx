import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
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
  GraduationCap,
  Calendar,
  Target,
} from 'lucide-react'

type Props = {
  params: Promise<{ locale: string }>
}

const content = {
  es: {
    header: {
      title: 'Casa Frutero',
      subtitle:
        'El Primer Hub Permanente de Comunidad Ethereum en México — Una Iniciativa de Frutero',
    },
    opportunity: {
      title: 'La Oportunidad',
      description:
        'Ciudad de México es la metrópolis más grande de Latinoamérica (21M+ personas) y un hub tecnológico en crecimiento — pero no existe un ancla física permanente para Ethereum.',
      problems: [
        'Desarrolladores trabajan en aislamiento',
        'Equipos empresariales carecen de experiencia local en Ethereum',
        'Fundadores no tienen un camino sistemático hacia el ecosistema global',
      ],
      solution:
        'Casa Frutero es una nueva iniciativa de Frutero para establecer el primer Hub Permanente de Comunidad Ethereum en México — un espacio dedicado donde desarrolladores, fundadores y empresas conectan con Ethereum.',
      invite:
        'Invitamos a la Ethereum Foundation a ser el socio fundador — el primero en dar forma a este espacio con la visión y valores de Ethereum.',
    },
    alignment: {
      title: 'Alineación con Prioridades de EF Ecodev',
      description:
        'Casa Frutero apoya directamente los objetivos de desarrollo del ecosistema de la Ethereum Foundation:',
    },
    whoIsFrutero: {
      title: '¿Quién es Frutero?',
      description:
        'Frutero es una organización basada en LATAM enfocada en desarrollar el ecosistema tecnológico de la región conectando talento local con oportunidades globales. Desde 2022, hemos construido programas sistemáticos, infraestructura de mentoría y operaciones comunitarias que convierten curiosos en contribuidores activos.',
      qualifications: [
        { title: 'Operadores, no organizadores', desc: 'Programación continua, no eventos únicos' },
        { title: 'Enfocados en resultados', desc: 'Éxito medido por lo que los builders shipean' },
        { title: 'Financieramente sostenibles', desc: 'Frutero genera ingresos a través de servicios' },
        { title: 'Experiencia regional', desc: 'Conocimiento profundo del mercado LATAM' },
        { title: 'Valores alineados con Ethereum', desc: 'Permissionless, bienes públicos, descentralización' },
      ],
      cta: 'Frutero tiene los recursos y la red para lanzar Casa Frutero. Buscamos un socio fundador para darle forma como un espacio Ethereum-first.',
    },
    trackRecord: {
      title: 'Track Record de Frutero',
    },
    hub: {
      title: 'El Hub',
      location: 'Insurgentes Sur 1877, Guadalupe Inn, Ciudad de México',
      strategic: [
        'Distrito profesional con oficinas corporativas cercanas (Enterprise Acceleration)',
        '5 min del Metro Barranca del Muerto (accesibilidad)',
        'Cerca de universidades: UNAM, ITESM campus (pipeline de talento)',
      ],
      status: {
        title: 'Estado',
        items: [
          'Espacio asegurado y equipado',
          'Equipo Frutero listo para operar',
          'Esperando socio fundador',
        ],
      },
    },
    programming: {
      title: 'Programación del Hub (Alineación Ecodev)',
      note: 'Toda la programación es de acceso abierto. Sin cuotas de membresía. Permissionless.',
    },
    partnerOpportunity: {
      title: 'La Oportunidad de Socio Fundador',
      description:
        'Ofrecemos a la Ethereum Foundation el privilegio de ser el socio fundador de Casa Frutero — dando forma al primer Hub Permanente oficial de Ethereum en México.',
    },
    request: {
      title: 'Solicitud de Partnership',
      ask: 'Solicitud: $3,500 USD/mes por 6 meses = $21,000 total',
      beyond: {
        title: 'Más Allá del Financiamiento',
        items: [
          'Reconocimiento oficial como el primer Hub Permanente de Ethereum en México',
          'Integración a la red Ethereum Everywhere',
          'Recursos educativos de EF para entrega local',
          'Amplificación a través de canales EF',
          'Mejores prácticas de los hubs de SF, Berlin, London',
        ],
      },
    },
    requirements: {
      title: 'Por Qué Frutero es el Operador Correcto',
    },
    team: {
      title: 'Equipo',
      members: [
        { name: 'Mel', role: 'CEO & Founder', desc: '3+ años construyendo ecosistema LATAM' },
        { name: 'Valentín', role: 'COO', desc: 'Operaciones, sistemas financieros' },
        { name: 'K7', role: 'CPO', desc: 'Estrategia de producto, arquitectura técnica' },
      ],
      plus: '+ 6 miembros del equipo en comunidad, DevRel, contenido, técnico',
    },
    cta: {
      title: 'Siguiente Paso',
      description:
        'Invitamos a la Ethereum Foundation a ser el socio fundador del primer Hub Permanente de Comunidad Ethereum en México.',
      button: 'Agendar Llamada',
      email: 'mel@frutero.club',
    },
    footer: {
      quote:
        '"La infraestructura no estaba aquí. Construimos la organización. Ahora estamos construyendo el hogar — con Ethereum en el centro."',
      tagline: 'Casa Frutero — El Primer Hub Permanente de Ethereum en México',
      built: 'Construido por Frutero. Formado por Ethereum.',
    },
    stats: {
      community: {
        developers: { value: '1,000+', label: 'Desarrolladores' },
        countries: { value: '15+', label: 'Países' },
        mentors: { value: '17', label: 'Mentores Activos' },
      },
      outcomes: {
        hackathonWins: { value: '25+', label: 'Victorias en Hackathons' },
        ethdenver: { value: '6', label: 'Ganadores ETHDenver 2025' },
        completion: { value: '32.7%', label: 'Tasa de Completación' },
        success: { value: '70%+', label: 'Éxito en Hackathons' },
      },
      operational: {
        years: { value: '3+', label: 'Años de Programación' },
        programs: { value: '10+', label: 'Programas Ejecutados' },
        sessions: { value: '100+', label: 'Sesiones Semanales' },
      },
    },
    hubCapacity: {
      workstations: { value: '25', label: 'Estaciones de trabajo diarias' },
      events: { value: '50', label: 'Capacidad para eventos' },
    },
  },
  en: {
    header: {
      title: 'Casa Frutero',
      subtitle:
        'The First Ethereum Permanent Community Hub in Mexico — An Initiative by Frutero',
    },
    opportunity: {
      title: 'The Opportunity',
      description:
        'Mexico City is Latin America\'s largest metro (21M+ people) and a growing tech hub — but no permanent physical anchor for Ethereum exists.',
      problems: [
        'Developers work in isolation',
        'Enterprise teams lack local Ethereum expertise',
        'Founders have no systematic pathway to the global ecosystem',
      ],
      solution:
        'Casa Frutero is a new initiative by Frutero to establish Mexico\'s first Ethereum Permanent Community Hub — a dedicated space where developers, founders, and enterprises connect with Ethereum.',
      invite:
        'We\'re inviting the Ethereum Foundation to be the founding partner — the first to shape this space with Ethereum\'s vision and values.',
    },
    alignment: {
      title: 'Alignment with EF Ecodev Priorities',
      description:
        'Casa Frutero directly supports the Ethereum Foundation\'s ecosystem development goals:',
    },
    whoIsFrutero: {
      title: 'Who is Frutero?',
      description:
        'Frutero is a LATAM-based organization focused on developing the region\'s technology ecosystem by connecting local talent with global opportunities. Since 2022, we\'ve built systematic programs, mentorship infrastructure, and community operations that turn curious learners into active contributors.',
      qualifications: [
        { title: 'Operators, not organizers', desc: 'Continuous programming, not one-off events' },
        { title: 'Outcome-focused', desc: 'Success measured by what builders ship' },
        { title: 'Financially sustainable', desc: 'Frutero generates revenue through services' },
        { title: 'Regional expertise', desc: 'Deep LATAM market knowledge' },
        { title: 'Ethereum-aligned values', desc: 'Permissionless, public goods, decentralization' },
      ],
      cta: 'Frutero has the resources and network to launch Casa Frutero. We\'re seeking a founding partner to shape it as an Ethereum-first space.',
    },
    trackRecord: {
      title: 'Frutero\'s Track Record',
    },
    hub: {
      title: 'The Hub',
      location: 'Insurgentes Sur 1877, Guadalupe Inn, Mexico City',
      strategic: [
        'Professional district with corporate offices nearby (Enterprise Acceleration)',
        '5 min from Metro Barranca del Muerto (accessibility)',
        'Near universities: UNAM, ITESM campus (talent pipeline)',
      ],
      status: {
        title: 'Status',
        items: [
          'Space secured and equipped',
          'Frutero team ready to operate',
          'Awaiting founding partner',
        ],
      },
    },
    programming: {
      title: 'Hub Programming (Ecodev Alignment)',
      note: 'All programming is open access. No membership fees. Permissionless.',
    },
    partnerOpportunity: {
      title: 'The Founding Partner Opportunity',
      description:
        'We\'re offering the Ethereum Foundation the privilege to be Casa Frutero\'s founding partner — shaping Mexico\'s first official Ethereum Permanent Hub.',
    },
    request: {
      title: 'Partnership Request',
      ask: 'Ask: $3,500 USD/month for 6 months = $21,000 total',
      beyond: {
        title: 'Beyond Funding',
        items: [
          'Official recognition as Mexico\'s first Ethereum Permanent Hub',
          'Ethereum Everywhere network integration',
          'EF educational resources for local delivery',
          'Amplification through EF channels',
          'Best practices from SF, Berlin, London hubs',
        ],
      },
    },
    requirements: {
      title: 'Why Frutero is the Right Operator',
    },
    team: {
      title: 'Team',
      members: [
        { name: 'Mel', role: 'CEO & Founder', desc: '3+ years LATAM ecosystem building' },
        { name: 'Valentín', role: 'COO', desc: 'Operations, financial systems' },
        { name: 'K7', role: 'CPO', desc: 'Product strategy, technical architecture' },
      ],
      plus: '+ 6 team members across community, DevRel, content, technical',
    },
    cta: {
      title: 'Next Step',
      description:
        'We invite the Ethereum Foundation to be the founding partner of Mexico\'s first Ethereum Permanent Community Hub.',
      button: 'Schedule a Call',
      email: 'mel@frutero.club',
    },
    footer: {
      quote:
        '"The infrastructure wasn\'t here. We built the organization. Now we\'re building the home — with Ethereum at the center."',
      tagline: 'Casa Frutero — Mexico\'s First Ethereum Permanent Hub',
      built: 'Built by Frutero. Shaped by Ethereum.',
    },
    stats: {
      community: {
        developers: { value: '1,000+', label: 'Developers' },
        countries: { value: '15+', label: 'Countries' },
        mentors: { value: '17', label: 'Active Mentors' },
      },
      outcomes: {
        hackathonWins: { value: '25+', label: 'Hackathon Victories' },
        ethdenver: { value: '6', label: 'ETHDenver 2025 Winners' },
        completion: { value: '32.7%', label: 'Completion Rate' },
        success: { value: '70%+', label: 'Hackathon Success' },
      },
      operational: {
        years: { value: '3+', label: 'Years of Programming' },
        programs: { value: '10+', label: 'Programs Executed' },
        sessions: { value: '100+', label: 'Weekly Sessions' },
      },
    },
    hubCapacity: {
      workstations: { value: '25', label: 'Daily Workstations' },
      events: { value: '50', label: 'Event Capacity' },
    },
  },
}

// Table data - bilingual
const tableData = {
  ecodevAlignment: {
    es: {
      columns: [
        { key: 'priority', header: 'Prioridad EF' },
        { key: 'delivery', header: 'Casa Frutero Entrega' },
      ],
      data: [
        {
          priority: 'dev/acc',
          delivery:
            'Coworking semanal crea ancla física para crecimiento de desarrolladores. Touchpoints consistentes aceleran desarrollo de habilidades.',
        },
        {
          priority: 'App Relations',
          delivery:
            'Demo days y showcases de proyectos exponen aplicaciones LATAM al ecosistema global.',
        },
        {
          priority: 'Founder Success',
          delivery:
            'Pipeline sistemático: prep hackathon → mentoría → incubación. Nuestros programas produjeron 6 ganadores de ETHDenver 2025.',
        },
        {
          priority: 'Enterprise Acceleration',
          delivery:
            'Ubicación en distrito profesional (Insurgentes Sur) atrae equipos corporativos. Programas de training onboardean empresas a Ethereum.',
        },
      ],
    },
    en: {
      columns: [
        { key: 'priority', header: 'EF Priority' },
        { key: 'delivery', header: 'Casa Frutero Delivers' },
      ],
      data: [
        {
          priority: 'dev/acc',
          delivery:
            'Weekly coworking creates physical anchor for developer growth. Consistent touchpoints accelerate skill development.',
        },
        {
          priority: 'App Relations',
          delivery:
            'Demo days and project showcases surface LATAM applications to the global ecosystem.',
        },
        {
          priority: 'Founder Success',
          delivery:
            'Systematic pipeline: hackathon prep → mentorship → incubation. Our programs produced 6 ETHDenver 2025 winners.',
        },
        {
          priority: 'Enterprise Acceleration',
          delivery:
            'Location in professional district (Insurgentes Sur) attracts corporate teams. Training programs onboard enterprises to Ethereum.',
        },
      ],
    },
  },
  amplification: {
    es: {
      columns: [
        { key: 'goal', header: 'Meta' },
        { key: 'delivery', header: 'Cómo Entregamos' },
      ],
      data: [
        { goal: 'Presencia física', delivery: 'Primer espacio permanente de Ethereum en México y Centroamérica' },
        { goal: 'Ancla del ecosistema local', delivery: 'Programación semanal crea touchpoint consistente de comunidad' },
        { goal: 'Puente a red global', delivery: 'Conectamos builders LATAM con el ecosistema global de Ethereum' },
        { goal: 'Educación & onboarding', delivery: 'Outreach universitario, workshops para principiantes, pathways de desarrollo' },
      ],
    },
    en: {
      columns: [
        { key: 'goal', header: 'Goal' },
        { key: 'delivery', header: 'How We Deliver' },
      ],
      data: [
        { goal: 'Physical presence', delivery: 'First permanent Ethereum space in Mexico and Central America' },
        { goal: 'Local ecosystem anchor', delivery: 'Weekly programming creates consistent community touchpoint' },
        { goal: 'Bridge to global network', delivery: 'Connect LATAM builders with global Ethereum ecosystem' },
        { goal: 'Education & onboarding', delivery: 'University outreach, beginner workshops, developer pathways' },
      ],
    },
  },
  programming: {
    es: {
      columns: [
        { key: 'activity', header: 'Actividad' },
        { key: 'frequency', header: 'Frecuencia' },
        { key: 'goal', header: 'Meta EF Apoyada' },
      ],
      data: [
        { activity: 'Open Coworking', frequency: 'Semanal', goal: 'dev/acc — crecimiento de desarrolladores' },
        { activity: 'Workshops Técnicos', frequency: '4-6/mes', goal: 'Educación, Protocolo' },
        { activity: 'Demo Days', frequency: 'Mensual', goal: 'App Relations — exponer proyectos' },
        { activity: 'Founder Office Hours', frequency: 'Semanal', goal: 'Founder Success' },
        { activity: 'Enterprise Training', frequency: '2/mes', goal: 'Enterprise Acceleration' },
        { activity: 'University Outreach', frequency: 'Mensual', goal: 'Onboarding, pipeline de talento' },
        { activity: 'Node Workshops', frequency: 'Trimestral', goal: 'Protocolo, descentralización' },
        { activity: 'Sesiones Privacy/ZK', frequency: 'Según agenda', goal: 'Alineación PSE' },
      ],
    },
    en: {
      columns: [
        { key: 'activity', header: 'Activity' },
        { key: 'frequency', header: 'Frequency' },
        { key: 'goal', header: 'EF Goal Supported' },
      ],
      data: [
        { activity: 'Open Coworking', frequency: 'Weekly', goal: 'dev/acc — developer growth' },
        { activity: 'Technical Workshops', frequency: '4-6/month', goal: 'Education, Protocol' },
        { activity: 'Demo Days', frequency: 'Monthly', goal: 'App Relations — surface projects' },
        { activity: 'Founder Office Hours', frequency: 'Weekly', goal: 'Founder Success' },
        { activity: 'Enterprise Training', frequency: '2/month', goal: 'Enterprise Acceleration' },
        { activity: 'University Outreach', frequency: 'Monthly', goal: 'Onboarding, talent pipeline' },
        { activity: 'Node Workshops', frequency: 'Quarterly', goal: 'Protocol, decentralization' },
        { activity: 'Privacy/ZK Sessions', frequency: 'As scheduled', goal: 'PSE alignment' },
      ],
    },
  },
  partnerBenefits: {
    es: {
      columns: [
        { key: 'benefit', header: 'Beneficio' },
        { key: 'description', header: 'Descripción' },
      ],
      data: [
        { benefit: 'First-mover', description: 'Primer Hub Permanente de Ethereum en México/Centroamérica' },
        { benefit: 'Input en programación', description: 'Dar forma al currículum y prioridades de eventos' },
        { benefit: 'Resultados Ecodev', description: 'Apoyo directo a dev/acc, App Relations, Founder Success' },
        { benefit: 'Acceso Enterprise', description: 'Venue de training corporativo en mercado clave LATAM' },
        { benefit: 'Presencia de marca', description: 'Branding de Ethereum en todo el espacio' },
        { benefit: 'Reporteo de impacto', description: 'Métricas regulares alineadas con metas EF' },
      ],
    },
    en: {
      columns: [
        { key: 'benefit', header: 'Benefit' },
        { key: 'description', header: 'Description' },
      ],
      data: [
        { benefit: 'First-mover', description: 'First Ethereum Permanent Hub in Mexico/Central America' },
        { benefit: 'Programming input', description: 'Shape curriculum and event priorities' },
        { benefit: 'Ecodev outcomes', description: 'Direct support for dev/acc, App Relations, Founder Success' },
        { benefit: 'Enterprise access', description: 'Corporate training venue in key LATAM market' },
        { benefit: 'Brand presence', description: 'Ethereum branding throughout space' },
        { benefit: 'Impact reporting', description: 'Regular metrics aligned with EF goals' },
      ],
    },
  },
  fruteroProvides: {
    es: {
      columns: [
        { key: 'contribution', header: 'Contribución' },
        { key: 'description', header: 'Descripción' },
      ],
      data: [
        { contribution: 'Operaciones', description: 'Equipo completo para gestión diaria del hub' },
        { contribution: 'Red', description: '1,000+ builders, 17 mentores, relaciones universitarias' },
        { contribution: 'Metodología', description: '3+ años de ejecución probada de programas' },
        { contribution: 'Espacio', description: 'Venue completamente equipado' },
        { contribution: 'Expertise local', description: 'Conocimiento del mercado LATAM' },
      ],
    },
    en: {
      columns: [
        { key: 'contribution', header: 'Contribution' },
        { key: 'description', header: 'Description' },
      ],
      data: [
        { contribution: 'Operations', description: 'Full team for daily hub management' },
        { contribution: 'Network', description: '1,000+ builders, 17 mentors, university relationships' },
        { contribution: 'Methodology', description: '3+ years proven program execution' },
        { contribution: 'Space', description: 'Fully equipped venue' },
        { contribution: 'Local expertise', description: 'LATAM market knowledge' },
      ],
    },
  },
  budget: {
    es: {
      columns: [
        { key: 'category', header: 'Categoría' },
        { key: 'monthly', header: 'Mensual' },
        { key: 'goal', header: 'Meta EF' },
      ],
      data: [
        { category: 'Programación Ethereum', monthly: '$1,500', goal: 'dev/acc, Protocolo' },
        { category: 'Materiales Educativos', monthly: '$800', goal: 'Onboarding, Educación' },
        { category: 'Community Outreach', monthly: '$700', goal: 'Amplificación del Ecosistema' },
        { category: 'Tools & Operaciones', monthly: '$300', goal: 'Sostenibilidad' },
        { category: 'Contingencia', monthly: '$200', goal: '—' },
        { category: 'Total', monthly: '$3,500', goal: '' },
      ],
    },
    en: {
      columns: [
        { key: 'category', header: 'Category' },
        { key: 'monthly', header: 'Monthly' },
        { key: 'goal', header: 'EF Goal' },
      ],
      data: [
        { category: 'Ethereum Programming', monthly: '$1,500', goal: 'dev/acc, Protocol' },
        { category: 'Educational Materials', monthly: '$800', goal: 'Onboarding, Education' },
        { category: 'Community Outreach', monthly: '$700', goal: 'Ecosystem Amplification' },
        { category: 'Tools & Operations', monthly: '$300', goal: 'Sustainability' },
        { category: 'Contingency', monthly: '$200', goal: '—' },
        { category: 'Total', monthly: '$3,500', goal: '' },
      ],
    },
  },
  requirements: {
    es: {
      columns: [
        { key: 'requirement', header: 'Requerimiento EF' },
        { key: 'answer', header: 'Respuesta de Frutero' },
      ],
      data: [
        { requirement: 'Misión alineada con valores Ethereum', answer: '✓ Permissionless, bienes públicos, descentralización' },
        { requirement: 'Presupuesto transparente, plan de sostenibilidad', answer: '✓ Frutero es financieramente sostenible' },
        { requirement: 'Acceso abierto (sin paywalls)', answer: '✓ Toda la programación gratuita y abierta' },
        { requirement: 'Plan de gestión sostenible', answer: '✓ Equipo experimentado, operaciones probadas' },
        { requirement: 'Reporteo regular de impacto', answer: '✓ Trackeamos y publicamos resultados' },
        { requirement: 'Ubicación segura y accesible', answer: '✓ Distrito profesional, acceso a metro' },
        { requirement: 'Colaboración con orgs locales', answer: '✓ Universidades, Ethereum México, LaDAO' },
      ],
    },
    en: {
      columns: [
        { key: 'requirement', header: 'EF Hard Requirement' },
        { key: 'answer', header: 'Frutero\'s Answer' },
      ],
      data: [
        { requirement: 'Clear mission aligned with Ethereum values', answer: '✓ Permissionless, public goods, decentralization' },
        { requirement: 'Transparent budget, sustainability plan', answer: '✓ Frutero is financially sustainable' },
        { requirement: 'Open access (no paywalls)', answer: '✓ All programming free and open' },
        { requirement: 'Sustainable management plan', answer: '✓ Experienced team, proven operations' },
        { requirement: 'Regular impact reporting', answer: '✓ We track and publish outcomes' },
        { requirement: 'Safe, accessible location', answer: '✓ Professional district, metro access' },
        { requirement: 'Collaboration with local orgs', answer: '✓ Universities, Ethereum México, LaDAO' },
      ],
    },
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title:
      locale === 'es'
        ? 'Casa Frutero — Ethereum Deck | Frutero'
        : 'Casa Frutero — Ethereum Deck | Frutero',
    description:
      locale === 'es'
        ? 'El primer hub permanente de comunidad Ethereum en México — Una propuesta de partnership con Ethereum Foundation'
        : 'The first permanent Ethereum community hub in Mexico — A partnership proposal with Ethereum Foundation',
    openGraph: {
      title: 'Casa Frutero — Ethereum Foundation Partnership',
      description:
        locale === 'es'
          ? 'El primer hub permanente de comunidad Ethereum en México'
          : 'The first permanent Ethereum community hub in Mexico',
      type: 'website',
      images: ['/og/casa-frutero-ethereum.png'],
    },
  }
}

export default async function EthereumDeckPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = content[locale as 'es' | 'en'] || content.es
  const tables = {
    ecodevAlignment: tableData.ecodevAlignment[locale as 'es' | 'en'] || tableData.ecodevAlignment.es,
    amplification: tableData.amplification[locale as 'es' | 'en'] || tableData.amplification.es,
    programming: tableData.programming[locale as 'es' | 'en'] || tableData.programming.es,
    partnerBenefits: tableData.partnerBenefits[locale as 'es' | 'en'] || tableData.partnerBenefits.es,
    fruteroProvides: tableData.fruteroProvides[locale as 'es' | 'en'] || tableData.fruteroProvides.es,
    budget: tableData.budget[locale as 'es' | 'en'] || tableData.budget.es,
    requirements: tableData.requirements[locale as 'es' | 'en'] || tableData.requirements.es,
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
        <ul className="mb-6 list-inside list-disc space-y-2 text-foreground/80">
          {t.opportunity.problems.map((problem, i) => (
            <li key={i}>{problem}</li>
          ))}
        </ul>
        <p className="mb-4 text-lg font-medium">{t.opportunity.solution}</p>
        <p className="rounded-lg bg-primary/10 p-4 text-primary font-medium">
          {t.opportunity.invite}
        </p>
      </DeckSection>

      {/* Alignment with EF Ecodev */}
      <DeckSection title={t.alignment.title} description={t.alignment.description}>
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-xl font-semibold">
              {locale === 'es' ? 'Aceleración del Ecosistema' : 'Ecosystem Acceleration'}
            </h3>
            <DeckTable columns={tables.ecodevAlignment.columns} data={tables.ecodevAlignment.data} />
          </div>
          <div>
            <h3 className="mb-4 text-xl font-semibold">
              {locale === 'es' ? 'Amplificación del Ecosistema (Ethereum Everywhere)' : 'Ecosystem Amplification (Ethereum Everywhere)'}
            </h3>
            <DeckTable columns={tables.amplification.columns} data={tables.amplification.data} />
          </div>
        </div>
      </DeckSection>

      {/* Who is Frutero? */}
      <DeckSection title={t.whoIsFrutero.title} description={t.whoIsFrutero.description}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {locale === 'es' ? 'Lo que nos califica para operar un Ethereum Hub:' : 'What makes us qualified to run an Ethereum Hub:'}
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {t.whoIsFrutero.qualifications.map((q, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg border border-border/50 p-3">
                <span className="mt-0.5 text-primary">✓</span>
                <div>
                  <span className="font-medium">{q.title}</span>
                  <span className="text-foreground/70"> — {q.desc}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-medium text-primary">{t.whoIsFrutero.cta}</p>
        </div>
      </DeckSection>

      {/* Track Record */}
      <DeckSection title={t.trackRecord.title}>
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground/80">
              {locale === 'es' ? 'Escala de Comunidad' : 'Community Scale'}
            </h3>
            <DeckStats
              stats={[
                { ...t.stats.community.developers, icon: Users, accent: 'primary' },
                { ...t.stats.community.countries, icon: Globe, accent: 'secondary' },
                { ...t.stats.community.mentors, icon: GraduationCap, accent: 'accent' },
              ]}
              columns={3}
            />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground/80">
              {locale === 'es' ? 'Resultados de Programas' : 'Program Outcomes'}
            </h3>
            <DeckStats
              stats={[
                { ...t.stats.outcomes.hackathonWins, icon: Trophy, accent: 'primary' },
                { ...t.stats.outcomes.ethdenver, icon: Trophy, accent: 'secondary' },
                { ...t.stats.outcomes.completion, icon: Target, accent: 'primary' },
                { ...t.stats.outcomes.success, icon: Target, accent: 'accent' },
              ]}
              columns={4}
            />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground/80">
              {locale === 'es' ? 'Experiencia Operativa' : 'Operational Experience'}
            </h3>
            <DeckStats
              stats={[
                { ...t.stats.operational.years, icon: Calendar, accent: 'primary' },
                { ...t.stats.operational.programs, icon: Calendar, accent: 'secondary' },
                { ...t.stats.operational.sessions, icon: Calendar, accent: 'accent' },
              ]}
              columns={3}
            />
          </div>
        </div>
      </DeckSection>

      {/* The Hub */}
      <DeckSection title={t.hub.title}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{locale === 'es' ? 'Ubicación' : 'Location'}</h3>
              <p className="text-lg">📍 {t.hub.location}</p>
              <ul className="mt-2 space-y-1 text-foreground/70">
                {t.hub.strategic.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{locale === 'es' ? 'Capacidad' : 'Capacity'}</h3>
              <DeckStats
                stats={[
                  { ...t.hubCapacity.workstations, accent: 'primary' },
                  { ...t.hubCapacity.events, accent: 'secondary' },
                ]}
                columns={2}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t.hub.status.title}</h3>
              <ul className="mt-2 space-y-1">
                {t.hub.status.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DeckSection>

      {/* Hub Programming */}
      <DeckSection title={t.programming.title}>
        <DeckTable columns={tables.programming.columns} data={tables.programming.data} />
        <p className="mt-4 rounded-lg bg-primary/10 p-3 text-center font-medium text-primary">
          {t.programming.note}
        </p>
      </DeckSection>

      {/* Founding Partner Opportunity */}
      <DeckSection
        title={t.partnerOpportunity.title}
        description={t.partnerOpportunity.description}
        variant="highlight"
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              {locale === 'es' ? 'Lo que EF Obtiene' : 'What EF Gets'}
            </h3>
            <DeckTable columns={tables.partnerBenefits.columns} data={tables.partnerBenefits.data} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              {locale === 'es' ? 'Lo que Frutero Provee' : 'What Frutero Provides'}
            </h3>
            <DeckTable columns={tables.fruteroProvides.columns} data={tables.fruteroProvides.data} />
          </div>
        </div>
      </DeckSection>

      {/* Partnership Request */}
      <DeckSection title={t.request.title}>
        <p className="mb-6 text-xl font-bold text-primary">{t.request.ask}</p>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              {locale === 'es' ? 'Asignación (Mapeada a Prioridades EF)' : 'Allocation (Mapped to EF Priorities)'}
            </h3>
            <DeckTable columns={tables.budget.columns} data={tables.budget.data} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">{t.request.beyond.title}</h3>
            <ul className="space-y-2">
              {t.request.beyond.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">→</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DeckSection>

      {/* Why Frutero */}
      <DeckSection title={t.requirements.title}>
        <DeckTable columns={tables.requirements.columns} data={tables.requirements.data} />
      </DeckSection>

      {/* Team */}
      <DeckSection title={t.team.title}>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.team.members.map((member, i) => (
            <div key={i} className="rounded-lg border border-border/50 p-4 text-center">
              <p className="text-xl font-bold">{member.name}</p>
              <p className="text-primary">{member.role}</p>
              <p className="mt-1 text-sm text-foreground/70">{member.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-foreground/70">{t.team.plus}</p>
      </DeckSection>

      {/* CTA */}
      <DeckCTA
        title={t.cta.title}
        description={t.cta.description}
        primaryAction={{
          label: t.cta.button,
          href: `mailto:${t.cta.email}?subject=Casa%20Frutero%20Partnership`,
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
