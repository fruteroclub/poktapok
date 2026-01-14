import dynamic from 'next/dynamic'
import PageWrapper from '@/components/layout/page-wrapper'
import HeroSection from '@/components/landing/hero-section'

// Lazy load below-fold sections for better performance
const PainPointsSection = dynamic(
  () => import('@/components/landing/pain-points-section'),
)
const SolutionSection = dynamic(
  () => import('@/components/landing/solution-section'),
)
const DifferentiatorSection = dynamic(
  () => import('@/components/landing/differentiator-section'),
)
const JourneySection = dynamic(
  () => import('@/components/landing/journey-section'),
)
const TestimonialsSection = dynamic(
  () => import('@/components/landing/testimonials-section'),
)
const StatsSection = dynamic(
  () => import('@/components/landing/stats-section'),
)
const CustomersPartnersSection = dynamic(
  () => import('@/components/landing/customers-partners-section'),
)
const FAQSection = dynamic(() => import('@/components/landing/faq-section'))
const FinalCTASection = dynamic(
  () => import('@/components/landing/final-cta-section'),
)

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
