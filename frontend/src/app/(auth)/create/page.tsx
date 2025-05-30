"use client";

import { CreateDocument } from "@/components/documents/create-document";

export default function CreatePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Create Document</h1>
      <CreateDocument />
    </div>
  );
}
