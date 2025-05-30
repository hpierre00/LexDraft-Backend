"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toast";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
