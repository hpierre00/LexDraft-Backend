"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { documentService, Document } from "@/api/documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getDocuments = async () => {
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

    getDocuments();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, index) => (
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
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <Button asChild>
          <Link href="/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Document
          </Link>
        </Button>
      </div>

      <Input
        placeholder="Search documents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {filteredDocuments.length === 0 && documents.length > 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            No documents found for your search
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search terms.
          </p>
        </div>
      ) : filteredDocuments.length === 0 && documents.length === 0 ? (
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="flex flex-col">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="hover:underline"
                  >
                    {doc.title}
                  </Link>
                </CardTitle>
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
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex w-full"
                      >
                        Edit document
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Download PDF</DropdownMenuItem>
                    <DropdownMenuItem>Share document</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Delete document
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Updated {formatDate(doc.updated_at)}
                </p>
                {/* You might want to add a truncated content preview here if available from API */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
