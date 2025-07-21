"use client";

import Link from "next/link";

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Security", href: "/security" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export function LegalNav() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Company Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100 border-b border-slate-700 pb-2">
          Company
        </h3>
        <ul className="space-y-3">
          {companyLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-slate-300 hover:text-slate-100 text-sm transition-colors duration-200 hover:translate-x-1 transform inline-block"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100 border-b border-slate-700 pb-2">
          Legal
        </h3>
        <ul className="space-y-3">
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-slate-300 hover:text-slate-100 text-sm transition-colors duration-200 hover:translate-x-1 transform inline-block"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
