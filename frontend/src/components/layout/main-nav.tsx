"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

const routes = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/documents",
    label: "Documents",
  },
  {
    href: "/settings",
    label: "Settings",
  },
];

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === route.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
