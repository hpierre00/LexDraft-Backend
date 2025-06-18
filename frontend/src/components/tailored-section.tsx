import { Building, FileText, ShieldCheck } from "lucide-react"

export default function TailoredSection() {
  return (
    <section className="py-16 bg-[var(--lawverra-cream)]">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-[var(--lawverra-navy)] mb-16">
          Tailored for Legal Professionals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Law Firms */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <Building size={48} className="text-[var(--lawverra-navy)]" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[var(--lawverra-navy)]">Law Firms</h3>
            <p className="text-gray-600">
              Streamline your case preparation and enhance client service with our comprehensive legal tools.
            </p>
          </div>

          {/* Corporate Counsel */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <FileText size={48} className="text-[var(--lawverra-navy)]" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[var(--lawverra-navy)]">Corporate Counsel</h3>
            <p className="text-gray-600">
              Manage your company legal needs efficiently and reduce risks in automated workflows.
            </p>
          </div>

          {/* Compliance Teams */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <ShieldCheck size={48} className="text-[var(--lawverra-navy)]" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[var(--lawverra-navy)]">Compliance Teams</h3>
            <p className="text-gray-600">
              Ensure adherence to policies and regulations with continuous compliance tracking.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
