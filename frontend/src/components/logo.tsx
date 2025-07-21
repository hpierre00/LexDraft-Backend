"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";

interface LogoProps extends React.HTMLAttributes<HTMLAnchorElement> {
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md", ...props }: LogoProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const sizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
  };

  const { width, height } = sizes[size];

  // Determine the appropriate link destination
  const getLogoHref = () => {
    // If we're on a protected route, link to dashboard
    if (
      pathname?.startsWith("/dashboard") ||
      pathname?.startsWith("/documents") ||
      pathname?.startsWith("/create") ||
      pathname?.startsWith("/templates") ||
      pathname?.startsWith("/projects") ||
      pathname?.startsWith("/profile") ||
      pathname?.startsWith("/evaluate") ||
      pathname?.startsWith("/settings") ||
      pathname?.startsWith("/support") ||
      pathname?.startsWith("/clients") ||
      pathname?.startsWith("/analytics") ||
      pathname?.startsWith("/enhance") ||
      pathname?.startsWith("/generate")
    ) {
      return "/dashboard";
    }

    // For authenticated users on public pages, link to dashboard
    if (isAuthenticated) {
      return "/dashboard";
    }

    // For unauthenticated users, link to home
    return "/";
  };

  return (
    <Link
      href={getLogoHref()}
      className={cn("flex items-center", className)}
      {...props}
    >
      <Image
        src="/logo.png"
        alt="Lawverra Logo"
        width={width}
        height={height}
        className="rounded-md"
      />
    </Link>
  );
}
