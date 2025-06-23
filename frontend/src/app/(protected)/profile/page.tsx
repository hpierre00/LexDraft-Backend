import Link from "next/link";
import React from "react";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function ArchivedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Update Profile - Coming Soon!
      </h1>
      <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
        We are diligently working on bringing you a comprehensive Profile
        management system. Please check back later for updates.
      </p>
      <AnimatedGroup className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
        <div className="rounded-[calc(var(--radius-xl)+0.125rem)] p-0.5">
          <Button asChild size="lg" className="rounded-xl px-5 text-base">
            <Link href="/dashboard">
              <span className="text-nowrap">Go to Dashboard</span>
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </AnimatedGroup>
    </div>
  );
}
