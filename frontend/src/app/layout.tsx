'use client';

import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/api/auth";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const token = authService.isAuthenticated();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (token && isAuthPage) {
      router.replace('/dashboard');
    }
  }, [pathname, router]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <SidebarProvider>
              <div className="flex min-h-screen">
                {!isAuthPage && <AppSidebar />}
                <main className={isAuthPage ? "w-full" : "ml-64"}>
                  {children}
                </main>
              </div>
              <Toaster />
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
