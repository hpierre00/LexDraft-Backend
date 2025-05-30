"use client";

import { DocumentList } from "@/components/documents/document-list";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">My Documents</h1>
      <DocumentList />
    </div>
  );
}
