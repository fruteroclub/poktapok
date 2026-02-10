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
  Shield,
  Target,
  Zap,
  Calendar,
  CheckCircle,
  Lock,
  MessageSquare,
  Database,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  params: Promise<{ locale: string }>
}

// Custom proposal for Logos - Privacy-first builders for privacy-first tech
const content = {
  en: {
    header: {
      title: 'Logos × Frutero',
      subtitle: 'DevRel Services & Builder Support — Connecting Privacy-First Builders with Privacy-First Tech',
    },
    insight: {
      title: 'The Insight',
      quote: '"Freedom needs builders" — but not just any builders.',
      text: 'Logos isn\'t building another blockchain. You\'re building infrastructure for human sovereignty. Your stack — private-by-default blockchain, censorship-resistant storage, peer-to-peer messaging — demands developers who don\'t just understand the tech, but believe in the mission.',
      problem: 'The challenge: finding aligned builders in emerging markets who will build on Logos because they care about privacy, not just because there\'s a bounty.',
      solution: 'Frutero connects Logos with LATAM\'s most engaged Impact Tech community — 1,000+ builders who chose this path because they believe technology should serve people, not capture them.',
    },
    alignment: {
      title: 'Why Logos × Frutero',
      description: 'Mission alignment creates sustainable ecosystems:',
    },
    proposal: {
      title: 'The Proposal',
      subtitle: '2-Month Gold Partnership — February & March 2026',
      totalValue: '$2,000',
      period: '8 weeks of integrated builder engagement',
    },
    deliverables: {
      title: 'What You Get',
      items: [
        {
          icon: 'presentation',
          title: 'Logos Introduction Presentation',
          description: 'Online presentation introducing the Logos tech stack to our builder community. Position Logos as the privacy infrastructure layer for the next generation of dapps.',
          timing: 'Week 4 — February',
          reach: '35-40 builders',
        },
        {
          icon: 'workshop1',
          title: 'Technical Workshop #1',
          description: 'Hands-on session on Logos blockchain module (formerly Nomos). Builders learn to deploy privacy-preserving smart contracts and understand network-level privacy.',
          timing: 'Week 3 — March',
          reach: '15-20 builders',
        },
        {
          icon: 'workshop2',
          title: 'Technical Workshop #2',
          description: 'Deep dive into Logos messaging and storage modules. Build a complete private dapp using the full Logos stack.',
          timing: 'Week 1 — April',
          reach: '15-20 builders',
        },
        {
          icon: 'circles',
          title: 'Circles Community Sessions',
          description: 'Weekly coworking sessions at Casa Frutero where Logos builders can connect, collaborate, and get support. Ongoing engagement, not one-off events.',
          timing: 'To be scheduled — March/April',
          reach: '15-20 builders/session',
        },
      ],
    },
    extras: {
      title: 'Included in Gold Partnership',
      items: [
        'Featured partner placement across Frutero channels',
        'Dedicated Frutero liaison for coordination',
        'Talent pipeline access — warm intros to top builders',
        'Spanish-language technical content creation',
        'Weekly engagement reporting',
        'Access to mentor network (17 active mentors)',
      ],
    },
    outcomes: {
      title: 'Expected Outcomes',
      metrics: [
        { value: '100+', label: 'Builders Exposed to Logos' },
        { value: '30+', label: 'Active Workshop Participants' },
        { value: '10+', label: 'Projects Started on Logos' },
        { value: '5+', label: 'Qualified Talent Intros' },
      ],
    },
    whyFrutero: {
      title: 'Why Frutero',
      stats: [
        { value: '1,000+', label: 'Builders in Network' },
        { value: '70%+', label: 'Hackathon Success Rate' },
        { value: '32.7%', label: 'Program Completion' },
        { value: '6', label: 'ETHDenver 2025 Winners' },
      ],
      differentiators: [
        { title: 'LATAM Native', desc: 'Bilingual team, deep regional network' },
        { title: 'Privacy-Aligned', desc: 'Community that values sovereignty' },
        { title: 'Retention Focus', desc: 'Ongoing engagement, not one-off events' },
        { title: 'Proven Results', desc: 'Validated with Monad, Base, Solana' },
      ],
    },
    investment: {
      title: 'Investment',
      package: 'Gold Partnership — 2 Months',
      price: '$1,000/month × 2 = $2,000 total',
      includes: [
        '1 Introduction Presentation (50-80 reach)',
        '2 Technical Workshops (25-40 each)',
        '8 weeks of Circles sessions',
        'Featured partner placement',
        'Talent pipeline access',
        'Weekly reporting',
      ],
      comparison: {
        title: 'Value Comparison',
        items: [
          { item: 'Traditional conference sponsorship', cost: '$5,000-15,000', result: '1 day exposure' },
          { item: 'Agency-run workshops (2)', cost: '$4,000-8,000', result: 'No community access' },
          { item: 'Frutero Gold (2 months)', cost: '$2,000', result: 'Integrated community engagement' },
        ],
      },
    },
    timeline: {
      title: 'Timeline',
      weeks: [
        { week: 'Week 1', activity: 'Kickoff + content planning', focus: 'Align on messaging and technical focus' },
        { week: 'Week 2', activity: 'Logos Presentation', focus: 'Introduction to 50-80 builders' },
        { week: 'Week 3', activity: 'Circles + community building', focus: 'Ongoing engagement begins' },
        { week: 'Week 4', activity: 'Workshop #1 (Blockchain)', focus: 'Hands-on Nomos module' },
        { week: 'Week 5', activity: 'Circles + project support', focus: 'Builders start experimenting' },
        { week: 'Week 6', activity: 'Workshop #2 (Messaging + Storage)', focus: 'Full stack deep dive' },
        { week: 'Week 7', activity: 'Circles + project showcase', focus: 'Highlight early builders' },
        { week: 'Week 8', activity: 'Wrap-up + reporting', focus: 'Outcomes report + next steps' },
      ],
    },
    team: {
      title: 'Your Frutero Team',
      members: [
        { name: 'Mel', role: 'CEO', desc: 'Strategic partnership lead' },
        { name: 'Ian', role: 'BD', desc: 'Coordination + reporting' },
        { name: 'Brian', role: 'DevRel Lead', desc: 'Technical content + workshops' },
      ],
    },
    cta: {
      title: 'Let\'s Build for Freedom',
      description: 'Logos is building infrastructure for human sovereignty. Frutero connects you with builders who believe in that mission. Let\'s bring privacy-first tech to LATAM\'s best builders.',
      button: 'Confirm Partnership',
      email: 'mel@frutero.club',
    },
    footer: {
      quote: '"Freedom needs builders." We know where to find them.',
      tagline: 'Logos × Frutero — Privacy-First Builders for Privacy-First Tech',
    },
  },
  es: {
    header: {
      title: 'Logos × Frutero',
      subtitle: 'Servicios DevRel y Soporte de Builders — Conectando Builders Privacy-First con Tecnología Privacy-First',
    },
    insight: {
      title: 'El Insight',
      quote: '"Freedom needs builders" — pero no cualquier builder.',
      text: 'Logos no está construyendo otro blockchain. Están construyendo infraestructura para la soberanía humana. Su stack — blockchain privado por defecto, almacenamiento resistente a censura, mensajería peer-to-peer — demanda desarrolladores que no solo entiendan la tech, sino que crean en la misión.',
      problem: 'El reto: encontrar builders alineados en mercados emergentes que construyan en Logos porque les importa la privacidad, no solo porque hay un bounty.',
      solution: 'Frutero conecta a Logos con la comunidad de Impact Tech más comprometida de LATAM — 1,000+ builders que eligieron este camino porque creen que la tecnología debe servir a las personas, no capturarlas.',
    },
    alignment: {
      title: 'Por Qué Logos × Frutero',
      description: 'La alineación de misión crea ecosistemas sostenibles:',
    },
    proposal: {
      title: 'La Propuesta',
      subtitle: 'Gold Partnership de 2 Meses — Febrero y Marzo 2026',
      totalValue: '$2,000',
      period: '8 semanas de engagement integrado con builders',
    },
    deliverables: {
      title: 'Lo Que Obtienes',
      items: [
        {
          icon: 'presentation',
          title: 'Presentación de Introducción a Logos',
          description: 'Presentación online introduciendo el tech stack de Logos a nuestra comunidad de builders. Posicionar a Logos como la capa de infraestructura de privacidad para la próxima generación de dapps.',
          timing: 'Semana 4 — Febrero',
          reach: '35-40 builders',
        },
        {
          icon: 'workshop1',
          title: 'Workshop Técnico #1',
          description: 'Sesión hands-on sobre el módulo blockchain de Logos (antes Nomos). Los builders aprenden a deployar smart contracts con privacidad y entender la privacidad a nivel de red.',
          timing: 'Semana 3 — Marzo',
          reach: '15-20 builders',
        },
        {
          icon: 'workshop2',
          title: 'Workshop Técnico #2',
          description: 'Deep dive en los módulos de messaging y storage de Logos. Construir una dapp privada completa usando el stack completo de Logos.',
          timing: 'Semana 1 — Abril',
          reach: '15-20 builders',
        },
        {
          icon: 'circles',
          title: 'Sesiones de Circles',
          description: 'Sesiones semanales de coworking en Casa Frutero donde builders de Logos pueden conectar, colaborar y recibir soporte. Engagement continuo, no eventos únicos.',
          timing: 'A coordinar — Marzo/Abril',
          reach: '15-20 builders/sesión',
        },
      ],
    },
    extras: {
      title: 'Incluido en Gold Partnership',
      items: [
        'Colocación de partner destacado en canales Frutero',
        'Liaison dedicado de Frutero para coordinación',
        'Acceso a pipeline de talento — intros calientes a top builders',
        'Creación de contenido técnico en español',
        'Reporteo semanal de engagement',
        'Acceso a red de mentores (17 mentores activos)',
      ],
    },
    outcomes: {
      title: 'Resultados Esperados',
      metrics: [
        { value: '100+', label: 'Builders Expuestos a Logos' },
        { value: '30+', label: 'Participantes Activos en Workshops' },
        { value: '10+', label: 'Proyectos Iniciados en Logos' },
        { value: '5+', label: 'Intros de Talento Calificado' },
      ],
    },
    whyFrutero: {
      title: 'Por Qué Frutero',
      stats: [
        { value: '1,000+', label: 'Builders en Red' },
        { value: '70%+', label: 'Éxito en Hackathons' },
        { value: '32.7%', label: 'Completación de Programas' },
        { value: '6', label: 'Ganadores ETHDenver 2025' },
      ],
      differentiators: [
        { title: 'LATAM Nativo', desc: 'Equipo bilingüe, red regional profunda' },
        { title: 'Alineados con Privacidad', desc: 'Comunidad que valora la soberanía' },
        { title: 'Enfoque en Retención', desc: 'Engagement continuo, no eventos únicos' },
        { title: 'Resultados Probados', desc: 'Validado con Monad, Base, Solana' },
      ],
    },
    investment: {
      title: 'Inversión',
      package: 'Gold Partnership — 2 Meses',
      price: '$1,000/mes × 2 = $2,000 total',
      includes: [
        '1 Presentación de Introducción (50-80 alcance)',
        '2 Workshops Técnicos (25-40 cada uno)',
        '8 semanas de sesiones Circles',
        'Colocación de partner destacado',
        'Acceso a pipeline de talento',
        'Reporteo semanal',
      ],
      comparison: {
        title: 'Comparación de Valor',
        items: [
          { item: 'Patrocinio de conferencia tradicional', cost: '$5,000-15,000', result: '1 día de exposición' },
          { item: 'Workshops con agencia (2)', cost: '$4,000-8,000', result: 'Sin acceso a comunidad' },
          { item: 'Frutero Gold (2 meses)', cost: '$2,000', result: 'Engagement integrado de comunidad' },
        ],
      },
    },
    timeline: {
      title: 'Timeline',
      weeks: [
        { week: 'Semana 1', activity: 'Kickoff + planeación de contenido', focus: 'Alinear messaging y enfoque técnico' },
        { week: 'Semana 2', activity: 'Presentación Logos', focus: 'Introducción a 50-80 builders' },
        { week: 'Semana 3', activity: 'Circles + community building', focus: 'Inicia engagement continuo' },
        { week: 'Semana 4', activity: 'Workshop #1 (Blockchain)', focus: 'Hands-on módulo Nomos' },
        { week: 'Semana 5', activity: 'Circles + soporte de proyectos', focus: 'Builders empiezan a experimentar' },
        { week: 'Semana 6', activity: 'Workshop #2 (Messaging + Storage)', focus: 'Deep dive full stack' },
        { week: 'Semana 7', activity: 'Circles + showcase de proyectos', focus: 'Highlight builders tempranos' },
        { week: 'Semana 8', activity: 'Wrap-up + reporteo', focus: 'Reporte de resultados + next steps' },
      ],
    },
    team: {
      title: 'Tu Equipo Frutero',
      members: [
        { name: 'Mel', role: 'CEO', desc: 'Líder de partnership estratégico' },
        { name: 'Ian', role: 'BD', desc: 'Coordinación + reporteo' },
        { name: 'Brian', role: 'DevRel Lead', desc: 'Contenido técnico + workshops' },
      ],
    },
    cta: {
      title: 'Construyamos para la Libertad',
      description: 'Logos está construyendo infraestructura para la soberanía humana. Frutero los conecta con builders que creen en esa misión. Llevemos tech privacy-first a los mejores builders de LATAM.',
      button: 'Confirmar Partnership',
      email: 'mel@frutero.club',
    },
    footer: {
      quote: '"Freedom needs builders." Sabemos dónde encontrarlos.',
      tagline: 'Logos × Frutero — Builders Privacy-First para Tech Privacy-First',
    },
  },
}

