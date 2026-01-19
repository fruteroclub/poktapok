import PageWrapper from '@/components/layout/page-wrapper'
import HeroV2Section from '@/components/landing/hero-v2-section'
import ProblemV2Section from '@/components/landing/problem-v2-section'
import WhoWeAreV2Section from '@/components/landing/who-we-are-v2-section'
import TeamV2Section from '@/components/landing/team-v2-section'
import PartnersV2Section from '@/components/landing/partners-v2-section'
import ProjectsV2Section from '@/components/landing/projects-v2-section'
import HubV2Section from '@/components/landing/hub-v2-section'
import EventsV2Section from '@/components/landing/events-v2-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import FAQSection from '@/components/landing/faq-section'

export default function V2Page() {
  return (
    <PageWrapper>
      {/* 1. HERO - Identidad + CTA */}
      <HeroV2Section />

      {/* 2. EL PROBLEMA - Pain point personal + CTAs (programas / coworking) */}
      <ProblemV2Section />

      {/* 3. QUIÉNES SOMOS - Propuesta de valor + números + DNA */}
      <WhoWeAreV2Section />

      {/* 4. EL EQUIPO - Mentores (credibilidad inmediata) */}
      <TeamV2Section />

      {/* 5. PARTNERS - Logos (prueba social) */}
      <PartnersV2Section />

      {/* 6. LO QUE HEMOS CONSTRUIDO - Startups/proyectos */}
      <ProjectsV2Section />

      {/* 7. EL HUB - Espacio físico + ¿Eres Hacker? (filtro) */}
      <HubV2Section />

      {/* 8. PRÓXIMOS EVENTOS - Programas con fechas (ya hubo CTA arriba, aquí es refuerzo) */}
      <EventsV2Section />

      {/* Optional: Testimonials */}
      <TestimonialsSection />

      {/* 9. FAQ */}
      <FAQSection />
    </PageWrapper>
  )
}
