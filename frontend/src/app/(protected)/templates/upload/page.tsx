import { TemplateUpload } from "@/components/template-library/template-upload"

export default function TemplateUploadPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Upload Templates</h1>
      <TemplateUpload />
    </div>
  )
}
