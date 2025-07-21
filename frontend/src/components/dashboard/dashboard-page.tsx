"use client";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Sparkles,
  FileText,
  BarChart3,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  BookOpen,
  Settings,
  Star,
  Target,
  Activity,
  CheckCircle,
  Plus,
  MessageCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { useAuth } from "@/providers/auth-provider";

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const displayName = user?.first_name || user?.email?.split("@")[0] || "User";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      icon: Sparkles,
      title: "Smart Drafting",
      description: "AI-powered document creation",
      href: "/generate",
      color: "from-blue-500 to-blue-600",
      features: [
        "Contract templates",
        "Legal memos",
        "Clause suggestions",
        "Instant generation",
      ],
    },
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Intelligent review and insights",
      href: "/evaluate",
      color: "from-green-500 to-green-600",
      features: [
        "Risk assessment",
        "Compliance check",
        "Key term extraction",
        "Legal analysis",
      ],
    },
    {
      icon: Upload,
      title: "Upload & Enhance",
      description: "Improve existing documents",
      href: "/enhance",
      color: "from-purple-500 to-purple-600",
      features: [
        "Document optimization",
        "Language enhancement",
        "Structure improvement",
        "Error detection",
      ],
    },
    {
      icon: MessageCircle,
      title: "AI Legal Chat",
      description: "Get instant legal guidance",
      href: "/chat",
      color: "from-indigo-500 to-indigo-600",
      features: [
        "Legal Q&A",
        "Case law research",
        "Document drafting help",
        "Real-time assistance",
      ],
    },
    {
      icon: Zap,
      title: "Document Enhance",
      description: "Polish and perfect your docs",
      href: "/enhance",
      color: "from-orange-500 to-orange-600",
      features: [
        "Grammar & style fixes",
        "Legal terminology",
        "Format optimization",
        "Professional polish",
      ],
    },
    {
      icon: Search,
      title: "Legal Research",
      description: "Comprehensive legal database",
      href: "/legal-research",
      color: "from-teal-500 to-teal-600",
      features: [
        "Case law search",
        "Statute research",
        "Precedent analysis",
        "Citation finder",
      ],
    },
  ];

  const recentActivity = [
    {
      action: "Contract Review",
      document: "Service Agreement.pdf",
      time: "2 hours ago",
      status: "completed",
    },
    {
      action: "Document Generated",
      document: "NDA Template",
      time: "4 hours ago",
      status: "completed",
    },
    {
      action: "Analysis Started",
      document: "Partnership Contract",
      time: "6 hours ago",
      status: "in-progress",
    },
  ];

  const upcomingTasks = [
    { task: "Review client contracts", due: "Today", priority: "high" },
    {
      task: "Draft partnership agreement",
      due: "Tomorrow",
      priority: "medium",
    },
    { task: "Update privacy policy", due: "Next week", priority: "medium" },
    { task: "Prepare legal memo", due: "This week", priority: "low" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 w-full max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4 sm:p-6 lg:p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="space-y-3 lg:space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  {getGreeting()}, {displayName}! 👋
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/90">
                  Ready to streamline your legal workflow today?
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                  <Zap className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  24/7 Available
                </Badge>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 xl:w-32 xl:h-32 bg-white/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-12 w-12 xl:h-16 xl:w-16 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl lg:text-2xl font-bold">Quick Actions</h2>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="self-start sm:self-auto"
          >
            <Link href="/help">
              <BookOpen className="h-4 w-4 mr-2" />
              View Guide
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group"
              tabIndex={0}
              style={{ textDecoration: "none" }}
            >
              <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer group h-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                />
                <CardHeader className="pb-3 lg:pb-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg">
                        {action.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {action.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="truncate">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full pointer-events-none opacity-80"
                    tabIndex={-1}
                    variant="default"
                    size="sm"
                  >
                    Get Started <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-primary/20 bg-gradient-to-r from-secondary/30 to-accent/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activity">
                  <span className="hidden sm:inline">View All</span>
                  <ArrowRight className="h-4 w-4 sm:ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.document}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs mt-1"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="border-primary/20 bg-gradient-to-r from-accent/20 to-secondary/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Upcoming Tasks
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Add Task</span>
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.due}</p>
                  </div>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "destructive"
                        : task.priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs flex-shrink-0"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <RecentDocuments />
    </div>
  );
}
