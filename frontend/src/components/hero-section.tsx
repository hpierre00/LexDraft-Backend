"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import Image from "next/image";
import { HeroHeader } from "./header";

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-gradient-to-br from-primary/5 via-primary/2 to-transparent" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-gradient-to-br from-accent/8 via-accent/3 to-transparent [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-gradient-to-br from-muted/6 via-muted/2 to-transparent" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup>
                  <Link
                    href="/register"
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      Create an Account To Work With Us
                    </span>
                    <span className="block h-4 w-0.5 border-l border-border bg-border"></span>
                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedGroup>

                <TextEffect
                  text="Your AI Legal Assistant"
                  className="mt-8 text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                />
                <TextEffect
                  text="Draft Smarter. Achieve More."
                  className="mt-4 text-balance text-6xl md:text-7xl xl:text-[5.25rem]"
                  delay={1000}
                />
                <TextEffect
                  text="Use our AI legal assistant to create, revise, and manage professional documents — at a fraction of the time and cost."
                  className="mx-auto mt-8 max-w-2xl text-balance text-lg"
                  delay={2000}
                />

                <AnimatedGroup className="mt-12 mb-6 flex flex-col items-center justify-center gap-2 md:flex-row">
                  <div className="rounded-[calc(var(--radius-xl)+0.125rem)] p-0.5">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-xl px-5 text-base"
                    >
                      <Link href="/register">
                        <span className="text-nowrap">Start Building</span>
                        <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
