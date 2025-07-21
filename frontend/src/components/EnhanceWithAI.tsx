import React, { useState, ChangeEvent, FormEvent } from "react";
import { documentService, Document } from "@/api/documents";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EnhanceWithAIButtonProps {
  documentId?: string;
  onEnhanced?: (doc: Document) => void;
}

export function EnhanceWithAIButton({
  documentId,
  onEnhanced,
}: EnhanceWithAIButtonProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEnhanceModal, setShowEnhanceModal] = useState(false);

  return (
    <>
      <Button
        variant="default"
        className="px-4 py-2"
        onClick={() =>
          documentId ? setShowEnhanceModal(true) : setShowUploadModal(true)
        }
      >
        Enhance with AI
      </Button>
      {showUploadModal && (
        <EnhanceUploadModal
          onClose={() => setShowUploadModal(false)}
          onEnhanced={onEnhanced}
        />
      )}
      {showEnhanceModal && documentId && (
        <EnhanceExistingModal
          documentId={documentId}
          onClose={() => setShowEnhanceModal(false)}
          onEnhanced={onEnhanced}
        />
      )}
    </>
  );
}

interface EnhanceUploadModalProps {
  onClose: () => void;
  onEnhanced?: (doc: Document) => void;
}

function EnhanceUploadModal({ onClose, onEnhanced }: EnhanceUploadModalProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [resultDoc, setResultDoc] = useState<Document | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!file) {
      setError("Please select a file.");
      setLoading(false);
      return;
    }
    try {
      const doc = await documentService.enhanceUpload(file, instructions);
      setPreview(doc.content);
      setResultDoc(doc);
      onEnhanced && onEnhanced(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border-2 border-primary/10"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-1">
            Enhance New Document
          </h2>
          <p className="text-muted-foreground text-sm">
            Upload a document and let AI enhance it for clarity, compliance, and
            professionalism.
          </p>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Document File
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files && files[0]) setFile(files[0]);
              else setFile(null);
            }}
            required
            className="block w-full border border-primary/20 rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Enhancement Instructions{" "}
            <span className="text-xs text-muted-foreground">(optional)</span>
          </label>
          <textarea
            className="w-full border border-primary/20 rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="E.g. Improve clarity, check for compliance, rewrite in plain English..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
          />
        </div>
        {loading && (
          <div className="mb-2 text-primary flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full inline-block"></span>
            Enhancing...
          </div>
        )}
        {error && <div className="mb-2 text-red-600 font-medium">{error}</div>}
        {preview && resultDoc && (
          <div className="mb-2 border p-2 bg-gray-50 rounded max-h-48 overflow-auto">
            <strong className="block mb-2 text-primary">Preview:</strong>
            <pre className="whitespace-pre-wrap text-sm text-foreground">
              {preview}
            </pre>
            <Button
              type="button"
              variant="secondary"
              className="mt-2 w-full"
              onClick={() => router.push(`/documents/${resultDoc.id}`)}
            >
              Accept &amp; Edit
            </Button>
          </div>
        )}
        {!preview && (
          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              variant="default"
              className="flex-1"
              disabled={loading}
            >
              Enhance
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

interface EnhanceExistingModalProps {
  documentId: string;
  onClose: () => void;
  onEnhanced?: (doc: Document) => void;
}

function EnhanceExistingModal({
  documentId,
  onClose,
  onEnhanced,
}: EnhanceExistingModalProps) {
  const router = useRouter();
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const doc = await documentService.enhance(documentId, instructions);
      setPreview(doc.content);
      onEnhanced && onEnhanced(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border-2 border-primary/10"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-1">
            Enhance Existing Document
          </h2>
          <p className="text-muted-foreground text-sm">
            Describe what you want changed and let AI enhance your document.
          </p>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Enhancement Instructions
          </label>
          <textarea
            className="w-full border border-primary/20 rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Describe what you want changed"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
            rows={3}
          />
        </div>
        {loading && (
          <div className="mb-2 text-primary flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full inline-block"></span>
            Enhancing...
          </div>
        )}
        {error && <div className="mb-2 text-red-600 font-medium">{error}</div>}
        {preview && (
          <div className="mb-2 border p-2 bg-gray-50 rounded max-h-48 overflow-auto">
            <strong className="block mb-2 text-primary">Preview:</strong>
            <pre className="whitespace-pre-wrap text-sm text-foreground">
              {preview}
            </pre>
            <Button
              type="button"
              variant="secondary"
              className="mt-2 w-full"
              onClick={onClose}
            >
              Accept
            </Button>
          </div>
        )}
        {!preview && (
          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              variant="default"
              className="flex-1"
              disabled={loading}
            >
              Enhance
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
