"use client";

import type React from "react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProtectedHeader } from "@/components/protected-header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <ProtectedHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min p-6 overflow-auto mt-4">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
