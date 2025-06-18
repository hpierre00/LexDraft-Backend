import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-7"
import TailoredSection from "@/components/tailored-section"
import SecureSection from "@/components/secure-section"
import TransformSection from "@/components/transform-section"
import TestimonialsSection from "@/components/testimonials"
import PricingSection from "@/components/pricing"
import FooterSection from "@/components/footer"

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
  )
}
