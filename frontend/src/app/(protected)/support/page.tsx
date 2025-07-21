"use client";

import { SupportForm } from "@/components/support/SupportForm";
import {
  Shield,
  LifeBuoy,
  FileText,
  Mail,
  MessageCircle,
  Bug,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 space-y-8">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <LifeBuoy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Support & Feedback</h1>
                  <p className="text-xl text-white/90">
                    We're here to help you succeed
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  24/7 Support
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Mail className="h-3 w-3 mr-1" />
                  Quick Response
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Bug className="h-3 w-3 mr-1" />
                  Bug Reports
                </Badge>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <LifeBuoy className="h-12 w-12 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Form */}
      <SupportForm />

      {/* Additional Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-secondary/30 to-accent/20 p-6 rounded-xl border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Our Commitment
              </h3>
              <p className="text-muted-foreground">
                Your feedback is confidential and helps us improve. All reports
                are reviewed by our team within 24 hours.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-secondary/30 to-accent/20 p-6 rounded-xl border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">
                Need More Help?
              </h3>
              <p className="text-muted-foreground">
                Check our{" "}
                <a
                  href="/faq"
                  className="text-primary hover:underline font-medium"
                >
                  FAQ section
                </a>{" "}
                for common questions or review our{" "}
                <a
                  href="/terms"
                  className="text-primary hover:underline font-medium"
                >
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
