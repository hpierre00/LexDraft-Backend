"use client";

import { useState } from "react";
import {
  CheckSquare,
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const upcomingFeatures = [
    {
      icon: CheckSquare,
      title: "Task Creation & Management",
      description: "Create, assign, and track legal tasks with deadlines",
      color: "from-blue-500 to-blue-600",
      features: [
        "Create custom tasks",
        "Set due dates & priorities",
        "Assign to team members",
        "Progress tracking",
      ],
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Sync tasks with your calendar and get reminders",
      color: "from-green-500 to-green-600",
      features: [
        "Calendar sync",
        "Smart reminders",
        "Meeting scheduling",
        "Deadline alerts",
      ],
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Collaborate on tasks with team members",
      color: "from-purple-500 to-purple-600",
      features: [
        "Team assignments",
        "Real-time updates",
        "Comments & notes",
        "File attachments",
      ],
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Track productivity and task completion rates",
      color: "from-orange-500 to-orange-600",
      features: [
        "Productivity metrics",
        "Completion rates",
        "Time tracking",
        "Custom reports",
      ],
    },
  ];

  const mockTasks = [
    {
      id: 1,
      title: "Review Service Agreement",
      priority: "High",
      dueDate: "Today",
      assignee: "You",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Draft Partnership Contract",
      priority: "Medium",
      dueDate: "Tomorrow",
      assignee: "Legal Team",
      status: "Pending",
    },
    {
      id: 3,
      title: "Update Privacy Policy",
      priority: "Medium",
      dueDate: "Next Week",
      assignee: "Compliance",
      status: "Not Started",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">Task Management</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Organize and track your legal workflow efficiently
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled
          />
        </div>
      </div>

      {/* Coming Soon Banner */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
        <CardHeader className="relative z-10 text-center pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl lg:text-3xl mb-2">
            Task Management Coming Soon! 🚀
          </CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            We're building a powerful task management system to help you organize your legal workflow, 
            collaborate with your team, and never miss important deadlines.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 text-center pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
              <Star className="h-4 w-4 mr-1" />
              Premium Feature
            </Badge>
            <Badge className="bg-muted text-muted-foreground px-4 py-2">
              <Clock className="h-4 w-4 mr-1" />
              Expected: Q2 2025
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          {/* Mock Task Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Tasks
                <Badge variant="secondary" className="ml-auto">
                  Preview
                </Badge>
              </CardTitle>
              <CardDescription>
                This is how your tasks will be organized and displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 opacity-60"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 border-2 border-primary/50 rounded"></div>
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Due: {task.dueDate}</span>
                          <span>•</span>
                          <span>{task.assignee}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.priority === "High"
                            ? "destructive"
                            : task.priority === "Medium"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                  <CheckSquare className="h-5 w-5 mr-2" />
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">12</div>
                <p className="text-sm text-blue-600 dark:text-blue-400">3 completed this week</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800 dark:text-green-200">87%</div>
                <p className="text-sm text-green-600 dark:text-green-400">Above average</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                  <Clock className="h-5 w-5 mr-2" />
                  Due Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">2</div>
                <p className="text-sm text-orange-600 dark:text-orange-400">1 overdue</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {/* Upcoming Features */}
          <div className="grid gap-6 sm:grid-cols-2">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`}
                />
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {feature.title}
                      </CardTitle>
                      <CardDescription>
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Stay Updated</CardTitle>
          <CardDescription className="text-white/90">
            Be the first to know when task management features are available
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="secondary" size="lg" disabled>
            <Star className="h-4 w-4 mr-2" />
            Get Notified
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 