import { TemplateEdit } from "@/components/template-library/template-edit"

interface TemplateEditPageProps {
  params: {
    id: string
  }
}

export default function TemplateEditPage({ params }: TemplateEditPageProps) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit Template</h1>
      <TemplateEdit templateId={params.id} />
    </div>
  )
}
