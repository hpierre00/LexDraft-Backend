"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Download,
  Share2,
  MoreHorizontal,
  MessageSquare,
  FileText,
  Loader2,
  Check,
  Edit3,
  Eye,
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Lightbulb,
  Users,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { documentService, type Document } from "@/api/documents";
import dynamic from "next/dynamic";
import { EnhanceWithAIButton } from "@/components/EnhanceWithAI";

// Dynamically import Toast UI Editor to avoid SSR issues
const Editor = dynamic(
  () => import("@toast-ui/react-editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-300px)] flex items-center justify-center bg-gradient-to-br from-secondary/30 to-accent/20 rounded-lg">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

const Viewer = dynamic(
  () => import("@toast-ui/react-editor").then((mod) => mod.Viewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-300px)] flex items-center justify-center bg-gradient-to-br from-secondary/30 to-accent/20 rounded-lg">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    ),
  }
);

export function DocumentEditor({ documentId }: { documentId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const editorRef = useRef<any>(null);

  const setEditorRef = useCallback((node: any) => {
    if (node) {
      console.log("Callback ref: editor node available!", node);
      editorRef.current = node;
      try {
        const instance = node.getInstance();
        if (instance) {
          console.log(
            "Callback ref: Editor instance available via getInstance()!",
            instance
          );
        }
      } catch (e) {
        console.error("Callback ref: Error getting instance:", e);
      }
    } else {
      console.log(
        "Callback ref: editor node is null (unmounting or not yet available)."
      );
    }
  }, []);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        if (documentId === "new") {
          setIsLoading(false);
          return;
        }
        const fetchedDocument = await documentService.getById(documentId);
        setDocument(fetchedDocument);
        setTitle(fetchedDocument.title);
        setContent(fetchedDocument.content);
        // Explicitly set markdown content to the editor instance
        if (editorRef.current) {
          editorRef.current.getInstance().setMarkdown(fetchedDocument.content);
        }
      } catch (error) {
        console.error("Failed to fetch document:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load document. Please try again.",
        });
        router.push("/documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, toast, router]);

  const handleSave = async () => {
    if (!document) return;

    setIsSaving(true);
    try {
      const editorContent = editorRef.current?.getInstance().getMarkdown();
      const updatedDocument = await documentService.update(document.id, {
        title,
        content: editorContent || content,
        status: document.status,
      });
      setDocument(updatedDocument);
      setContent(editorContent || content);
      toast({
        title: "Document saved",
        description: "Your document has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save document:", error);
      toast({
        variant: "destructive",
        title: "Error saving document",
        description:
          "There was an error saving your document. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRiskScoreColor = (riskScore: string) => {
    switch (riskScore?.toLowerCase()) {
      case "low":
        return "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "moderate":
        return "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30";
      case "high":
        return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRiskIcon = (riskScore: string) => {
    switch (riskScore?.toLowerCase()) {
      case "low":
        return (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case "moderate":
        return <AlertTriangle className="h-5 w-5 text-primary" />;
      case "high":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <BarChart3 className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[calc(100vh-200px)] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-6 space-y-4">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Section - Document Info */}
            <div className="flex-1 space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Document Editor
                </h1>
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-primary/30 focus-visible:ring-primary text-foreground bg-background"
                placeholder="Document Title"
              />
            </div>

            {/* Separator */}
            <div className="hidden lg:block w-px h-20 bg-border/30"></div>

            {/* Right Section - Actions */}
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground font-medium">
                Actions
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Enhance with AI Button */}
                {document && (
                  <EnhanceWithAIButton
                    documentId={document.id}
                    onEnhanced={(enhancedDoc) => {
                      setContent(enhancedDoc.content);
                      setDocument((prev) =>
                        prev ? { ...prev, content: enhancedDoc.content } : prev
                      );
                    }}
                  />
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (document) {
                      try {
                        await documentService.download(document.id);
                        toast({
                          title: "Document downloaded",
                          description: "Your document has been downloaded.",
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
                    }
                  }}
                  className="border-primary/30 hover:bg-primary/5"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Share link copied",
                      description:
                        "The share link has been copied to your clipboard.",
                    });
                  }}
                  className="border-primary/30 hover:bg-primary/5"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Save</span>
                    </>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-primary/30 hover:bg-primary/5"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Document options</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={async () => {
                        if (document) {
                          try {
                            await documentService.downloadDocx(document.id);
                            toast({
                              title: "Document exported",
                              description:
                                "Your document has been exported as a Word file.",
                            });
                          } catch (error) {
                            console.error(
                              "Failed to export document as DOCX:",
                              error
                            );
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description:
                                "Failed to export document. Please try again.",
                            });
                          }
                        }
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Export as DOCX
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        if (document) {
                          const confirmed = window.confirm(
                            "Are you sure you want to archive this document?"
                          );
                          if (confirmed) {
                            try {
                              await documentService.archive(document.id);
                              toast({
                                title: "Document Archived",
                                description: "Your document has been archived.",
                              });
                              router.push("/documents");
                            } catch (error) {
                              console.error(
                                "Failed to archive document:",
                                error
                              );
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description:
                                  "Failed to archive document. Please try again.",
                              });
                            }
                          }
                        }
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Archive Document
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>
              Last updated:{" "}
              {new Date(document?.updated_at || "").toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-primary" />
            <span>Auto-saved</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
          <TabsTrigger
            value="edit"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit</span>
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </TabsTrigger>
          <TabsTrigger
            value="evaluation"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Evaluation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-6">
          <Card className="border-2 bg-gradient-to-br from-secondary/30 to-accent/20">
            <CardContent className="p-0">
              <div className="rounded-lg overflow-hidden lawverra-editor">
                <Editor
                  ref={setEditorRef}
                  initialValue={content}
                  initialEditType="markdown"
                  height="calc(100vh - 300px)"
                  usageStatistics={false}
                  onChange={() => {
                    if (editorRef.current) {
                      setContent(editorRef.current.getInstance().getMarkdown());
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="prose dark:prose-invert max-w-none min-h-[calc(100vh-300px)]">
                <Viewer initialValue={content} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="mt-6">
          {document?.evaluation_response ? (
            <div className="space-y-6">
              {/* Risk Score Overview */}
              <Card className="border-2 bg-gradient-to-br from-secondary/30 to-accent/20">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    {getRiskIcon(document.evaluation_response.risk_score)}
                    <CardTitle className="text-2xl">Risk Assessment</CardTitle>
                  </div>
                  <div className="flex justify-center">
                    <Badge
                      className={`text-lg px-6 py-2 ${getRiskScoreColor(
                        document.evaluation_response.risk_score
                      )}`}
                    >
                      {document.evaluation_response.risk_score} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground text-lg">
                    {document.evaluation_response.evaluation_summary}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <CardTitle className="text-green-700 dark:text-green-300">
                        Strengths
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {document.evaluation_response?.strengths &&
                    document.evaluation_response.strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {document.evaluation_response.strengths.map(
                          (strength: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No specific strengths identified.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="border-l-4 border-l-red-500 dark:border-l-red-400">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <CardTitle className="text-red-700 dark:text-red-300">
                        Weaknesses
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {document.evaluation_response?.weaknesses &&
                    document.evaluation_response.weaknesses.length > 0 ? (
                      <ul className="space-y-2">
                        {document.evaluation_response.weaknesses.map(
                          (weakness: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{weakness}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No specific weaknesses identified.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Loopholes */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <CardTitle className="text-primary">
                        Potential Loopholes
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {document.evaluation_response.loopholes &&
                    document.evaluation_response.loopholes.length > 0 ? (
                      <ul className="space-y-2">
                        {document.evaluation_response.loopholes.map(
                          (loophole, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{loophole}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No specific loopholes identified.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <CardTitle className="text-primary">
                        Recommendations
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {document.evaluation_response?.recommendations_for_update &&
                    document.evaluation_response.recommendations_for_update
                      .length > 0 ? (
                      <ul className="space-y-3">
                        {document.evaluation_response.recommendations_for_update.map(
                          (rec: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-primary">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-sm">{rec}</span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No specific recommendations available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Strategic Actions */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-primary">
                      Strategic Actions
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <p className="text-sm font-medium text-primary mb-2">
                        Primary Strategy
                      </p>
                      <p className="text-sm text-foreground">
                        {document.evaluation_response.strategy}
                      </p>
                    </div>
                    {document.evaluation_response?.strategies_for_update &&
                      document.evaluation_response.strategies_for_update
                        .length > 0 && (
                        <ul className="space-y-2">
                          {document.evaluation_response.strategies_for_update.map(
                            (strategy: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start space-x-2"
                              >
                                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strategy}</span>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Document Metadata */}
              {document.evaluation_response?.metadata &&
                Object.keys(document.evaluation_response.metadata).length >
                  0 && (
                  <Card className="bg-gradient-to-r from-secondary/30 to-accent/20">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-primary" />
                        <span>Document Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(
                          document.evaluation_response.metadata
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center space-x-2"
                          >
                            <FileText className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {key
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </p>
                              <p className="text-sm font-medium">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Evaluation Available
                </h3>
                <p className="text-muted-foreground">
                  This document hasn't been evaluated yet. Upload it to the
                  evaluation tool to get detailed analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center space-x-2">
          <Check className="h-4 w-4 text-primary" />
          <span>Document saved securely</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Powered by</span>
          <span className="font-semibold text-primary">Lawverra</span>
        </div>
      </div>
    </div>
  );
}
