"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TextEffectProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextEffect({ text, className, delay = 0 }: TextEffectProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [currentIndex, text]);

  return (
    <span className={cn("inline-block", className)}>
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  );
}
