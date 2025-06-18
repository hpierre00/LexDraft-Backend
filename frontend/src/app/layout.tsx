import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faviconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="#c9a55c" viewBox="0 0 24 24" stroke="#0a1e3a">
      <path fillRule="evenodd" clipRule="evenodd" d="M3 6a3 3 0 013-3h4.586a2 2 0 011.414.586l1.414 1.414a2 2 0 001.414.586H18a3 3 0 013 3v9a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm15 2H6a1 1 0 00-1 1v7a1 1 0 001 1h12a1 1 0 001-1V9a1 1 0 00-1-1z" />
    </svg>
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Lawverra - Legal Assistant</title>
        <meta
          name="description"
          content="Smarter Contracts. Faster Decisions."
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`data:image/svg+xml,${encodeURIComponent(faviconSVG)}`}
        />
        {/* Add Toast UI Editor CSS */}
        <link
          rel="stylesheet"
          href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
