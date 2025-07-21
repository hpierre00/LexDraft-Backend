import { LegalNav } from "@/components/legal-nav";
import { ContactForm } from "@/components/contact-form";
import { Logo } from "@/components/logo";
import { Button } from "./ui/button";
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-100 pt-16 pb-8">
      <div className="container mx-auto px-6 space-y-16">
        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>

        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* Logo and Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <Logo size="md" />
              <span className="text-2xl font-bold">Lawverra</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Revolutionizing the legal industry with AI-powered solutions that
              enhance efficiency, accuracy, and access to justice.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <a
                  href="https://github.com/m-jishnu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <a
                  href="https://twitter.com/mjishnu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <a
                  href="https://linkedin.com/in/m-jishnu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <LegalNav />
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-semibold text-slate-100">
              Get in Touch
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-slate-300" />
                <a
                  href="mailto:contact@lawverra.com"
                  className="text-slate-300 hover:text-slate-100 text-sm transition-colors"
                >
                  contact@lawverra.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-slate-300" />
                <span className="text-slate-300 text-sm">(123) 456-7890</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-slate-300 mt-0.5" />
                <span className="text-slate-300 text-sm">
                  123 Legal Tech Avenue
                  <br />
                  New York, NY 10001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Lawverra. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm">
              Built with ❤️ by the Lawverra Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
