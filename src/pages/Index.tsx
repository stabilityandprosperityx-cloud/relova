import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProductTourSection from "@/components/landing/ProductTourSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import LegalPathwaysSection from "@/components/landing/LegalPathwaysSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CountriesSection from "@/components/landing/CountriesSection";
import PlanBuilderSection from "@/components/landing/PlanBuilderSection";
import DemoSection from "@/components/landing/DemoSection";
import FAQSection from "@/components/landing/FAQSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";

export default function Index() {
  return (
    <div className="min-h-screen bg-background bg-noise bg-grid">
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <ProductTourSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ComparisonSection />
        <LegalPathwaysSection />
        <HowItWorksSection />
        <CountriesSection />
        <PlanBuilderSection />
        <DemoSection />
        <FAQSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
