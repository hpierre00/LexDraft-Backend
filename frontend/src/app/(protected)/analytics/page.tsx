"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { useAuth } from "@/providers/auth-provider";
import { UserProfile } from "@/api/auth";
import apiClient from "@/api/client";
import { FullPageShimmer } from "@/components/ui/full-page-shimmer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageSquare,
  Ticket,
  Shield,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  TrendingUp,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Sparkles,
  Globe,
  UserCheck,
  Zap,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Star,
} from "lucide-react";

interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface SupportTicket {
  id: number;
  user_id: string;
  type: string;
  subject: string;
  description: string;
  attachment_filename: string | null;
  attachment_content: string | null;
  created_at: string;
  status: string;
}

interface AnalyticsOverview {
  period_days: number;
  documents: {
    total: number;
    this_period: number;
    by_status: Record<string, number>;
    evaluated: number;
    enhanced: number;
    generated: number;
    templates_available: number;
  };
  users: {
    total: number;
    this_period: number;
    admins: number;
    attorneys: number;
    self_users: number;
    by_role: Record<string, number>;
  };
  engagement: {
    total_contacts: number;
    contacts_this_period: number;
    total_support_tickets: number;
    support_this_period: number;
    tickets_by_type: Record<string, number>;
    tickets_by_status: Record<string, number>;
  };
}

interface DailyActivity {
  date: string;
  documents_created: number;
  documents_evaluated: number;
  documents_enhanced: number;
  users_registered: number;
  contacts_submitted: number;
  support_tickets: number;
}

interface DocumentAnalytics {
  total_documents: number;
  document_types: Record<string, number>;
  status_breakdown: Record<string, number>;
  monthly_creation: Record<string, number>;
  compliance_results: Record<string, number>;
  top_users: Array<{ user_id: string; document_count: number }>;
  average_documents_per_user: number;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "attorney":
      return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-sm";
    case "admin":
      return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 shadow-sm";
    case "self":
      return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm";
    default:
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-sm";
  }
};

const getTicketTypeColor = (type: string) => {
  switch (type) {
    case "bug":
      return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 shadow-sm";
    case "feature":
      return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-sm";
    case "feedback":
      return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm";
    default:
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-sm";
  }
};

const getComplianceColor = (type: string) => {
  switch (type) {
    case "passed":
      return "bg-gradient-to-r from-green-400 to-green-600";
    case "warnings":
      return "bg-gradient-to-r from-yellow-400 to-orange-500";
    case "failed":
      return "bg-gradient-to-r from-red-400 to-red-600";
    default:
      return "bg-gradient-to-r from-gray-300 to-gray-400";
  }
};

const chartColors = [
  "hsl(var(--primary))", // Primary gold
  "hsl(215 70% 13%)", // Navy blue
  "hsl(142 71% 45%)", // Green
  "hsl(346 77% 49%)", // Red
  "hsl(35 91% 62%)", // Orange
  "hsl(262 52% 47%)", // Violet
  "hsl(173 58% 39%)", // Teal
  "hsl(39 30% 80%)", // Light gold
];

