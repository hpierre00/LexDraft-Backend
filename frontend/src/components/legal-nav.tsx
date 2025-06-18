"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "company",
    title: "Company",
    options: [
      { label: "About", href: "/about" },
      { label: "Jurisdiction", href: "/jurisdiction" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    options: [
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function LegalNav() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <div
      className="relative flex items-center justify-center mb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className={cn(
            "transition-opacity duration-200",
            !isHovered && "opacity-0"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4">
            {steps[currentStep].title}
          </h3>
          <div className="flex gap-8">
            {steps[currentStep].options.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className="px-4 py-2 rounded-md hover:bg-accent transition-colors hover:text-[var(--lawverra-gold)] ml-6"
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className={cn(
            "transition-opacity duration-200",
            !isHovered && "opacity-0"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 mt-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors duration-200",
              index === currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}
