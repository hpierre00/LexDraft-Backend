"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { documentService } from "@/api/documents";

export default function EvaluateDocumentPage() {
  const [documentContent, setDocumentContent] = useState("");
  const [evaluationResult, setEvaluationResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleEvaluate = async () => {
    setIsLoading(true);
    setError(null);
    setEvaluationResult("");

    try {
      let contentToEvaluate = documentContent;

      if (selectedFile) {
        // Upload the file to the backend for content extraction
        const uploadResponse = await documentService.upload(selectedFile);
        if (uploadResponse.content) {
          contentToEvaluate = uploadResponse.content;
          setDocumentContent(uploadResponse.content); // Update the textarea with extracted content
        } else {
          throw new Error("Failed to extract content from the uploaded file.");
        }
      } else if (documentContent.trim() === "") {
        throw new Error("Document content cannot be empty.");
      }

      const response = await documentService.create({
        title: "Evaluation Document - " + new Date().toLocaleString(),
        content: contentToEvaluate,
      });

      if (response.evaluation_response) {
        setEvaluationResult(response.evaluation_response);
      } else {
        setEvaluationResult("No evaluation response received.");
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
      setError(
        (err as Error).message ||
          "Failed to evaluate document. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Evaluate Document</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Content</CardTitle>
          <CardDescription>
            Paste the content of the document you wish to evaluate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your document content here..."
            className="min-h-[200px]"
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
          />
          <div className="flex items-center space-x-2 mt-4">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setDocumentContent(""); // Clear manual input when file is selected
                }
              }}
              className="flex-grow"
            />
            <Button
              onClick={handleEvaluate}
              disabled={isLoading || (!documentContent.trim() && !selectedFile)}
              className="ml-auto"
            >
              {isLoading ? "Evaluating..." : "Preview & Evaluate Document"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {evaluationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-foreground">
              {evaluationResult}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
