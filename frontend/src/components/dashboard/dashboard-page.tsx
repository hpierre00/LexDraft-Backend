"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Search, ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { useAuth } from "@/providers/auth-provider";

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  const displayName = user?.first_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          {`Good afternoon, ${displayName}!`}
        </h1>
        <p className="text-muted-foreground">What would you like to work on?</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-600" />
              Generate from scratch with AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-sm">
              <li>Create a bespoke agreement based on your needs</li>
              <li>Draft for any jurisdiction</li>
              <li>Get a complete document in 5-10 minutes</li>
            </ul>
            <Button asChild className="mt-4 w-full justify-between">
              <Link href="/create">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Import a document & use AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-sm">
              <li>Ask any question about your document</li>
              <li>Get AI to review your document</li>
              <li>Amend any clause with AI</li>
              <li>Ask AI to explain any clause</li>
            </ul>
            <Button
              asChild
              variant="outline"
              className="mt-4 w-full justify-between"
            >
              <Link href="/import">
                Upload document <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-600" />
              Search the template library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="ml-6 list-disc space-y-2 text-sm">
              <li>Search Genie&apos;s 500+ high-quality legal templates</li>
              <li>Create your own private template library</li>
            </ul>
            <Button
              asChild
              variant="outline"
              className="mt-4 w-full justify-between"
            >
              <Link href="/templates">
                Browse templates <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <StatsCards />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Documents</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/documents">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <RecentDocuments />
      </div>
    </div>
  );
}
