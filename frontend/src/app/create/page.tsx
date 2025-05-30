import { CreateDocument } from "@/components/documents/create-document";

export default function CreatePage() {
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <h1 className="mb-4 text-2xl font-semibold">Create Document</h1>
      <CreateDocument />
    </div>
  );
}
