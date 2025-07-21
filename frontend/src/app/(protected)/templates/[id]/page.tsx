import { TemplateDetail } from "@/components/template-library/template-detail"

interface TemplateDetailPageProps {
  params: {
    id: string
  }
}

export default function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  return (
    <div className="container mx-auto py-8">
      <TemplateDetail templateId={params.id} />
    </div>
  )
}
