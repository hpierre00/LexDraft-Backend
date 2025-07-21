import { HeroHeader } from "@/components/header";

export default function DisclaimerPage() {
  return (
    <>
      <HeroHeader />
      <div className="bg-background text-foreground pt-20">
        <div className="container mx-auto py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-primary mb-6">
              Disclaimer
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: October 26, 2023
            </p>
            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
              <p>
                The information provided by Lawverra on our website and platform
                is for general informational purposes only. All information is
                provided in good faith; however, we make no representation or
                warranty of any kind, express or implied, regarding the
                accuracy, adequacy, validity, reliability, availability, or
                completeness of any information.
              </p>

              <h2>Not Legal Advice</h2>
              <p>
                The information provided by Lawverra is not legal advice. The
                use of our services does not create an attorney-client
                relationship. You should not act or refrain from acting based on
                information obtained from our services without seeking
                professional legal counsel.
              </p>

              <h2>No Guarantees</h2>
              <p>
                We do not guarantee any specific results from the use of our
                services. Your use of our services is at your own risk.
              </p>

              <h2>External Links</h2>
              <p>
                Our services may contain links to other websites or content
                belonging to or originating from third parties. We do not
                warrant, endorse, guarantee, or assume responsibility for the
                accuracy or reliability of any information offered by
                third-party websites.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Disclaimer, please{" "}
                <a href="/contact">contact us</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
