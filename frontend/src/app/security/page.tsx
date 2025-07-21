import { HeroHeader } from "@/components/header";
import { ShieldCheck, Lock, Database, Server, Cog } from "lucide-react";

export default function SecurityPage() {
  return (
    <>
      <HeroHeader />
      <div className="bg-background text-foreground pt-20">
        <div className="container mx-auto py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-primary mb-4">
                Our Commitment to Security
              </h1>
              <p className="text-xl text-muted-foreground">
                At Lawverra, we take the security of your data seriously. We
                employ industry-best practices to ensure your information is
                protected at all times.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <ShieldCheck className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h2 className="text-2xl font-bold">Data Encryption</h2>
                  <p className="text-muted-foreground">
                    All data, both in transit and at rest, is encrypted using
                    strong cryptographic protocols (TLS 1.2+ and AES-256). This
                    ensures that your information is unreadable to unauthorized
                    parties.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Lock className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h2 className="text-2xl font-bold">Access Control</h2>
                  <p className="text-muted-foreground">
                    We enforce strict access control policies. Access to your
                    data is limited to authorized personnel only, and all access
                    is logged and monitored.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Database className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h2 className="text-2xl font-bold">Secure Infrastructure</h2>
                  <p className="text-muted-foreground">
                    Our infrastructure is hosted on secure, compliant cloud
                    providers (e.g., AWS, Google Cloud) that offer robust
                    physical and network security measures.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Server className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h2 className="text-2xl font-bold">Regular Audits</h2>
                  <p className="text-muted-foreground">
                    We conduct regular security audits and penetration testing
                    to identify and address potential vulnerabilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Cog className="h-8 w-8 text-primary mt-1" />
                <div>
                  <h2 className="text-2xl font-bold">Compliance</h2>
                  <p className="text-muted-foreground">
                    We are compliant with major data protection regulations,
                    including GDPR and CCPA, to ensure your data is handled
                    responsibly.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground">
                Have questions about our security practices? Please{" "}
                <a href="/contact" className="text-primary hover:underline">
                  contact us
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
