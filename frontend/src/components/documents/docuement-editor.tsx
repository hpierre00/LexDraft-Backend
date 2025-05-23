"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Download, Share2, MoreHorizontal, MessageSquare, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface Document {
  id: string
  title: string
  content: string
  status: "draft" | "completed" | "in-review"
  updatedAt: string
}

export function DocumentEditor({ documentId }: { documentId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [activeTab, setActiveTab] = useState("edit")

  useEffect(() => {
    // Simulate API call
    const fetchDocument = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (documentId === "new") {
        setDocument({
          id: "new",
          title: "Untitled Document",
          content: "",
          status: "draft",
          updatedAt: new Date().toISOString(),
        })
      } else {
        setDocument({
          id: documentId,
          title: "Employment Agreement - Software Engineer",
          content: `# Employment Agreement

THIS EMPLOYMENT AGREEMENT (the "Agreement") is made and entered into as of [DATE], by and between [COMPANY NAME], a [STATE] corporation (the "Company"), and [EMPLOYEE NAME], an individual (the "Employee").

## 1. POSITION AND DUTIES

The Company hereby employs the Employee as a Software Engineer, and the Employee accepts such employment, upon the terms and conditions set forth in this Agreement. The Employee shall perform such duties as are customarily performed by a Software Engineer, and shall perform such other duties as may be assigned from time to time by the Company.

## 2. TERM

The term of this Agreement shall commence on [START DATE] and shall continue until terminated by either party in accordance with the provisions of this Agreement.

## 3. COMPENSATION

The Company shall pay the Employee a base salary of [SALARY] per year, payable in accordance with the Company's standard payroll practices. The Employee shall also be eligible to receive an annual bonus of up to [BONUS PERCENTAGE] of the Employee's base salary, based on the achievement of certain performance goals to be established by the Company.

## 4. BENEFITS

The Employee shall be entitled to participate in all employee benefit plans and programs of the Company to the extent that the Employee meets the eligibility requirements for each such plan or program. The Company reserves the right to modify, amend, or terminate any such plan or program at any time.

## 5. TERMINATION

This Agreement may be terminated by either party at any time, with or without cause, upon [NOTICE PERIOD] written notice to the other party.

## 6. CONFIDENTIALITY

The Employee acknowledges that, during the course of employment with the Company, the Employee will have access to confidential information relating to the business of the Company. The Employee agrees to maintain the confidentiality of such information and not to use or disclose such information except as required in the course of employment with the Company.

## 7. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State of [STATE], without giving effect to any choice of law or conflict of law provisions.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

[COMPANY NAME]

By: ________________________
Name: [NAME]
Title: [TITLE]

EMPLOYEE

________________________
[EMPLOYEE NAME]`,
          status: "draft",
          updatedAt: "2023-05-15T10:30:00Z",
        })
      }

      setIsLoading(false)
    }

    fetchDocument()
  }, [documentId])

  useEffect(() => {
    if (document) {
      setTitle(document.title)
      setContent(document.content)
    }
  }, [document])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, we would call the API here
      // await documentService.update(documentId, {
      //   title,
      //   content,
      // })

      toast({
        title: "Document saved",
        description: "Your document has been saved successfully.",
      })

      if (documentId === "new") {
        router.push("/documents/1")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving document",
        description: "There was an error saving your document. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[calc(100vh-200px)] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-bold" />
          <div className="mt-1 text-sm text-muted-foreground">
            Last updated: {new Date(document?.updatedAt || "").toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveTab(activeTab === "edit" ? "preview" : "edit")}>
            {activeTab === "edit" ? "Preview" : "Edit"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Simulate download
              toast({
                title: "Document downloaded",
                description: "Your document has been downloaded as a PDF.",
              })
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Simulate share
              toast({
                title: "Share link copied",
                description: "The share link has been copied to your clipboard.",
              })
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Document options</DropdownMenuLabel>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Export as Word
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI to review
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete document</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="border rounded-lg p-4 min-h-[calc(100vh-300px)]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[calc(100vh-300px)] font-mono text-sm resize-none focus:outline-none"
          />
        </TabsContent>
        <TabsContent value="preview" className="border rounded-lg p-4 min-h-[calc(100vh-300px)] prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
