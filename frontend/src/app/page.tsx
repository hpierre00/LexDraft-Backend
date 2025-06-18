// Public landing page - accessible to all users without authentication
import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-7";
import StatsSection from "@/components/stats-4";
import TestimonialsSection from "@/components/testimonials";
import PricingSection from "@/components/pricing";
import FooterSection from "@/components/footer";
import TailoredSection from "@/components/tailored-section";
import SecureSection from "@/components/secure-section";
import TransformSection from "@/components/transform-section";

export default function Home() {
  return (
    <div className="">
      <HeroSection />
      <FeaturesSection />
      <TailoredSection />
      <TestimonialsSection />
      <SecureSection />
      <PricingSection />
      <TransformSection />
      <FooterSection />
    </div>
  );
}
