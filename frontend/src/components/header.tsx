"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { useAuth } from "@/providers/auth-provider";

export const HeroHeader = () => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">LexDraft</span>
        </Link>
        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <AnimatedGroup delay={100}>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </AnimatedGroup>
          ) : (
            <>
              <AnimatedGroup delay={100}>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
              </AnimatedGroup>
              <AnimatedGroup delay={200}>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </AnimatedGroup>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
