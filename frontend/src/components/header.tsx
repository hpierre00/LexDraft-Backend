"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User2, LogOut, Settings, User } from "lucide-react";

export const HeroHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Don't show this header on protected routes
  const isProtectedRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/documents") ||
    pathname?.startsWith("/create") ||
    pathname?.startsWith("/templates") ||
    pathname?.startsWith("/projects") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/evaluate") ||
    pathname?.startsWith("/settings");

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Don't render on protected routes
  if (isProtectedRoute) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b bg-background/80 backdrop-blur-sm transition-all duration-200",
        isScrolled && "bg-background/95"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo size="sm" />
          <span className="text-xl font-bold">Lawverra</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <AnimatedGroup delay={100}>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User2 className="h-4 w-4" />
                      <span className="hidden md:inline">
                        {user?.first_name || user?.email || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
