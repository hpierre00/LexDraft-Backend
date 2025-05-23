"use client";

import { MainNav } from "@/components/layout/main-nav";

export function Navbar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav className="mx-6" />
      </div>
    </div>
  );
}
