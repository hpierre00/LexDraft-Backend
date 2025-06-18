import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Lawverra's privacy policy and data protection practices",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">
            Privacy Policy
          </h1>

          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
                <p>
                  <strong>Effective Date: June 13, 2025</strong>
                </p>

                <p>
                  At Lawverra, we are committed to protecting your privacy and
                  ensuring transparency in how your information is used. This
                  Privacy Policy outlines what we collect, why we collect it,
                  and how we protect it.
                </p>

                <h2>1. Information We Collect</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Account Data</strong>: Your name, email address,
                    company name, billing details, and login credentials.
                  </li>
                  <li>
                    <strong>Document Data</strong>: Contracts, templates, and
                    other legal content you upload or generate within the
                    platform.
                  </li>
                  <li>
                    <strong>Usage Data</strong>: Interaction logs, user
                    preferences, and technical metrics used to improve platform
                    performance.
                  </li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To deliver and enhance our Services.</li>
                  <li>To manage your account and provide customer support.</li>
                  <li>
                    To improve AI accuracy, workflow efficiency, and product
                    features.
                  </li>
                </ul>

                <h2>3. Third-Party Services</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We may use secure, industry-standard third-party services
                    for payments (e.g., Stripe), AI processing (e.g., OpenAI),
                    and hosting (e.g., Supabase). These vendors are governed by
                    their own privacy policies.
                  </li>
                </ul>

                <h2>4. Security and Data Protection</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Lawverra uses encryption in transit and at rest, access
                    controls, and audit logging to safeguard your data.
                  </li>
                  <li>
                    Only authorized personnel and agents have access to customer
                    information.
                  </li>
                </ul>

                <h2>5. Your Rights</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You may request to access, correct, or delete your personal
                    data at any time.
                  </li>
                  <li>
                    If you are subject to GDPR, CCPA, or other data protection
                    laws, you may exercise your rights by contacting us.
                  </li>
                </ul>

                <h2>6. Data Retention</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We retain data only as long as necessary to fulfill the
                    purposes of our Services or to comply with legal
                    obligations.
                  </li>
                </ul>

                <h2>7. Contact Us</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    For questions about this Privacy Policy, please contact us
                    at <strong>info@lawverra.com</strong>.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
