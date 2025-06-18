"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  FileText,
  ArrowRight,
  Download,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { aiService, type GenerateDocumentData } from "@/api/ai";
import { templateService, type Template } from "@/api/templates";
import { Combobox } from "@/components/ui/combobox";

interface ExtendedGenerateDocumentData extends GenerateDocumentData {
  template_id?: string;
}

export default function GenerateDocumentPage() {
  const [formData, setFormData] = useState<ExtendedGenerateDocumentData>({
    prompt: "",
    title: "",
    template_id: "",
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const router = useRouter();
  const { toast } = useToast();

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templateList = await templateService.getAll();
        setTemplates(templateList);
        console.log("Fetched templates:", templateList);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Error Loading Templates",
          description: "Failed to load available templates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  const handleInputChange = (
    field: keyof ExtendedGenerateDocumentData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template || null);
    handleInputChange("template_id", templateId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prompt.trim() || !formData.title.trim()) {
      toast({
        title: "Missing Information",
        description:
          "Please provide both a title and description for your document.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare data for API call
      const generateData: GenerateDocumentData & { template_id?: string } = {
        prompt: formData.prompt,
        title: formData.title,
      };

      // Add optional fields if selected
      if (formData.template_id) {
        generateData.template_id = formData.template_id;
      }
      if (selectedTemplate?.document_types?.document_type_id) {
        generateData.document_type_id =
          selectedTemplate.document_types.document_type_id;
      }
      if (selectedTemplate?.states?.state_id) {
        generateData.state_id = selectedTemplate.states.state_id;
      }

      const result = await aiService.generateDocument(generateData);

      toast({
        title: "Document Generated Successfully!",
        description: "Your document has been created and is ready for review.",
      });

      // Redirect to the generated document
      router.push(`/documents/${result.id}`);
    } catch (error) {
      console.error("Error generating document:", error);
      toast({
        title: "Generation Failed",
        description:
          "There was an error generating your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadTemplate = async (templateId: string) => {
    try {
      const { blob, filename } = await templateService.downloadTemplate(
        templateId
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading template:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = formData.prompt.trim() && formData.title.trim();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-emerald-600" />
          Generate with AI
        </h1>
        <p className="text-muted-foreground mt-2">
          Create professional legal documents using artificial intelligence.
          Optionally select a template as a starting point.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Details
              </CardTitle>
              <CardDescription>
                Provide the details for your document generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Employment Agreement - Software Engineer"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template (Optional)</Label>
                  <Combobox
                    options={[
                      {
                        value: "no_template",
                        label: "No template (Generate from scratch)",
                      },
                      ...templates.map((template) => ({
                        value: template.id,
                        label: template.template_name,
                        data: template,
                      })),
                    ]}
                    value={formData.template_id}
                    onValueChange={handleTemplateSelect}
                    placeholder={
                      isLoadingTemplates
                        ? "Loading templates..."
                        : "Select a template"
                    }
                    emptyMessage="No template found."
                    disabled={isGenerating || isLoadingTemplates}
                  />
                  {selectedTemplate && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadTemplate(selectedTemplate.id)
                        }
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Preview Template
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Document Description *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the document you want to generate. Include specific requirements, terms, conditions, and any other relevant details..."
                    value={formData.prompt}
                    onChange={(e) =>
                      handleInputChange("prompt", e.target.value)
                    }
                    disabled={isGenerating}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be as specific as possible. Include parties involved, key
                    terms, special conditions, and any other requirements.
                    {selectedTemplate &&
                      " The AI will use your selected template as a starting point."}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Document...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Document
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">
                    {selectedTemplate.template_name}
                  </h4>
                  <div className="flex gap-2 mt-2">
                    {selectedTemplate.document_types && (
                      <Badge variant="secondary">
                        {selectedTemplate.document_types.document_type_name}
                      </Badge>
                    )}
                    {selectedTemplate.states && (
                      <Badge variant="outline">
                        {selectedTemplate.states.state_name}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  The AI will use this template as a foundation and customize it
                  based on your description.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  Be Specific
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Include specific details about parties, terms, and conditions
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  Use Templates
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Select a template for better structure and compliance
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  Include Context
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Mention the business context and purpose of the document
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
