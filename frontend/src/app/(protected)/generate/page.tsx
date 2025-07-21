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
  Lightbulb,
  Target,
  Users,
  MapPin,
  Scale,
  BookOpen,
  CheckCircle,
  Zap,
  Brain,
  Star,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { aiService, type GenerateDocumentData } from "@/api/ai";
import { templateService, type Template } from "@/api/templates";
import { AreaOfLaw, DocumentType, type UUID } from "@/lib/types";
import { authService, type UserProfile } from "@/api/auth";
import { clientService, type ClientProfileResponse } from "@/api/clients";

interface DocumentGenerationFormState
  extends Omit<GenerateDocumentData, "client_profile_id"> {
  client_profile_id?: UUID;
}

export default function GenerateDocumentPage() {
  const [formData, setFormData] = useState<DocumentGenerationFormState>({
    title: "",
    document_type: DocumentType.FILING,
    area_of_law: AreaOfLaw.CONTRACTS,
    notes: "",
    jurisdiction: "",
    county: "",
    date_of_application: "",
    case_number: "",
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [clientProfiles, setClientProfiles] = useState<ClientProfileResponse[]>(
    []
  );
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        if (user.role === "attorney") {
          setIsLoadingClients(true);
          const clients = await clientService.getAttorneyClients();
          setClientProfiles(clients);
          setIsLoadingClients(false);
        }
      } catch (error) {
        console.error("Error loading user data or client profiles:", error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load user profile or client information.",
          variant: "destructive",
        });
      }
    };
    loadUserData();
  }, [toast]);

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
    field: keyof DocumentGenerationFormState,
    value: string | DocumentType | AreaOfLaw | UUID | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.notes.trim() ||
      !formData.document_type ||
      !formData.area_of_law
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please provide a title, notes, document type, and area of law for your document.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generateData: GenerateDocumentData = {
        title: formData.title,
        document_type: formData.document_type,
        area_of_law: formData.area_of_law,
        notes: formData.notes,
        jurisdiction: formData.jurisdiction || undefined,
        client_profile_id: formData.client_profile_id
          ? (formData.client_profile_id as UUID)
          : undefined,
        county: formData.county || undefined,
        date_of_application: formData.date_of_application || undefined,
        case_number: formData.case_number || undefined,
      };
      const result = await aiService.generateDocument(generateData);
      toast({
        title: "Document Generated Successfully!",
        description: "Your document has been created and is ready for review.",
      });
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

  const isFormValid =
    formData.title.trim() &&
    formData.notes.trim() &&
    formData.document_type &&
    formData.area_of_law;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            AI Document Generator
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create professional legal documents using artificial intelligence.
          Provide your requirements and let our AI craft the perfect document
          for your needs.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border-2 bg-gradient-to-br from-secondary/30 to-accent/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Document Details</CardTitle>
                  <CardDescription className="text-base">
                    Provide the specifications for your AI-generated document
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Document Title */}
                <div className="space-y-3">
                  <Label
                    htmlFor="title"
                    className="text-base font-semibold flex items-center space-x-2"
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>Document Title *</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Employment Agreement - Software Engineer"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={isGenerating}
                    className="text-base py-3"
                  />
                </div>

                {/* County */}
                <div className="space-y-3">
                  <Label
                    htmlFor="county"
                    className="text-base font-semibold flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>County (Optional)</span>
                  </Label>
                  <Input
                    id="county"
                    placeholder="e.g., Broward County"
                    value={formData.county}
                    onChange={(e) =>
                      handleInputChange("county", e.target.value)
                    }
                    disabled={isGenerating}
                    className="text-base py-3"
                  />
                </div>

                {/* Date of Application */}
                <div className="space-y-3">
                  <Label
                    htmlFor="date_of_application"
                    className="text-base font-semibold flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Date of Application (Optional)</span>
                  </Label>
                  <Input
                    id="date_of_application"
                    type="date"
                    value={formData.date_of_application}
                    onChange={(e) =>
                      handleInputChange("date_of_application", e.target.value)
                    }
                    disabled={isGenerating}
                    className="text-base py-3"
                  />
                </div>

                {/* Case Number (Conditional) */}
                {[
                  DocumentType.FILING,
                  DocumentType.PETITION,
                  DocumentType.MOTION,
                  DocumentType.NOTICE,
                ].includes(formData.document_type as DocumentType) && (
                  <div className="space-y-3">
                    <Label
                      htmlFor="case_number"
                      className="text-base font-semibold flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Case Number (Optional)</span>
                    </Label>
                    <Input
                      id="case_number"
                      placeholder="e.g., 2023-CA-001234"
                      value={formData.case_number}
                      onChange={(e) =>
                        handleInputChange("case_number", e.target.value)
                      }
                      disabled={isGenerating}
                      className="text-base py-3"
                    />
                  </div>
                )}

                {/* Document Type and Area of Law - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="document_type"
                      className="text-base font-semibold flex items-center space-x-2"
                    >
                      <Scale className="h-4 w-4 text-primary" />
                      <span>Document Type *</span>
                    </Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(value) =>
                        handleInputChange(
                          "document_type",
                          value as DocumentType
                        )
                      }
                      disabled={isGenerating}
                    >
                      <SelectTrigger className="py-3">
                        <SelectValue placeholder="Select a document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(DocumentType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="area_of_law"
                      className="text-base font-semibold flex items-center space-x-2"
                    >
                      <Target className="h-4 w-4 text-primary" />
                      <span>Area of Law *</span>
                    </Label>
                    <Select
                      value={formData.area_of_law}
                      onValueChange={(value) =>
                        handleInputChange("area_of_law", value as AreaOfLaw)
                      }
                      disabled={isGenerating}
                    >
                      <SelectTrigger className="py-3">
                        <SelectValue placeholder="Select an area of law" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AreaOfLaw).map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Jurisdiction and Client - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="jurisdiction"
                      className="text-base font-semibold flex items-center space-x-2"
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Jurisdiction (Optional)</span>
                    </Label>
                    <Input
                      id="jurisdiction"
                      placeholder="e.g., Florida"
                      value={formData.jurisdiction}
                      onChange={(e) =>
                        handleInputChange("jurisdiction", e.target.value)
                      }
                      disabled={isGenerating}
                      className="py-3"
                    />
                  </div>

                  {/* Client Profile Dropdown (Conditional for Attorneys) */}
                  {currentUser?.role === "attorney" && (
                    <div className="space-y-3">
                      <Label
                        htmlFor="client_profile"
                        className="text-base font-semibold flex items-center space-x-2"
                      >
                        <Users className="h-4 w-4 text-primary" />
                        <span>For Client (Optional)</span>
                      </Label>
                      <Select
                        value={formData.client_profile_id || ""}
                        onValueChange={(value) =>
                          handleInputChange(
                            "client_profile_id",
                            value === "__SELF__" ? undefined : (value as UUID)
                          )
                        }
                        disabled={isGenerating || isLoadingClients}
                      >
                        <SelectTrigger className="py-3">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__SELF__">For Self</SelectItem>
                          {clientProfiles.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Notes Textarea */}
                <div className="space-y-3">
                  <Label
                    htmlFor="notes"
                    className="text-base font-semibold flex items-center space-x-2"
                  >
                    <Brain className="h-4 w-4 text-primary" />
                    <span>Detailed Requirements *</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="notes"
                      placeholder="Describe your document requirements in detail. Include specific terms, conditions, parties involved, and any special clauses you need. The more specific you are, the better the AI can tailor the document to your needs."
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      rows={8}
                      disabled={isGenerating}
                      className="text-base resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                      {formData.notes.length} characters
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-semibold"
                    disabled={isGenerating || !isFormValid}
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Generating Your Document...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-3 h-5 w-5" />
                        Generate Document
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Template Card */}
          {selectedTemplate && (
            <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Star className="h-5 w-5" />
                  <span>Selected Template</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedTemplate.template_name}
                  </h4>
                  <div className="flex gap-2 mt-3">
                    {selectedTemplate.document_types && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {selectedTemplate.document_types.document_type_name}
                      </Badge>
                    )}
                    {selectedTemplate.states && (
                      <Badge variant="outline" className="border-primary/30">
                        {selectedTemplate.states.state_name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm text-foreground">
                    The AI will use this template as a foundation and customize
                    it based on your specific requirements.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          <Card className="border-2 bg-gradient-to-br from-secondary/30 to-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-primary">
                <Lightbulb className="h-5 w-5" />
                <span>Pro Tips for Better Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-2 border-primary/30 text-primary"
                    >
                      Be Specific
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Include specific details about parties, terms, conditions,
                      and any unique requirements for your document.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-2 border-primary/30 text-primary"
                    >
                      Use Templates
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Select a relevant template for better structure,
                      compliance, and professional formatting.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-2 border-primary/30 text-primary"
                    >
                      Include Context
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Mention the business context, purpose, and any
                      industry-specific requirements for the document.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Features Card */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span>AI Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Legal compliance checking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Professional formatting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    Jurisdiction-specific language
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Industry best practices</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
