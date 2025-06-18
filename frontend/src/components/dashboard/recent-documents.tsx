"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { documentService, Document } from "@/api/documents";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/auth-provider";

export function RecentDocuments() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAuthInitialized } = useAuth();

  useEffect(() => {
    const getDocuments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const docs = await documentService.getAll();
        setDocuments(docs);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
        setError("Failed to load documents. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isAuthInitialized) {
      getDocuments();
    } else if (!isAuthenticated && isAuthInitialized) {
      setIsLoading(false);
      setDocuments([]);
    }
  }, [isAuthenticated, isAuthInitialized]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
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
    );
  }

  if (error) {
    return <div className="mt-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first document to get started
          </p>
          <Button asChild className="mt-4">
            <Link href="/create">Create document</Link>
          </Button>
        </div>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Link
                  href={`/documents/${doc.id}`}
                  className="font-medium hover:underline"
                >
                  {doc.title}
                </Link>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Updated {formatDate(doc.updated_at)}</span>
                  <span>•</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link href={`/documents/${doc.id}`} className="flex w-full">
                    Edit document
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await documentService.download(doc.id);
                      toast({
                        title: "Document downloaded",
                        description:
                          "Your document has been downloaded as a PDF.",
                      });
                    } catch (error) {
                      console.error("Failed to download document:", error);
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description:
                          "Failed to download document. Please try again.",
                      });
                    }
                  }}
                >
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem>Share document</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))
      )}
    </div>
  );
}
