import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Lawverra",
  description: "Learn about Lawverra's mission and technology",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">
            About Lawverra
          </h1>

          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
                <p>
                  Lawverra is a modern legal technology platform powered by
                  artificial intelligence, designed to help legal professionals
                  streamline their entire contract lifecycle. From intelligent
                  drafting and clause-level analysis to real-time negotiation
                  and compliance review, Lawverra equips legal teams with the
                  tools they need to work faster, reduce risk, and operate more
                  efficiently.
                </p>

                <p>
                  Built for solo attorneys, boutique law firms, and in-house
                  legal departments at growing businesses, Lawverra delivers
                  reliable, role-specific automation without replacing
                  professional judgment. Our platform leverages advanced large
                  language models (LLMs), proprietary clause intelligence
                  engines, and secure workflows to support legal
                  decision-making—not substitute it.
                </p>

                <p>
                  We are committed to providing legally sound, ethically built
                  tools that enhance the work of human professionals. Lawverra
                  is not a law firm and does not offer legal advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