const AnimatedNumber = ({
  value,
  duration = 2000,
}: {
  value: number;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(
        Math.floor(startValue + (endValue - startValue) * easeOutQuart)
      );

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    updateValue();
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

const EnhancedBarChart = ({
  data,
  title,
  colors,
}: {
  data: Array<{ name: string; value: number }>;
  title: string;
  colors?: string[];
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const colorsToUse = colors || chartColors;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <span>{title}</span>
      </h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="group hover:bg-muted/30 p-2 rounded-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">
                {item.name}
              </span>
              <span className="text-sm font-bold text-primary">
                {item.value}
              </span>
            </div>
            <div className="relative">
              <Progress
                value={(item.value / maxValue) * 100}
                className="h-3 bg-muted"
                style={{
                  background: `linear-gradient(90deg, ${
                    colorsToUse[index % colorsToUse.length]
                  }15, ${colorsToUse[index % colorsToUse.length]}25)`,
                }}
              />
              <div
                className="absolute top-0 left-0 h-3 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: `linear-gradient(90deg, ${
                    colorsToUse[index % colorsToUse.length]
                  }, ${colorsToUse[(index + 1) % colorsToUse.length]})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EnhancedLineChart = ({
  data,
  title,
}: {
  data: DailyActivity[];
  title: string;
}) => {
  const last7Days = data.slice(-7);
  const maxValue = Math.max(
    ...last7Days.map(
      (d) => d.documents_created + d.users_registered + d.contacts_submitted
    ),
    1
  );

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
        <LineChart className="h-4 w-4 text-primary" />
        <span>{title}</span>
      </h4>
      <div className="space-y-3">
        {last7Days.map((day, index) => {
          const total =
            day.documents_created +
            day.users_registered +
            day.contacts_submitted;
          const percentage = maxValue > 0 ? (total / maxValue) * 100 : 0;

          return (
            <div
              key={index}
              className="group hover:bg-muted/20 p-2 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-sm font-bold text-primary">{total}</span>
              </div>
              <div className="relative">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              {/* Activity breakdown */}
              <div className="flex space-x-2 mt-1">
                {day.documents_created > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-muted-foreground">
                      {day.documents_created} docs
                    </span>
                  </div>
                )}
                {day.users_registered > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-xs text-muted-foreground">
                      {day.users_registered} users
                    </span>
                  </div>
                )}
                {day.contacts_submitted > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <span className="text-xs text-muted-foreground">
                      {day.contacts_submitted} contacts
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Lazy loading components for better performance
const OverviewTab = lazy(() =>
  Promise.resolve({
    default: ({
      overview,
      dailyActivity,
    }: {
      overview: AnalyticsOverview | null;
      dailyActivity: DailyActivity[];
    }) => (
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <LineChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Activity Trends
                </span>
                <p className="text-sm text-muted-foreground font-normal">
                  Last 7 days performance
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedLineChart
              data={dailyActivity}
              title="Daily Activity Breakdown"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Document Status
                </span>
                <p className="text-sm text-muted-foreground font-normal">
                  Workflow distribution
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview && (
              <EnhancedBarChart
                data={Object.entries(overview.documents.by_status).map(
                  ([name, value]) => ({ name, value })
                )}
                title="Status Breakdown"
                colors={[
                  "hsl(142 71% 45%)", // Green
                  "hsl(35 91% 62%)", // Orange
                  "hsl(var(--primary))", // Primary gold
                  "hsl(346 77% 49%)", // Red
                ]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    ),
  })
);

const DocumentsTab = lazy(() =>
  Promise.resolve({
    default: ({
      documentAnalytics,
    }: {
      documentAnalytics: DocumentAnalytics | null;
    }) => (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Document Categories
                </span>
                <p className="text-sm text-muted-foreground font-normal">
                  Distribution by type
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentAnalytics && (
              <EnhancedBarChart
                data={Object.entries(documentAnalytics.document_types).map(
                  ([name, value]) => ({ name, value })
                )}
                title="Document Types"
                colors={[
                  "hsl(142 71% 45%)", // Green
                  "hsl(var(--primary))", // Primary gold
                  "hsl(262 52% 47%)", // Violet
                  "hsl(35 91% 62%)", // Orange
                  "hsl(346 77% 49%)", // Red
                  "hsl(173 58% 39%)", // Teal
                ]}
              />
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Compliance Status
                </span>
                <p className="text-sm text-muted-foreground font-normal">
                  Analysis results
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentAnalytics && (
              <div className="space-y-4">
                {Object.entries(documentAnalytics.compliance_results).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="group hover:bg-muted/20 p-3 rounded-xl transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded-full shadow-sm ${getComplianceColor(
                              status
                            )}`}
                          ></div>
                          <span className="capitalize font-medium text-foreground">
                            {status.replace("_", " ")}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="font-bold px-3 py-1"
                        >
                          {count}
                        </Badge>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    ),
  })
);

const UsersTab = lazy(() =>
  Promise.resolve({
    default: ({ users }: { users: UserProfile[] }) => (
      <Card className="bg-gradient-to-br from-slate-50/50 to-gray-50/50 border-slate-200/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg shadow-md">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
                User Management
              </span>
              <p className="text-sm text-muted-foreground font-normal">
                Platform user overview
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {users.map((userData) => (
              <div
                key={userData.id}
                className="group hover:bg-muted/30 p-4 rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/20 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-bold">
                        {getInitials(userData.full_name || userData.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">
                        {userData.full_name || "No name provided"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {userData.email}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Joined{" "}
                          {new Date(userData.created_at).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {userData.is_admin && (
                      <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 shadow-sm">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                    <Badge className={getRoleColor(userData.role || "self")}>
                      <UserCheck className="mr-1 h-3 w-3" />
                      {userData.role || "self"}
                    </Badge>
                    {userData.profile_setup_complete ? (
                      <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-sm">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
  })
);

const SupportTab = lazy(() =>
  Promise.resolve({
    default: ({
      contacts,
      supportTickets,
    }: {
      contacts: Contact[];
      supportTickets: SupportTicket[];
    }) => (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Contact Messages
                </span>
                <p className="text-sm text-muted-foreground font-normal">
                  Latest inquiries
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            <div className="space-y-4">
              {contacts.slice(0, 5).map((contact) => (
                <div
                  key={contact.id}
                  className="group hover:bg-muted/20 p-4 rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/10 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 ring-2 ring-green-200 shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 font-semibold text-xs">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {contact.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground pl-13 leading-relaxed">
                    {contact.message.length > 100
                      ? `${contact.message.substring(0, 100)}...`
                      : contact.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 border-rose-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg shadow-md">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Support Tickets
                </span>
                <p className="text-sm text-muted-foreground font-normal">
                  Active requests
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            <div className="space-y-4">
              {supportTickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="group hover:bg-muted/20 p-4 rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/10 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">
                        {ticket.subject}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTicketTypeColor(ticket.type)}>
                          {ticket.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ticket.description.length > 80
                      ? `${ticket.description.substring(0, 80)}...`
                      : ticket.description}
                  </p>
                  {ticket.attachment_filename && (
                    <div className="mt-3 flex items-center space-x-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                      <FileText className="h-3 w-3" />
                      <span>{ticket.attachment_filename}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  })
);

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [documentAnalytics, setDocumentAnalytics] =
    useState<DocumentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?.is_admin) {
      const fetchBasicData = async () => {
        try {
          const [
            usersResponse,
            contactsResponse,
            supportTicketsResponse,
            overviewResponse,
          ] = await Promise.all([
            apiClient.get("/admin/users"),
            apiClient.get("/admin/contacts"),
            apiClient.get("/admin/support-tickets"),
            apiClient.get("/admin/analytics/overview?days=30"),
          ]);

          setUsers(usersResponse.data);
          setContacts(contactsResponse.data);
          setSupportTickets(supportTicketsResponse.data);
          setOverview(overviewResponse.data);
          setLoading(false);
        } catch (error) {
          console.error("Failed to fetch basic analytics data", error);
          setLoading(false);
        }
      };

      const fetchDetailedData = async () => {
        try {
          const [dailyActivityResponse, documentAnalyticsResponse] =
            await Promise.all([
              apiClient.get("/admin/analytics/daily-activity?days=30"),
              apiClient.get("/admin/analytics/documents"),
            ]);

          setDailyActivity(dailyActivityResponse.data);
          setDocumentAnalytics(documentAnalyticsResponse.data);
        } catch (error) {
          console.error("Failed to fetch detailed analytics data", error);
        }
      };

      fetchBasicData();
      setTimeout(fetchDetailedData, 100);
    }
  }, [user]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await apiClient.get(
        "/admin/analytics/export?format=json"
      );

      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Enhanced Header Loading */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl blur-3xl animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-30 animate-pulse"></div>

          <div className="relative flex items-center justify-between p-8 bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-2">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl shadow-lg backdrop-blur-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary/40 to-purple-500/40 rounded animate-pulse"></div>
                </div>
                <div className="relative">
                  <div className="w-80 h-12 bg-gradient-to-r from-primary/30 via-blue-600/30 to-purple-600/30 rounded animate-shimmer"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide"></div>
                </div>
              </div>
              <div className="relative ml-16">
                <div className="w-96 h-6 bg-gradient-to-r from-muted via-muted/60 to-muted rounded animate-shimmer"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide delay-300"></div>
              </div>
            </div>

            <div className="relative">
              <div className="w-40 h-12 bg-gradient-to-r from-primary/20 via-blue-600/20 to-purple-600/20 rounded-lg animate-shimmer"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-slide rounded-lg delay-500"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards Loading */}
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
                    <div className="w-32 h-6 bg-gradient-to-r from-muted via-muted/60 to-muted rounded animate-shimmer"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide"></div>
                  </div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-xl animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl animate-spin-slow"></div>
                  </div>
                </div>
                <div className="relative mb-4">
                  <div className="w-20 h-12 bg-gradient-to-r from-primary/40 via-primary/50 to-primary/40 rounded animate-shimmer"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide delay-200"></div>
                </div>
                <div className="flex space-x-2">
                  {Array.from({ length: 2 }).map((_, badgeIndex) => (
                    <div key={badgeIndex} className="relative">
                      <div className="w-20 h-6 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full animate-shimmer"></div>
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

        {/* Tabs Loading */}
        <div className="space-y-8">
          <div className="relative group/tabs">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-50 animate-pulse"></div>

            <div className="relative grid grid-cols-4 gap-1 bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="relative">
                  <div className="h-12 w-full bg-gradient-to-r from-muted via-muted/60 to-muted rounded-xl animate-shimmer"></div>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide rounded-xl"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Area Loading */}
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
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-xl animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl animate-spin-slow"></div>
                    </div>
                    <div className="relative">
                      <div className="w-40 h-6 bg-gradient-to-r from-primary/30 via-primary/40 to-primary/30 rounded animate-shimmer"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, itemIndex) => (
                      <div key={itemIndex} className="relative">
                        <div className="h-12 w-full bg-gradient-to-r from-muted via-muted/50 to-muted rounded-xl animate-shimmer"></div>
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

        {/* Floating Analytics Indicator */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-primary/90 to-blue-600/90 backdrop-blur-lg rounded-full px-6 py-3 shadow-2xl border border-white/20">
            <div className="relative">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <span className="text-white font-medium">Loading Analytics...</span>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          .animate-slide {
            animation: slide 2s infinite;
          }

          .animate-spin-slow {
            animation: spin 3s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-destructive" />
              <p className="text-destructive font-medium">
                You are not authorized to view this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalUsers = overview?.users.total || 0;
  const totalDocuments = overview?.documents.total || 0;
  const totalContacts = overview?.engagement.total_contacts || 0;
  const totalSupport = overview?.engagement.total_support_tickets || 0;

  return (
    <div className="flex-1 space-y-8 p-6 bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced Header */}
      <div className="relative group">
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl blur-3xl animate-pulse"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-tr from-purple-500/15 to-transparent rounded-full blur-xl animate-float delay-1000"></div>

        {/* Floating Particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-primary/40 to-purple-500/40 rounded-full animate-float opacity-60"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          ></div>
        ))}

        <div className="relative flex items-center justify-between p-8 bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl shadow-lg backdrop-blur-sm">
                <BarChart3 className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-shimmer">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-xl text-muted-foreground font-medium ml-16 opacity-80">
              Comprehensive insights into platform performance and user
              engagement
            </p>
            <div className="flex items-center space-x-2 mt-3 ml-16">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">
                System Status: Operational
              </span>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting}
            size="lg"
            className="relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 border-0 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group/button"
          >
            {/* Button Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-700"></div>

            <div className="relative flex items-center space-x-3">
              {exporting ? (
                <>
                  <Activity className="h-5 w-5 animate-spin" />
                  <span className="font-semibold">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 group-hover/button:animate-bounce" />
                  <span className="font-semibold">Export Analytics</span>
                </>
              )}
            </div>
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards - Reduced to 2 per row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-indigo-500/10 border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Platform Users
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-foreground mb-3">
              <AnimatedNumber value={totalUsers} />
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 shadow-sm">
                <Shield className="mr-1 h-3 w-3" />
                {overview?.users.admins || 0} Admins
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-sm">
                <UserCheck className="mr-1 h-3 w-3" />
                {overview?.users.attorneys || 0} Attorneys
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-600">
                +{overview?.users.this_period || 0} this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-pink-500/10 border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              Documents Created
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-foreground mb-3">
              <AnimatedNumber value={totalDocuments} />
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <Badge className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300 shadow-sm">
                <Eye className="mr-1 h-3 w-3" />
                {overview?.documents.evaluated || 0} Evaluated
              </Badge>
              <Badge className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300 shadow-sm">
                <Sparkles className="mr-1 h-3 w-3" />
                {overview?.documents.enhanced || 0} Enhanced
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-600">
                +{overview?.documents.this_period || 0} this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-green-600/5 to-emerald-500/10 border-green-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full blur-2xl"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              User Engagement
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-foreground mb-3">
              <AnimatedNumber value={totalContacts} />
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm">
                <MessageSquare className="mr-1 h-3 w-3" />
                Contacts
              </Badge>
              <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300 shadow-sm">
                <Ticket className="mr-1 h-3 w-3" />
                {totalSupport} Support
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-600">
                +
                {(overview?.engagement.contacts_this_period || 0) +
                  (overview?.engagement.support_this_period || 0)}{" "}
                this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-red-500/10 border-orange-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full blur-2xl"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              System Health
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-foreground mb-3">
              <AnimatedNumber
                value={overview?.documents.templates_available || 0}
              />
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <Badge className="bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border-indigo-300 shadow-sm">
                <Layers className="mr-1 h-3 w-3" />
                Templates
              </Badge>
              <Badge className="bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border-teal-300 shadow-sm">
                <Globe className="mr-1 h-3 w-3" />
                Multi-State
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-600">
                All systems operational
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <div className="relative group/tabs">
          {/* Tabs Background Effects */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover/tabs:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-xl animate-pulse"></div>

          <TabsList className="relative grid w-full grid-cols-4 gap-1 bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl py-2 pb-10 overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse rounded-2xl"></div>

            <TabsTrigger
              value="overview"
              className="relative overflow-hidden flex items-center justify-center space-x-2 py-4 px-6 rounded-xl transition-all duration-500 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:via-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-primary data-[state=active]:shadow-xl data-[state=active]:border data-[state=active]:border-primary/30 group/tab"
            >
              {/* Active tab shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-data-[state=active]/tab:translate-x-full transition-transform duration-700"></div>
              <BarChart3 className="h-5 w-5 group-data-[state=active]/tab:animate-pulse" />
              <span className="font-semibold">Overview</span>
            </TabsTrigger>

            <TabsTrigger
              value="documents"
              className="relative overflow-hidden flex items-center justify-center space-x-2 py-4 px-6 rounded-xl transition-all duration-500 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:via-green-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-emerald-600 data-[state=active]:shadow-xl data-[state=active]:border data-[state=active]:border-emerald-500/30 group/tab"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-data-[state=active]/tab:translate-x-full transition-transform duration-700"></div>
              <FileText className="h-5 w-5 group-data-[state=active]/tab:animate-pulse" />
              <span className="font-semibold">Documents</span>
            </TabsTrigger>

            <TabsTrigger
              value="users"
              className="relative overflow-hidden flex items-center justify-center space-x-2 py-4 px-6 rounded-xl transition-all duration-500 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:via-amber-500/20 data-[state=active]:to-yellow-500/20 data-[state=active]:text-orange-600 data-[state=active]:shadow-xl data-[state=active]:border data-[state=active]:border-orange-500/30 group/tab"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-data-[state=active]/tab:translate-x-full transition-transform duration-700"></div>
              <Users className="h-5 w-5 group-data-[state=active]/tab:animate-pulse" />
              <span className="font-semibold">Users</span>
            </TabsTrigger>

            <TabsTrigger
              value="support"
              className="relative overflow-hidden flex items-center justify-center space-x-2 py-4 px-6 rounded-xl transition-all duration-500 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500/20 data-[state=active]:via-pink-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-rose-600 data-[state=active]:shadow-xl data-[state=active]:border data-[state=active]:border-rose-500/30 group/tab"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-data-[state=active]/tab:translate-x-full transition-transform duration-700"></div>
              <Ticket className="h-5 w-5 group-data-[state=active]/tab:animate-pulse" />
              <span className="font-semibold">Support</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-24">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin delay-150"></div>
                  <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin delay-300"></div>
                </div>
              </div>
            }
          >
            <OverviewTab overview={overview} dailyActivity={dailyActivity} />
          </Suspense>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-24">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-500 rounded-full animate-spin delay-150"></div>
                  <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-teal-500 rounded-full animate-spin delay-300"></div>
                </div>
              </div>
            }
          >
            <DocumentsTab documentAnalytics={documentAnalytics} />
          </Suspense>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-24">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-amber-500 rounded-full animate-spin delay-150"></div>
                  <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin delay-300"></div>
                </div>
              </div>
            }
          >
            <UsersTab users={users} />
          </Suspense>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-24">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin delay-150"></div>
                  <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-red-500 rounded-full animate-spin delay-300"></div>
                </div>
              </div>
            }
          >
            <SupportTab contacts={contacts} supportTickets={supportTickets} />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Enhanced CSS Animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.6;
          }
          33% {
            transform: translateY(-10px) translateX(5px) rotate(120deg);
            opacity: 1;
          }
          66% {
            transform: translateY(5px) translateX(-5px) rotate(240deg);
            opacity: 0.8;
          }
        }

        @keyframes glow {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes slide-shimmer {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 5px hsl(var(--primary) / 0.3);
          }
          50% {
            box-shadow: 0 0 20px hsl(var(--primary) / 0.6),
              0 0 30px hsl(var(--accent) / 0.4);
          }
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s infinite ease-in-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-slide-shimmer {
          animation: slide-shimmer 2s infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        /* Enhanced hover effects */
        .group:hover .animate-float {
          animation-duration: 3s;
        }

        .group/button:hover .animate-bounce-subtle {
          animation-duration: 0.5s;
        }

        /* Gradient text animation */
        .animate-gradient-text {
          background-size: 200% auto;
          animation: shimmer 4s ease-in-out infinite;
        }

        /* Custom scrollbar for better aesthetics */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            hsl(var(--primary) / 0.6),
            hsl(var(--accent) / 0.6)
          );
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            hsl(var(--primary) / 0.8),
            hsl(var(--accent) / 0.8)
          );
        }
      `}</style>
    </div>
  );
}
