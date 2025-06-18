import { FileText, Shield, TrendingUp } from 'lucide-react'

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white" id="features">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-[var(--lawverra-navy)] mb-16">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* AI Contract Review */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <FileText size={48} className="text-[var(--lawverra-navy)]" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[var(--lawverra-navy)]">AI Contract Review</h3>
            <p className="text-gray-600">
              Identify risks and key points in your contracts intuitively with our advanced AI analysis.
            </p>
          </div>
          
          {/* Automated Compliance */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <Shield size={48} className="text-[var(--lawverra-navy)]" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[var(--lawverra-navy)]">Automated Compliance</h3>
            <p className="text-gray-600">
              Stay ahead of regulations with real-time monitoring, automated compliance checks.
            </p>
          </div>
          
          {/* Decision Assistance */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <TrendingUp size={48} className="text-[var(--lawverra-navy)]" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[var(--lawverra-navy)]">Decision Assistance</h3>
            <p className="text-gray-600">
              Make quicker, more informed legal decisions with our intuitive analytics tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
