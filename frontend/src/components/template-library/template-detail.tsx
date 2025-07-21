"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Edit, Trash2, FileText, Calendar, Tag, MapPin, Eye, Copy, Share2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { templateService, type Template } from "@/api/templates"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"

interface TemplateDetailProps {
  templateId: string
}

export function TemplateDetail({ templateId }: TemplateDetailProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedTemplate = await templateService.getById(templateId)
      setTemplate(fetchedTemplate)
    } catch (err) {
      console.error("Failed to fetch template:", err)
      setError("Failed to load template. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseTemplate = () => {
    if (!template) return
    
    router.push(
      `/create?title=${encodeURIComponent(template.template_name)}&templateId=${encodeURIComponent(template.id)}`,
    )
    toast({
      title: "Template selected",
      description: `You are now using the ${template.template_name} template.`,
    })
  }

  const handleDownloadTemplate = async () => {
    if (!template) return
    
    try {
      const { blob, filename } = await templateService.downloadTemplate(template.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Template downloaded",
        description: `${template.template_name} has been downloaded.`,
      })
    } catch (error) {
      console.error("Failed to download template:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download template. Please try again.",
      })
    }
  }

  const handleDeleteTemplate = async () => {
    if (!template) return
    
    setIsDeleting(true)
    try {
      await templateService.delete(template.id)
      toast({
        title: "Template deleted",
        description: `${template.template_name} has been deleted.`,
      })
      router.push("/templates")
    } catch (error) {
      console.error("Failed to delete template:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete template. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied",
      description: "Template link has been copied to clipboard.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: template?.template_name,
          text: `Check out this template: ${template?.template_name}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing or sharing failed
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{template.template_name}</h1>
            <p className="text-muted-foreground">
              Template Details and Preview
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Template Preview</span>
              </CardTitle>
              <CardDescription>
                Preview of the template content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-6 min-h-[400px] border-2 border-dashed border-muted-foreground/20">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {template.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Content */}
          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
              <CardDescription>
                Raw content of the template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {template.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                What would you like to do with this template?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleUseTemplate}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <FileText className="h-4 w-4 mr-2" />
                Use Template
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                asChild
                className="w-full"
              >
                <Link href={`/templates/${template.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Link>
              </Button>
              <Separator />
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </Button>
            </CardContent>
          </Card>

          {/* Template Information */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Document Type:</span>
                </div>
                {template.document_types?.document_type_name ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {template.document_types.document_type_name}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Not specified</span>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">State:</span>
                </div>
                {template.states?.state_name ? (
                  <Badge variant="outline" className="border-primary/30">
                    {template.states.state_name}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Not specified</span>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Dates:</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{new Date(template.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">File Details:</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Path:</span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {template.file_path}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template ID:</span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {template.id}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Related Templates</CardTitle>
              <CardDescription>
                Other templates in the same category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground text-center py-4">
                  Related templates will be shown here
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{template.template_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
