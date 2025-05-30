import { Logo } from "@/components/logo";
import Link from "next/link";

const links = [
  {
    title: "Features",
    href: "#features",
  },
  {
    title: "Solutions",
    href: "#solutions",
  },
  {
    title: "Pricing",
    href: "#pricing",
  },
  {
    title: "Resources",
    href: "#resources",
  },
  {
    title: "Company",
    href: "#company",
  },
  {
    title: "Contact",
    href: "#contact",
  },
];

const legalLinks = [
  {
    title: "Privacy Policy",
    href: "/privacy",
  },
  {
    title: "Terms of Service",
    href: "/terms",
  },
  {
    title: "Cookie Policy",
    href: "/cookies",
  },
];

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Link href="/" aria-label="go home" className="mx-auto block size-fit">
          <Logo />
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-muted-foreground hover:text-primary block duration-150"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {legalLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-muted-foreground hover:text-primary block duration-150"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LexDraft. All rights reserved.</p>
          <p className="mt-2">AI-powered legal document generation platform.</p>
        </div>
      </div>
    </footer>
  );
}
