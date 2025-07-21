"use client";

import type React from "react";
import { usePathname } from "next/navigation";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProtectedHeader } from "@/components/protected-header";
import { FloatingChatButton } from "@/components/floating-chat-button";
import FooterSection from "@/components/footer";
import { useAuth } from "@/providers/auth-provider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname === "/chat" || pathname==="/legal-research" || pathname==="/analytics";

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <ProtectedHeader />
          <div className="flex-1 p-4">{children}</div>
          {!isChatPage && <FooterSection />}
        </SidebarInset>
        <FloatingChatButton />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
