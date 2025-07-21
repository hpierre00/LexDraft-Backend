"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  Shield,
  Users, // Added Users icon for clients
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { documentService } from "@/api/documents";
import { templateService } from "@/api/templates";
import { clientService } from "@/api/clients"; // Import clientService
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCards() {
  const [totalDocuments, setTotalDocuments] = useState<number | null>(null);
  const [aiEvaluations, setAiEvaluations] = useState<number | null>(null); // State for AI Evaluations
  const [activeClients, setActiveClients] = useState<number | null>(null); // State for Active Clients/Projects
  const [savedTemplates, setSavedTemplates] = useState<number | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingEvaluations, setLoadingEvaluations] = useState(true); // Loading state for AI Evaluations
  const [loadingClients, setLoadingClients] = useState(true); // Loading state for clients
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    const getDocuments = async () => {
      try {
        const docs = await documentService.getAll();
        setTotalDocuments(docs.length);
        // Count AI Evaluations (documents with compliance_check_results)
        const evaluatedDocs = docs.filter(
          (doc) => doc.compliance_check_results
        );
        setAiEvaluations(evaluatedDocs.length);
      } catch (error) {
        console.error("Failed to fetch documents or evaluations:", error);
      } finally {
        setLoadingDocuments(false);
        setLoadingEvaluations(false);
      }
    };

    const getTemplates = async () => {
      try {
        const templates = await templateService.getAll();
        setSavedTemplates(templates.length);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    const getClients = async () => {
      try {
        const clients = await clientService.getAttorneyClients();
        setActiveClients(clients.length); // Assuming each client represents an active project or can have folders representing projects
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoadingClients(false);
      }
    };

    getDocuments();
    getTemplates();
    getClients();
  }, []);

  const stats = [
    {
      title: "Total Documents",
      value: totalDocuments,
      loading: loadingDocuments,
      icon: FileText,
      change: "+12%",
      changeType: "positive",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "AI Evaluations",
      value: aiEvaluations,
      loading: loadingEvaluations,
      icon: Shield,
      change: "+8%", // Placeholder
      changeType: "positive",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Templates Used",
      value: savedTemplates,
      loading: loadingTemplates,
      icon: Star,
      change: "+15%",
      changeType: "positive",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Time Saved",
      value: "47h", // Placeholder
      loading: false,
      icon: Clock,
      change: "+23%",
      changeType: "positive",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Success Rate",
      value: "98%", // Placeholder
      loading: false,
      icon: TrendingUp,
      change: "+2%",
      changeType: "positive",
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Active Projects",
      value: activeClients, // Using active clients as a proxy for projects
      loading: loadingClients,
      icon: BarChart3,
      change: "+1", // Placeholder
      changeType: "positive",
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="relative overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300 group"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            {stat.loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {stat.value !== null ? stat.value : "N/A"}
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    from last month
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
