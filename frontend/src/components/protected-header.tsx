"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import {
  User,
  LogOut,
  Settings,
  User2,
  Bell,
  Search,
  PanelLeft,
  LifeBuoy,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/logo";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

export function ProtectedHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="flex h-16 shrink-0 sticky top-0 items-center gap-3 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      {/* Custom Sidebar Trigger */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="hover:bg-primary/5 -ml-1"
      >
        <SidebarTrigger>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <PanelLeft className="h-4 w-4 text-primary" />
          </div>
          <span className="sr-only">Toggle Sidebar</span>
        </SidebarTrigger>
      </Button>

      <Separator orientation="vertical" className="mr-2 h-4 bg-primary/20" />

      {/* Logo/Brand */}
      <div className="flex items-center gap-2">
        <Logo size="md" />
        <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Lawverra
        </span>
        <Badge
          variant="secondary"
          className="text-xs bg-primary/10 text-primary border-primary/20"
        >
          AI-Powered
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search documents, templates..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-colors"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <NotificationDropdown />

        {/* Chat Link */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="relative hover:bg-primary/5"
        >
          <Link href="/chat">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
          </Link>
        </Button>

        {/* Support Link */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="relative hover:bg-primary/5"
        >
          <Link href="/support">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <LifeBuoy className="h-4 w-4 text-primary" />
            </div>
          </Link>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggleSimple />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-primary/5"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User2 className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden md:inline font-medium">
                {user?.first_name || user?.email?.split("@")[0] || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">
                {user?.first_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
