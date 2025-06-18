"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Star,
  StarOff,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { templateService, Template } from "@/api/templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function TemplateLibrary() {
  const { toast } = useToast();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<
    { id: string; name: string; document_type_id?: string }[]
  >([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Display 9 templates per page

  useEffect(() => {
    const fetchTemplatesAndCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get document_type_id for the active category
        const selectedCategory = categories.find(
          (cat) => cat.id === activeCategory
        );
        const documentTypeId =
          activeCategory === "all"
            ? undefined
            : selectedCategory?.document_type_id;

        const fetchedTemplates = await templateService.listWithFilters(
          undefined, // state_id
          documentTypeId, // document_type_id
          searchQuery // search
        );
        setTemplates(fetchedTemplates);

        // Only set categories once to avoid re-rendering issues and fetching states/document types
        if (categories.length === 0) {
          const uniqueCategories = new Set<string>();
          const tempCategories: {
            id: string;
            name: string;
            document_type_id?: string;
          }[] = [{ id: "all", name: "All Templates" }];

          fetchedTemplates.forEach((template) => {
            if (
              template.document_types?.document_type_name &&
              !uniqueCategories.has(template.document_types.document_type_name)
            ) {
              uniqueCategories.add(template.document_types.document_type_name);
              tempCategories.push({
                id: template.document_types.document_type_name
                  .toLowerCase()
                  .replace(/\s/g, "-"),
                name: template.document_types.document_type_name,
                document_type_id: template.document_types.document_type_id, // Store actual ID
              });
            }
          });
          setCategories(tempCategories);
        }

        setCurrentPage(1); // Reset to first page on new search/filter
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        setError("Failed to load templates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplatesAndCategories();
  }, [searchQuery, activeCategory]);

  const handleUseTemplate = (template: Template) => {
    // Navigate to the create document page with template data as query parameters
    router.push(
      `/create?title=${encodeURIComponent(
        template.template_name
      )}&templateId=${encodeURIComponent(template.id)}`
    );
    toast({
      title: "Template selected",
      description: `You are now using the ${template.template_name} template.`,
    });
  };

  const handleDownloadTemplate = async (template: Template) => {
    try {
      const { blob, filename } = await templateService.downloadTemplate(
        template.id
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename; // Use the extracted filename
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Template downloaded",
        description: `${template.template_name} has been downloaded.`, // Re-add description
      });
    } catch (error) {
      console.error("Failed to download template:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download template. Please try again.",
      });
    }
  };

  // Client-side pagination logic
  const indexOfLastTemplate = currentPage * itemsPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - itemsPerPage;
  const currentTemplates = useMemo(() => {
    // Memoize for performance
    return templates.slice(indexOfFirstTemplate, indexOfLastTemplate);
  }, [templates, indexOfFirstTemplate, indexOfLastTemplate]);

  const totalPages = Math.ceil(templates.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/templates/upload">Upload Template</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <label htmlFor="category-select" className="sr-only">
          Filter by category
        </label>
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentTemplates.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || activeCategory !== "all"
              ? "Try adjusting your search query or filters"
              : "No templates available in this category"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{template.template_name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.content.substring(0, 100)}...
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {template.document_types?.document_type_name}
                  </Badge>
                  <Badge variant="secondary">
                    {template.states?.state_name}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-6 py-3">
                <div className="text-sm text-muted-foreground">
                  Updated {new Date(template.updated_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadTemplate(template)}
                  >
                    <Download className="mr-1 h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => handleUseTemplate(template)}>
                    Use Template
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
