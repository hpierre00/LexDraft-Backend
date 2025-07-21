"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { documentService } from "@/api/documents";
import { FileText, Plus, Sparkles } from "lucide-react";
import { DocumentType, AreaOfLaw } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateDocument({
  initialTitle = "",
  initialContent = "",
}: {
  initialTitle?: string;
  initialContent?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [county, setCounty] = useState("");
  const [dateOfApplication, setDateOfApplication] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType | "">(
    DocumentType.LETTER
  );
  const [areaOfLaw, setAreaOfLaw] = useState<AreaOfLaw | "">(
    AreaOfLaw.CONTRACTS
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newDocument = await documentService.create({
        title,
        content,
        county,
        date_of_application: dateOfApplication,
        case_number: caseNumber,
        document_type: documentType as DocumentType,
        area_of_law: areaOfLaw as AreaOfLaw,
      });
      toast({
        title: "Success!",
        description: "Document created successfully.",
      });
      router.push(`/documents/${newDocument.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Create New Document
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Start crafting your legal document with our professional editor
        </p>
      </div>

      <Card className="border-2 bg-gradient-to-br from-secondary/30 to-accent/20">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Document Details</CardTitle>
              <p className="text-muted-foreground mt-1">
                Provide the basic information for your new document
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="text-base font-semibold flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Document Title</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title for your document"
                className="text-base py-3 border-primary/30 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="documentType"
                className="text-base font-semibold flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Document Type</span>
              </Label>
              <Select
                value={documentType}
                onValueChange={(value: DocumentType) => setDocumentType(value)}
              >
                <SelectTrigger
                  id="documentType"
                  className="text-base py-3 border-primary/30 focus-visible:ring-primary"
                >
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
                htmlFor="areaOfLaw"
                className="text-base font-semibold flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Area of Law</span>
              </Label>
              <Select
                value={areaOfLaw}
                onValueChange={(value: AreaOfLaw) => setAreaOfLaw(value)}
              >
                <SelectTrigger
                  id="areaOfLaw"
                  className="text-base py-3 border-primary/30 focus-visible:ring-primary"
                >
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

            <div className="space-y-3">
              <Label
                htmlFor="county"
                className="text-base font-semibold flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>County (Optional)</span>
              </Label>
              <Input
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g., Broward County"
                className="text-base py-3 border-primary/30 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="dateOfApplication"
                className="text-base font-semibold flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Date of Application (Optional)</span>
              </Label>
              <Input
                id="dateOfApplication"
                type="date"
                value={dateOfApplication}
                onChange={(e) => setDateOfApplication(e.target.value)}
                className="text-base py-3 border-primary/30 focus-visible:ring-primary"
              />
            </div>

            {[
              DocumentType.FILING,
              DocumentType.PETITION,
              DocumentType.MOTION,
              DocumentType.NOTICE,
            ].includes(documentType as DocumentType) && (
              <div className="space-y-3">
                <Label
                  htmlFor="caseNumber"
                  className="text-base font-semibold flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Case Number (Optional)</span>
                </Label>
                <Input
                  id="caseNumber"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="e.g., 2023-CA-001234"
                  className="text-base py-3 border-primary/30 focus-visible:ring-primary"
                />
              </div>
            )}

            <div className="space-y-3">
              <Label
                htmlFor="content"
                className="text-base font-semibold flex items-center space-x-2"
              >
                <FileText className="h-4 w-4 text-primary" />
                <span>Initial Content</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your document content here. You can always edit and enhance it later using our advanced editor..."
                  className="min-h-[300px] text-base border-primary/30 focus-visible:ring-primary resize-none"
                  required
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {content.length} characters
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Document...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Document
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="sm:w-auto border-primary/30 hover:bg-primary/5"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="mt-6 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span>Pro Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Use a clear, descriptive title that reflects the document's
              purpose and content.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Start with an outline or key points - you can expand and format
              later in the editor.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Don't worry about perfect formatting now - our editor supports
              rich text and markdown.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
