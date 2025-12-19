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

export default function Home() {
  return (
    <PageWrapper>
      <HeroSection />
      <PainPointsSection />
      <SolutionSection />
      <DifferentiatorSection />
      <JourneySection />
      <TestimonialsSection />
      <StatsSection />
      <CustomersPartnersSection />
      <FAQSection />
      <FinalCTASection />
    </PageWrapper>
  )
}
