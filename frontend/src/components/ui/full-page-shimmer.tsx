"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function FullPageShimmer() {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Animated Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-primary/30 to-primary/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Sidebar Shimmer */}
      <div className="hidden w-64 flex-col border-r border-border/50 bg-card/80 backdrop-blur-sm p-4 md:flex relative z-10">
        <div className="flex items-center justify-between h-16 mb-6">
          <div className="relative">
            <Skeleton className="h-8 w-32 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 animate-shimmer" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide"></div>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="relative">
              <Skeleton className="h-10 w-full bg-gradient-to-r from-muted via-muted/70 to-muted animate-shimmer rounded-lg" />
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide rounded-lg"
                style={{ animationDelay: `${index * 0.2}s` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center space-x-3 p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl">
          <div className="relative">
            <Skeleton className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full animate-spin-slow"></div>
          </div>
          <div className="relative flex-1">
            <Skeleton className="h-4 w-24 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col relative z-10">
        {/* Header Shimmer */}
        <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-card/80 backdrop-blur-sm px-4 md:px-6">
          <div className="relative">
            <Skeleton className="h-8 w-48 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 animate-shimmer" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide"></div>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="relative">
              <Skeleton className="h-10 w-32 rounded-lg bg-gradient-to-r from-muted via-muted/70 to-muted animate-shimmer" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide rounded-lg"></div>
            </div>
          </div>
          <div className="relative">
            <Skeleton className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full animate-spin-slow"></div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8">
          {/* Enhanced Header Card Shimmer */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl blur-3xl animate-pulse"></div>
            <div className="relative p-6 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="relative">
                    <Skeleton className="h-10 w-80 bg-gradient-to-r from-primary/30 via-primary/40 to-primary/30 animate-shimmer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide"></div>
                  </div>
                  <div className="relative">
                    <Skeleton className="h-6 w-96 bg-gradient-to-r from-muted via-muted/60 to-muted animate-shimmer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide delay-300"></div>
                  </div>
                </div>
                <div className="relative">
                  <Skeleton className="h-12 w-40 rounded-lg bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 animate-shimmer" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-slide rounded-lg delay-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="relative overflow-hidden bg-gradient-to-br from-card/80 to-muted/20 border border-border/50 rounded-2xl shadow-xl backdrop-blur-sm"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
                <div className="relative p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                      <Skeleton className="h-6 w-32 bg-gradient-to-r from-muted via-muted/60 to-muted animate-shimmer" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide"></div>
                    </div>
                    <div className="relative">
                      <Skeleton className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl animate-spin-slow"></div>
                    </div>
                  </div>
                  <div className="relative mb-4">
                    <Skeleton className="h-12 w-20 bg-gradient-to-r from-primary/40 via-primary/50 to-primary/40 animate-shimmer" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide delay-200"></div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, badgeIndex) => (
                      <div key={badgeIndex} className="relative">
                        <Skeleton className="h-6 w-24 rounded-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer" />
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide rounded-full"
                          style={{ animationDelay: `${badgeIndex * 0.3}s` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Tabs Shimmer */}
          <div className="space-y-6">
            <div className="relative">
              <div className="grid grid-cols-4 gap-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2 shadow-lg">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="relative">
                    <Skeleton className="h-10 w-full rounded-lg bg-gradient-to-r from-muted via-muted/60 to-muted animate-shimmer" />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide rounded-lg"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="grid gap-6 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="relative bg-gradient-to-br from-card/80 to-muted/20 border border-border/50 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-xl animate-pulse"></div>
                  <div className="relative p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="relative">
                        <Skeleton className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-purple-500/30 animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl animate-spin-slow"></div>
                      </div>
                      <div className="relative">
                        <Skeleton className="h-6 w-40 bg-gradient-to-r from-primary/30 via-primary/40 to-primary/30 animate-shimmer" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, itemIndex) => (
                        <div key={itemIndex} className="relative">
                          <Skeleton className="h-16 w-full rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer" />
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent animate-slide rounded-xl"
                            style={{ animationDelay: `${itemIndex * 0.2}s` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .animate-slide {
          animation: slide 2s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
