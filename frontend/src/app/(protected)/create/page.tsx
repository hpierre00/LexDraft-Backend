"use client"

import { CreateDocument } from "@/components/documents/create-document"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { templateService } from "@/api/templates"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, AlertCircle, Lightbulb, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CreatePage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const initialTitle = searchParams.get("title") || ""
  const templateId = searchParams.get("templateId")
  const [initialContent, setInitialContent] = useState<string>("")
  const [templateInfo, setTemplateInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTemplateContent() {
      if (templateId) {
        try {
          setLoading(true)
          const template = await templateService.getById(templateId)
          setInitialContent(template.content || "")
          setTemplateInfo(template)
        } catch (err) {
          console.error("Failed to fetch template content:", err)
          setError("Failed to load template content.")
          toast({
            title: "Error",
            description: "Failed to load template content. Please try again later.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchTemplateContent()
  }, [templateId, toast])

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Template Loading Error</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">You can still create a document from scratch below.</p>
          </CardContent>
        </Card>
        <div className="mt-6">
          <CreateDocument initialTitle={initialTitle} initialContent="" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Template Info Card */}
      {templateInfo && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Using Template</CardTitle>
                <p className="text-sm text-muted-foreground">{templateInfo.template_name}</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Template
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Tips Card for Template Usage */}
      {templateId && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
              <Lightbulb className="h-5 w-5 mr-2" />
              Template Customization Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 dark:text-blue-300">
            <ul className="space-y-2 text-sm">
              <li>• Review and customize all placeholder text to match your needs</li>
              <li>• Update dates, names, and specific terms as required</li>
              <li>• Add or remove sections based on your specific requirements</li>
              <li>• Save your customized version for future use</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Create Document Component */}
      <CreateDocument initialTitle={initialTitle} initialContent={initialContent} />
    </div>
  )
}
