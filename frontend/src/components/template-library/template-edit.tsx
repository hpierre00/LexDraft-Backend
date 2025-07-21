"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, FileText, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { templateService, type Template, type UpdateTemplateData } from "@/api/templates"

interface TemplateEditProps {
  templateId: string
}

// Mock data - replace with actual API calls
const states = [
  { id: "1", name: "California" },
  { id: "2", name: "New York" },
  { id: "3", name: "Texas" },
  { id: "4", name: "Florida" },
]

const documentTypes = [
  { id: "1", name: "Contract" },
  { id: "2", name: "Agreement" },
  { id: "3", name: "Legal Notice" },
  { id: "4", name: "Form" },
]

export function TemplateEdit({ templateId }: TemplateEditProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    template_name: "",
    content: "",
    state_id: "defaultState", // Updated default value
    document_type_id: "defaultDocumentType", // Updated default value
  })

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedTemplate = await templateService.getById(templateId)
      setTemplate(fetchedTemplate)
      
      // Populate form data
      setFormData({
        template_name: fetchedTemplate.template_name,
        content: fetchedTemplate.content,
        state_id: fetchedTemplate.states?.state_id || "defaultState", // Updated default value
        document_type_id: fetchedTemplate.document_types?.document_type_id || "defaultDocumentType", // Updated default value
      })
    } catch (err) {
      console.error("Failed to fetch template:", err)
      setError("Failed to load template. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.template_name.trim() || !formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsSaving(true)
    try {
      // Note: The actual update method would need to be implemented in the templateService
      // For now, we'll simulate the update
      const updateData: UpdateTemplateData = {
        template_name: formData.template_name,
        content: formData.content,
        state_id: formData.state_id,
        document_type_id: formData.document_type_id,
      }

      // This would be: await templateService.update(templateId, updateData)
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: "Template updated",
        description: "Your template has been successfully updated.",
      })

      router.push(`/templates/${templateId}`)
    } catch (error) {
      console.error("Failed to update template:", error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your template. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Template</h3>
            <p className="text-red-600 mb-4">{error || "Template not found"}</p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={fetchTemplate}>
                Try Again
              </Button>
              <Button asChild>
                <Link href="/templates">Back to Templates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/templates/${templateId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Template
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Template</h1>
            <p className="text-muted-foreground">
              Make changes to your template
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Edit Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Template Content */}
          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
              <CardDescription>
                Edit the content of your template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template_name">Template Name *</Label>
                <Input
                  id="template_name"
                  value={formData.template_name}
                  onChange={(e) => handleInputChange("template_name", e.target.value)}
                  placeholder="Enter template name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  placeholder="Enter template content"
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Template Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>
                Configure template metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state_id}
                  onValueChange={(value) => handleInputChange("state_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defaultState">No state selected</SelectItem> {/* Updated value */}
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type</Label>
                <Select
                  value={formData.document_type_id}
                  onValueChange={(value) => handleInputChange("document_type_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defaultDocumentType">No document type selected</SelectItem> {/* Updated value */}
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(template.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(template.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template ID:</span>
                <span className="font-mono text-xs">{template.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
