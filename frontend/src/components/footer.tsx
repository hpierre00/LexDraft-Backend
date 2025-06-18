import { LegalNav } from "@/components/legal-nav";

export default function FooterSection() {
  return (
    <footer className="bg-[var(--lawverra-navy)] text-white py-8">
      <div className="container mx-auto px-6">
        <div className="flex justify-center mb-8">
          <LegalNav />
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Lawverra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
