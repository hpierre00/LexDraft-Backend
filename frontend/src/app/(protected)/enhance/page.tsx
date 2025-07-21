"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { documentService, Document } from "@/api/documents";
import { useRouter } from "next/navigation";

export default function EnhanceWithAIPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [resultDoc, setResultDoc] = useState<Document | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPreview(null);
    setResultDoc(null);
    if (!file) {
      setError("Please select a file.");
      setLoading(false);
      return;
    }
    try {
      const doc = await documentService.enhanceUpload(file, instructions);
      setPreview(doc.content);
      setResultDoc(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Enhance with AI
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload a legal document and let our AI enhance it for clarity, compliance, and professionalism.
        </p>
      </div>
      <Card className="border-2 bg-gradient-to-br from-secondary/30 to-accent/20">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-primary truncate">
            AI Document Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Document File</label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={e => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files[0]) setFile(files[0]);
                  else setFile(null);
                }}
                required
                className="block w-full border border-primary/20 rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Enhancement Instructions <span className="text-xs text-muted-foreground">(optional)</span></label>
              <textarea
                className="w-full border border-primary/20 rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="E.g. Improve clarity, check for compliance, rewrite in plain English..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={3}
              />
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="animate-spin h-5 w-5" /> Enhancing...
              </div>
            )}
            {error && <div className="text-red-600 font-medium">{error}</div>}
            {preview && resultDoc && (
              <div className="border p-3 bg-gray-50 rounded max-h-64 overflow-auto mt-2">
                <strong className="block mb-2 text-primary">Preview:</strong>
                <pre className="whitespace-pre-wrap text-sm text-foreground">{preview}</pre>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => router.push(`/documents/${resultDoc.id}`)}
                >
                  Accept &amp; Edit
                </Button>
              </div>
            )}
            {!preview && (
              <Button type="submit" className="w-full" variant="default" disabled={loading}>
                Enhance
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
