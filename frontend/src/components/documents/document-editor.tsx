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
import { useToast } from "@/components/ui/use-toast";
import { documentService, type Document } from "@/api/documents";
import dynamic from "next/dynamic";

// Dynamically import Toast UI Editor to avoid SSR issues
const Editor = dynamic(
  () => import("@toast-ui/react-editor").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-300px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(160,84%,39%)]" />
      </div>
    ),
  }
);

const Viewer = dynamic(
  () => import("@toast-ui/react-editor").then((mod) => mod.Viewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[calc(100vh-300px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(160,84%,39%)]" />
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
      } catch (error) {
        console.error("Failed to fetch document:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load document. Please try again.",
        });
        router.push("/documents"); // Redirect to documents list on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, toast, router]);

  const handleSave = async () => {
    if (!document) return; // Should not happen if document is loaded
    setIsSaving(true);

    try {
      // Get content from Toast UI Editor
      const editorContent = editorRef.current?.getInstance().getMarkdown();

      const updatedDocument = await documentService.update(document.id, {
        title,
        content: editorContent || content, // Use editor content if available, fallback to state
        status: document.status, // Preserve existing status
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[calc(100vh-200px)] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold border-primary focus-visible:ring-primary"
            placeholder="Document Title"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Simulate share
              toast({
                title: "Share link copied",
                description:
                  "The share link has been copied to your clipboard.",
              });
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
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
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Document options</DropdownMenuLabel>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Export as Word
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI to review
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mb-3 text-sm text-muted-foreground">
        Last updated: {new Date(document?.updated_at || "").toLocaleString()}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent
          value="edit"
          className="border border-primary rounded-lg min-h-[calc(100vh-300px)] bg-card"
        >
          {!isLoading && typeof window !== "undefined" && (
            <Editor
              initialValue={content}
              previewStyle="tab"
              height="calc(100vh - 300px)"
              initialEditType="markdown"
              useCommandShortcut={true}
              ref={setEditorRef}
              className="lawverra-editor"
              onChange={() => {
                const editorContent = editorRef.current
                  ?.getInstance()
                  .getMarkdown();
                setContent(editorContent);
              }}
            />
          )}
        </TabsContent>
        <TabsContent
          value="preview"
          className="border border-primary rounded-lg p-4 min-h-[calc(100vh-300px)] bg-card"
        >
          {!isLoading && typeof window !== "undefined" && (
            <Viewer initialValue={content} />
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex items-center justify-between text-sm text-foreground">
        <div className="flex items-center">
          <Check className="h-4 w-4 text-primary mr-2" />
          <span>Document saved securely</span>
        </div>
        <div>Lawverra Document Editor</div>
      </div>
    </div>
  );
}
