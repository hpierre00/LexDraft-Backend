"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function FloatingChatButton() {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // Hide the floating button if user is already on the chat page
  if (pathname === "/chat") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Subtle pulse ring */}
      <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary/20 animate-ping"></div>

      <Button
        asChild
        size="lg"
        className={cn(
          "relative min-w-14 min-h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "border-2 border-primary/20 hover:border-primary/30",
          "hover:scale-105 transform",
          isHovered && "scale-105"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href="/chat"
          className="flex items-center justify-center w-full h-full"
        >
          <MessageSquare className="h-6 w-6" />
        </Link>
      </Button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 bg-foreground text-background px-3 py-2 rounded-lg text-sm whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200">
          Chat with Lawverra AI
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
        </div>
      )}
    </div>
  );
}