const alignmentTable = {
  en: {
    columns: [
      { key: 'logos', header: 'Logos Builds' },
      { key: 'frutero', header: 'Frutero Delivers' },
    ],
    data: [
      { logos: 'Private-by-default infrastructure', frutero: 'Privacy-conscious builder community' },
      { logos: 'Censorship-resistant technology', frutero: 'Builders who value sovereignty' },
      { logos: 'Decentralized applications', frutero: 'Developers who ship, not just experiment' },
      { logos: 'Tools for local communities', frutero: 'Deep roots in LATAM\'s emerging tech scene' },
      { logos: 'Resistance to capture', frutero: 'Independent, mission-driven operators' },
    ],
  },
  es: {
    columns: [
      { key: 'logos', header: 'Logos Construye' },
      { key: 'frutero', header: 'Frutero Entrega' },
    ],
    data: [
      { logos: 'Infraestructura privada por defecto', frutero: 'Comunidad de builders conscientes de privacidad' },
      { logos: 'Tecnología resistente a censura', frutero: 'Builders que valoran la soberanía' },
      { logos: 'Aplicaciones descentralizadas', frutero: 'Developers que shipean, no solo experimentan' },
      { logos: 'Herramientas para comunidades locales', frutero: 'Raíces profundas en la escena tech emergente de LATAM' },
      { logos: 'Resistencia a la captura', frutero: 'Operadores independientes, impulsados por misión' },
    ],
  },
}

