"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FullPageShimmer() {
  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Sidebar Shimmer */}
      <div className="hidden w-64 flex-col border-r bg-muted/40 p-4 md:flex">
        <div className="flex items-center justify-between h-16 mb-6">
          <Skeleton className="h-8 w-2/3" /> {/* Logo placeholder */}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" /> // Menu item placeholders
          ))}
        </div>
        <div className="mt-auto flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" /> {/* User avatar */}
          <Skeleton className="h-5 w-2/3" /> {/* Username */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header Shimmer */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Skeleton className="h-8 w-1/4" /> {/* Page Title or Menu Toggle */}
          <div className="flex-1">
            <Skeleton className="ml-auto h-8 w-1/3 rounded-md" />{" "}
            {/* Search bar */}
          </div>
          <Skeleton className="h-9 w-9 rounded-full" /> {/* User avatar */}
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center">
            <Skeleton className="h-8 w-1/3" /> {/* Main Title */}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 shadow-sm"
              >
                <Skeleton className="h-6 w-3/4 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full mt-6" />
              </div>
            ))}
          </div>

          <div>
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 rounded-lg border p-4"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
