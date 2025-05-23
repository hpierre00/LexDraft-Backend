"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export function CreateDocument() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const templates = [
    { id: "employment", name: "Employment Agreement" },
    { id: "nda", name: "Non-Disclosure Agreement" },
    { id: "service", name: "Service Agreement" },
    { id: "license", name: "Software License Agreement" },
  ]

  const handleGenerateDocument = async () => {
    if (!title) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please enter a title for your document.",
      })
      return
    }

    if (!prompt && !selectedTemplate) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter a prompt or select a template.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, we would call the API here
      // await aiService.generateDocument({
      //   prompt,
      //   title,
      // })

      toast({
        title: "Document created",
        description: "Your document has been created successfully.",
      })

      router.push("/documents/1")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating document",
        description: "There was an error creating your document. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Create a new document</h2>
        <p className="text-muted-foreground">Generate a document from scratch with AI or use a template</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate with AI</CardTitle>
            <CardDescription>Describe what you need and our AI will create a document for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe your document</Label>
              <Textarea
                id="prompt"
                placeholder="E.g., Create an employment agreement for a software engineer in California with a salary of $120,000 per year..."
                className="min-h-[200px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerateDocument} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Document
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Use a Template</CardTitle>
            <CardDescription>Start with a pre-built template and customize it to your needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-title">Document Title</Label>
              <Input
                id="template-title"
                placeholder="Enter a title for your document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Select a template</Label>
              <div className="grid gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerateDocument} className="w-full" disabled={isLoading || !selectedTemplate}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Use Template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
