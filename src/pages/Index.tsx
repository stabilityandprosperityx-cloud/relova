import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CountriesSection from "@/components/landing/CountriesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";

export default function Index() {
  return (
    <div className="min-h-screen bg-background bg-noise">
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CountriesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
