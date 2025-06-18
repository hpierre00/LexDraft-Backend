import { Shield } from "lucide-react"

export default function SecureSection() {
  return (
    <section className="py-16 bg-[var(--lawverra-navy)] text-white">
      <div className="container mx-auto px-6 flex flex-col items-center">
        <Shield size={64} className="text-[var(--lawverra-gold)] mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-center">Secure and Trusted</h2>
        <p className="text-center max-w-2xl">
          We prioritize the security and confidentiality of your legal data with top tier encryption and industry
          standards.
        </p>
      </div>
    </section>
  )
}
