import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Jurisdiction-Specific Addenda",
  description: "Lawverra's jurisdiction-specific compliance information",
};

export default function JurisdictionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">
            Jurisdiction-Specific Addenda
          </h1>

          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
                <h2>Canada (PIPEDA Compliance)</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    We comply with the Personal Information Protection and
                    Electronic Documents Act (PIPEDA).
                  </li>
                  <li>
                    Users in Canada may request detailed access to their
                    personal data and inquire about how it has been used.
                  </li>
                  <li>
                    Lawverra will respond to access requests within 30 days, in
                    accordance with Canadian law.
                  </li>
                </ul>

                <h2>United Kingdom (UK GDPR)</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    For users in the UK, we process personal data in accordance
                    with UK GDPR.
                  </li>
                  <li>
                    Users have the right to access, correct, restrict, or delete
                    their data and lodge complaints with the Information
                    Commissioner's Office (ICO).
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
