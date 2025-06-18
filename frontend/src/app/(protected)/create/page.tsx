"use client";

import { CreateDocument } from "@/components/documents/create-document";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { templateService } from "@/api/templates";
import { useToast } from "@/components/ui/use-toast";

export default function CreatePage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const initialTitle = searchParams.get("title") || "";
  const templateId = searchParams.get("templateId");

  const [initialContent, setInitialContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplateContent() {
      if (templateId) {
        try {
          setLoading(true);
          const template = await templateService.getById(templateId);
          setInitialContent(template.content || "");
        } catch (err) {
          console.error("Failed to fetch template content:", err);
          setError("Failed to load template content.");
          toast({
            title: "Error",
            description:
              "Failed to load template content. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchTemplateContent();
  }, [templateId]);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <h1 className="mb-4 text-2xl font-semibold">Create Document</h1>
        <p>Loading template content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <h1 className="mb-4 text-2xl font-semibold">Create Document</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <h1 className="mb-4 text-2xl font-semibold">Create Document</h1>
      <CreateDocument
        initialTitle={initialTitle}
        initialContent={initialContent}
      />
    </div>
  );
}
