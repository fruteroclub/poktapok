import PageWrapper from '@/components/layout/page-wrapper'
import HeroSection from '@/components/landing/hero-section'
import StatsSection from '@/components/landing/stats-section'
import JourneySection from '@/components/landing/journey-section'
import TestimonialsSection from '@/components/landing/testimonials-section'
import FAQSection from '@/components/landing/faq-section'
import FinalCTASection from '@/components/landing/final-cta-section'
import CustomersPartnersSection from '@/components/landing/customers-partners-section'
import PainPointsSection from '@/components/landing/pain-points-section'
import SolutionSection from '@/components/landing/solution-section'
import DifferentiatorSection from '@/components/landing/differentiator-section'
import ProblemV2Section from '@/components/landing/problem-v2-section'
import WhoWeAreV2Section from '@/components/landing/who-we-are-v2-section'
import HubV2Section from '@/components/landing/hub-v2-section'
import ProjectsV2Section from '@/components/landing/projects-v2-section'
import EventsCarousel from '@/components/events/events-carousel'

export default function Home() {
  return (
    <PageWrapper>
      <HeroSection />
      <ProblemV2Section />
      <WhoWeAreV2Section />
      <ProjectsV2Section />
      <CustomersPartnersSection />
      <HubV2Section />
      <EventsCarousel
        title="Próximos Eventos"
        subtitle="Únete a nuestros eventos y conecta con otros builders"
        showTabs={false}
        defaultTab="upcoming"
        limit={6}
        showViewAll={true}
        viewAllHref="/club/eventos"
      />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </PageWrapper>
  )
}
