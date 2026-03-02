import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustedBy } from '@/components/landing/TrustedBy';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { FeaturePillars } from '@/components/landing/FeaturePillars';
import { CopilotDemo } from '@/components/landing/CopilotDemo';
import { DifferentiationTable } from '@/components/landing/DifferentiationTable';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingTeaser } from '@/components/landing/PricingTeaser';
import { CTABanner } from '@/components/landing/CTABanner';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main>
      <LandingNav />
      <HeroSection />
      <TrustedBy />
      <ProblemSolution />
      <FeaturePillars />
      <CopilotDemo />
      <DifferentiationTable />
      <Testimonials />
      <PricingTeaser />
      <CTABanner />
      <Footer />
    </main>
  );
}
