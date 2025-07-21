"use client";

import {
  FileText,
  Home,
  PlusCircle,
  Settings,
  Archive,
  BookOpen,
  User2,
  LogOut,
  Sparkles,
  Scale,
  Users,
  BarChart3,
  Zap,
  Star,
  ChevronRight,
  Search,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/logo";

export function AppSidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      badge: null,
    },
    {
      title: "Smart Drafting",
      href: "/generate",
      icon: Sparkles,
      badge: { text: "AI", variant: "default" as const },
    },
    {
      title: "Evaluate Document",
      href: "/evaluate",
      icon: Scale,
      badge: { text: "New", variant: "secondary" as const },
    },
    {
      title: "Enhance with AI",
      href: "/enhance",
      icon: Zap,
      badge: { text: "AI", variant: "default" as const },
    },
    {
      title: "Legal Research",
      href: "/legal-research",
      icon: Search,
      badge: { text: "AI", variant: "default" as const },
    },
    {
      title: "My Documents",
      href: "/documents",
      icon: FileText,
      badge: null,
    },
    {
      title: "Teams",
      href: "/teams",
      icon: Users,
      badge: null,
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      badge: { text: "Soon", variant: "secondary" as const },
    },
    {
      title: "Template Library",
      href: "/templates",
      icon: BookOpen,
      badge: { text: "500+", variant: "outline" as const },
    },
  ];

  const quickActions = [
    {
      title: "Create Document",
      href: "/create",
      icon: PlusCircle,
    },
    {
      title: "Client Management",
      href: "/clients",
      icon: Users,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
  ];

  const projectItems = [
    {
      title: "Active Projects",
      href: "/projects/active",
      icon: FileText,
      count: 5,
    },
    {
      title: "Archived Projects",
      href: "/projects/archived",
      icon: Archive,
      count: 12,
    },
  ];

  return (
    <Sidebar className="border-r-2 border-primary/10 overflow-hidden">
      <SidebarHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 overflow-hidden">
        <Link href="/dashboard" className="block">
          <div className="flex items-center gap-3 px-4 py-4 hover:bg-primary/5 rounded-lg transition-colors min-w-0">
            <Logo size="lg" className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent truncate block">
                Lawverra
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary border-primary/20 flex-shrink-0"
                >
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 overflow-y-auto overflow-x-hidden">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className="group relative overflow-hidden hover:bg-primary/5 data-[active=true]:bg-primary/10 data-[active=true]:border-primary/20 data-[active=true]:shadow-sm rounded-lg transition-all duration-200"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 min-w-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                          isActive(item.href)
                            ? "bg-primary/20 text-primary"
                            : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium flex-1 truncate">
                        {item.title}
                      </span>
                      {item.badge && (
                        <Badge
                          variant={item.badge.variant}
                          className="text-xs flex-shrink-0"
                        >
                          {item.badge.text}
                        </Badge>
                      )}
                      {isActive(item.href) && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-primary/10" />

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-2">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {quickActions.map(
                (item) =>
                  // Conditionally render the analytics link
                  (item.href !== "/analytics" || user?.is_admin) && (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        className="group hover:bg-primary/5 data-[active=true]:bg-primary/10 rounded-lg transition-all duration-200"
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2 min-w-0"
                        >
                          <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-data-[active=true]:text-primary flex-shrink-0" />
                          <span className="text-sm font-medium truncate flex-1">
                            {item.title}
                          </span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary/70 flex-shrink-0" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-primary/10" />

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-2 flex items-center justify-between">
            <span className="truncate">Projects</span>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {projectItems.reduce((acc, item) => acc + item.count, 0)}
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className="group hover:bg-primary/5 data-[active=true]:bg-primary/10 rounded-lg transition-all duration-200"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 min-w-0"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-data-[active=true]:text-primary flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">
                        {item.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-muted/50 flex-shrink-0"
                      >
                        {item.count}
                      </Badge>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Upgrade Card */}
        <div className="mt-auto mb-4 mx-2">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground truncate">
                  Unlock advanced features
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-xs"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-primary/20 bg-gradient-to-r from-secondary/30 to-accent/20 p-2 overflow-hidden">
        <SidebarMenu className="space-y-1">
          {/* User Profile */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/profile")}
              className="group hover:bg-primary/5 data-[active=true]:bg-primary/10 rounded-lg transition-all duration-200"
            >
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2.5 min-w-0"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.first_name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarSeparator className="my-2 bg-primary/10" />

          {/* Theme Toggle */}
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggleSimple />
            </div>
          </SidebarMenuItem>

          <SidebarSeparator className="my-2 bg-primary/10" />

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="group text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3 px-3 py-2 min-w-0">
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
