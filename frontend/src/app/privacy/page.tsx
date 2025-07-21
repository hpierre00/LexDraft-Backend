import { HeroHeader } from "@/components/header";

export default function PrivacyPage() {
  return (
    <>
      <HeroHeader />
      <div className="bg-background text-foreground pt-20">
        <div className="container mx-auto py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-primary mb-6">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground mb-8">
              Last updated: October 26, 2023
            </p>
            <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
              <p>
                Lawverra ("we," "our," or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                website and services.
              </p>

              <h2>1. Information We Collect</h2>
              <p>
                We may collect personal information that you provide to us, such
                as your name, email address, and payment information. We also
                collect non-personal information, such as your browser type and
                IP address.
              </p>

              <h2>2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and
                improve our services, as well as to communicate with you. We may
                also use your information to personalize your experience and to
                send you marketing communications.
              </p>

              <h2>3. How We Share Your Information</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to outside parties. This does not include trusted
                third parties who assist us in operating our website or
                conducting our business, so long as those parties agree to keep
                this information confidential.
              </p>

              <h2>4. Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures
                to help protect your personal information. While we have taken
                reasonable steps to secure the personal information you provide
                to us, please be aware that despite our efforts, no security
                measures are perfect or impenetrable.
              </p>

              <h2>5. Your Choices</h2>
              <p>
                You may opt out of receiving marketing communications from us at
                any time. You may also access, update, or delete your personal
                information by contacting us.
              </p>

              <h2>6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please{" "}
                <a href="/contact">contact us</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
