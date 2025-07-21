import { HeroHeader } from "@/components/header";

export default function TermsPage() {
  return (
    <>
      <HeroHeader />
      <div className="bg-background text-foreground pt-20">
        <div className="container mx-auto py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-primary mb-6">
              Terms of Service
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: October 26, 2023
            </p>
            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
              <p>
                Welcome to Lawverra. These Terms of Service ("Terms") govern
                your use of our website and services. By accessing or using our
                platform, you agree to be bound by these Terms.
              </p>

              <h2>1. Use of Our Services</h2>
              <p>
                You must be at least 18 years old to use our services. You are
                responsible for your account and all activities that occur under
                it. You may not use our services for any illegal or unauthorized
                purpose.
              </p>

              <h2>2. Intellectual Property</h2>
              <p>
                All content on our platform, including text, graphics, logos,
                and software, is the property of Lawverra or its licensors and
                is protected by copyright and other intellectual property laws.
              </p>

              <h2>3. Disclaimers</h2>
              <p>
                Our services are provided "as is" without any warranties,
                express or implied. We do not warrant that our services will be
                uninterrupted, error-free, or secure.
              </p>

              <h2>4. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Lawverra shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, or any loss of profits or revenues.
              </p>

              <h2>5. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the State of New York, without regard to its
                conflict of law principles.
              </p>

              <h2>6. Changes to These Terms</h2>
              <p>
                We may modify these Terms from time to time. We will notify you
                of any changes by posting the new Terms on this page. Your
                continued use of our services after any changes constitutes your
                acceptance of the new Terms.
              </p>

              <h2>7. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please{" "}
                <a href="/contact">contact us</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
