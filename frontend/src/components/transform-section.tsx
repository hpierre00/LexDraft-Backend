import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TransformSection() {
  return (
    <section className="py-16 bg-[var(--lawverra-cream)]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side with gold background */}
          <div className="md:w-1/2 bg-[var(--lawverra-gold)] p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-white mb-4">
              Transform your legal workflow today
            </h2>
            <Link href="/register" passHref>
              <Button className="bg-white text-[var(--lawverra-navy)] hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Right side with text */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-[var(--lawverra-navy)] mb-4">
              Transform your legal workflow today
            </h3>
            <p className="text-gray-600">
              Experience the power of AI-driven contract analysis and compliance
              automation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
