import { DocumentEditor } from "@/components/documents/document-editor"

export default function DocumentPage({ params }: { params: { id: string } }) {
  return <DocumentEditor documentId={params.id} />
}