function DeliverableCard({
  title,
  description,
  timing,
  reach,
  icon,
}: {
  title: string
  description: string
  timing: string
  reach: string
  icon: string
}) {
  const IconComponent = icon === 'presentation' ? MessageSquare : 
                        icon === 'workshop1' ? Database :
                        icon === 'workshop2' ? Lock :
                        Calendar

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{title}</h4>
          <p className="text-sm text-foreground/70 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <span className="rounded-full bg-secondary/10 px-3 py-1">
          📅 {timing}
        </span>
        <span className="rounded-full bg-primary/10 px-3 py-1">
          👥 {reach}
        </span>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: 'Logos × Frutero — DevRel Partnership Proposal',
    description:
      locale === 'es'
        ? 'Propuesta de servicios DevRel y soporte de builders para Logos — Privacy-first builders para tech privacy-first'
        : 'DevRel services and builder support proposal for Logos — Privacy-first builders for privacy-first tech',
    openGraph: {
      title: 'Logos × Frutero — DevRel Partnership',
      description: 'Connecting privacy-first builders with privacy-first tech',
      type: 'website',
    },
  }
}

export default async function LogosProposalPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = content[locale as 'en' | 'es'] || content.en
  const alignment = alignmentTable[locale as 'en' | 'es'] || alignmentTable.en

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

      {/* The Insight */}
      <DeckSection title={t.insight.title}>
        <div className="space-y-6">
          <blockquote className="text-2xl font-bold text-primary text-center italic">
            {t.insight.quote}
          </blockquote>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto text-center">
            {t.insight.text}
          </p>
          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                <strong>{locale === 'es' ? 'El Reto:' : 'The Challenge:'}</strong> {t.insight.problem}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                <strong>{locale === 'es' ? 'La Solución:' : 'The Solution:'}</strong> {t.insight.solution}
              </p>
            </div>
          </div>
        </div>
      </DeckSection>

      {/* Alignment */}
      <DeckSection title={t.alignment.title} description={t.alignment.description}>
        <DeckTable columns={alignment.columns} data={alignment.data} />
      </DeckSection>

      {/* The Proposal */}
      <DeckSection title={t.proposal.title} variant="highlight">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">{t.proposal.subtitle}</p>
          <p className="text-4xl font-bold text-primary">{t.proposal.totalValue}</p>
          <p className="text-foreground/70">{t.proposal.period}</p>
        </div>
      </DeckSection>

      {/* Deliverables */}
      <DeckSection title={t.deliverables.title}>
        <div className="grid gap-6 md:grid-cols-2">
          {t.deliverables.items.map((item, i) => (
            <DeliverableCard key={i} {...item} />
          ))}
        </div>
      </DeckSection>

      {/* Extras */}
      <DeckSection title={t.extras.title}>
        <div className="grid gap-3 sm:grid-cols-2">
          {t.extras.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border/50 p-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </DeckSection>

      {/* Expected Outcomes */}
      <DeckSection title={t.outcomes.title}>
        <DeckStats
          stats={t.outcomes.metrics.map((m, i) => ({
            ...m,
            icon: [Users, Target, Zap, Users][i],
            accent: (['primary', 'secondary', 'accent', 'primary'] as const)[i],
          }))}
          columns={4}
        />
      </DeckSection>

      {/* Why Frutero */}
      <DeckSection title={t.whyFrutero.title}>
        <DeckStats
          stats={t.whyFrutero.stats.map((s, i) => ({
            ...s,
            icon: [Users, Target, Target, Zap][i],
            accent: (['primary', 'secondary', 'accent', 'primary'] as const)[i],
          }))}
          columns={4}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          {t.whyFrutero.differentiators.map((d, i) => (
            <div key={i} className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
              <p className="font-semibold text-primary">{d.title}</p>
              <p className="text-sm text-foreground/70 mt-1">{d.desc}</p>
            </div>
          ))}
        </div>
      </DeckSection>

      {/* Investment */}
      <DeckSection title={t.investment.title} variant="highlight">
        <div className="text-center space-y-4 mb-8">
          <p className="text-xl font-semibold">{t.investment.package}</p>
          <p className="text-3xl font-bold text-primary">{t.investment.price}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {t.investment.includes.map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg border border-border/50 p-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="font-semibold text-center mb-4">{t.investment.comparison.title}</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-3 font-semibold">{locale === 'es' ? 'Opción' : 'Option'}</th>
                  <th className="text-left p-3 font-semibold">{locale === 'es' ? 'Costo' : 'Cost'}</th>
                  <th className="text-left p-3 font-semibold">{locale === 'es' ? 'Resultado' : 'Result'}</th>
                </tr>
              </thead>
              <tbody>
                {t.investment.comparison.items.map((item, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-primary/5' : ''}>
                    <td className="p-3">{item.item}</td>
                    <td className="p-3 font-medium">{item.cost}</td>
                    <td className="p-3">{item.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DeckSection>

      {/* Timeline */}
      <DeckSection title={t.timeline.title}>
        <div className="space-y-3">
          {t.timeline.weeks.map((w, i) => (
            <div key={i} className="flex gap-4 rounded-lg border border-border/50 p-4">
              <div className="font-bold text-primary w-24 flex-shrink-0">{w.week}</div>
              <div className="flex-1">
                <p className="font-medium">{w.activity}</p>
                <p className="text-sm text-foreground/70">{w.focus}</p>
              </div>
            </div>
          ))}
        </div>
      </DeckSection>

      {/* Team */}
      <DeckSection title={t.team.title}>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.team.members.map((m, i) => (
            <div key={i} className="rounded-lg border border-border/50 p-4 text-center">
              <p className="text-xl font-bold">{m.name}</p>
              <p className="text-primary">{m.role}</p>
              <p className="text-sm text-foreground/70 mt-1">{m.desc}</p>
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
          href: `mailto:${t.cta.email}?subject=Logos%20×%20Frutero%20Partnership%20Confirmation`,
        }}
        contactEmail={t.cta.email}
      />

      {/* Footer */}
      <footer className="space-y-4 text-center text-foreground/60">
        <p className="italic text-lg">{t.footer.quote}</p>
        <p className="text-xl font-bold text-foreground">{t.footer.tagline}</p>
        <div className="flex justify-center gap-4 text-sm">
          <a href="https://frutero.club" className="hover:text-primary">frutero.club</a>
          <span>•</span>
          <a href="https://logos.co" className="hover:text-primary">logos.co</a>
        </div>
      </footer>
    </DeckLayout>
  )
}
