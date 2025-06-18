import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface LogoProps extends React.HTMLAttributes<HTMLAnchorElement> {
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md", ...props }: LogoProps) {
  const sizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
  };

  const { width, height } = sizes[size];

  return (
    <Link href="/" className={cn("flex items-center", className)} {...props}>
      <Image
        src="/logo.jpg"
        alt="Lawverra Logo"
        width={width}
        height={height}
        className="rounded-md"
      />
    </Link>
  );
}
