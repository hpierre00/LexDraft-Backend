"use client";

import { useState, useEffect } from "react";
import { FileText, Clock, Star, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { documentService } from "@/api/documents";
import { templateService } from "@/api/templates";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCards() {
  const [totalDocuments, setTotalDocuments] = useState<number | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<number | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    const getDocuments = async () => {
      try {
        const docs = await documentService.getAll();
        setTotalDocuments(docs.length);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoadingDocuments(false);
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

    getDocuments();
    getTemplates();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loadingDocuments ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{totalDocuments}</div>
          )}
          <p className="text-xs text-muted-foreground">+2 from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">+1 from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saved Templates</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loadingTemplates ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-bold">{savedTemplates}</div>
          )}
          <p className="text-xs text-muted-foreground">+3 from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2</div>
          <p className="text-xs text-muted-foreground">Same as last month</p>
        </CardContent>
      </Card>
    </div>
  );
}
