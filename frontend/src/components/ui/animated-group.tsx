"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function AnimatedGroup({
  children,
  className,
  delay = 0,
  staggerDelay = 100,
}: AnimatedGroupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}
