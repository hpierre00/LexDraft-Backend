import { Phone, Mail, MapPin } from "lucide-react";
import { HeroHeader } from "@/components/header";
import { ContactForm } from "@/components/contact-form-page";

export default function ContactPage() {
  return (
    <>
      <HeroHeader />
      <div className="bg-background text-foreground pt-20">
        <div className="container mx-auto py-16 px-6">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-extrabold text-primary tracking-tight">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're here to help with any questions you may have. Reach out to
              us, and we'll respond as soon as we can.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-secondary/30 p-8 rounded-lg border border-primary/20">
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Contact Information</h2>
              <p className="text-muted-foreground">
                Find us at our office, send us an email, or give us a call.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Email</h3>
                    <p className="text-muted-foreground">
                      General Inquiries:{" "}
                      <a
                        href="mailto:contact@lawverra.com"
                        className="text-primary hover:underline"
                      >
                        contact@lawverra.com
                      </a>
                    </p>
                    <p className="text-muted-foreground">
                      Support:{" "}
                      <a
                        href="mailto:support@lawverra.com"
                        className="text-primary hover:underline"
                      >
                        support@lawverra.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Phone</h3>
                    <p className="text-muted-foreground">(123) 456-7890</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Office</h3>
                    <p className="text-muted-foreground">
                      123 Legal Tech Avenue, Suite 400
                      <br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
