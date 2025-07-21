"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, MoreHorizontal, Calendar, Eye, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { documentService, type Document } from "@/api/documents"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/providers/auth-provider"

export function RecentDocuments() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, isAuthInitialized } = useAuth()

  useEffect(() => {
    const getDocuments = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const docs = await documentService.getAll()
        const sortedDocs = docs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        setDocuments(sortedDocs.slice(0, 5))
      } catch (err) {
        console.error("Failed to fetch documents:", err)
        setError("Failed to load documents. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && isAuthInitialized) {
      getDocuments()
    } else if (!isAuthenticated && isAuthInitialized) {
      setIsLoading(false)
      setDocuments([])
    }
  }, [isAuthenticated, isAuthInitialized])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const getStatusBadgeClass = (status: Document["status"]) => {
    switch (status) {
      case "draft":
        return "bg-primary/10 text-primary border-primary/20"
      case "completed":
        return "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      case "in-review":
        return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500 bg-red-50">
        <CardContent className="p-6 text-center">
          <FileText className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Documents</h3>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-secondary/30 to-accent/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">Create your first document to get started with Lawverra</p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/create">Create Document</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        documents.map((doc) => (
          <Card
            key={doc.id}
            className="group hover:shadow-md transition-all duration-200 border-primary/10 hover:border-primary/30"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-medium hover:text-primary transition-colors block truncate"
                      title={doc.title}
                    >
                      {doc.title}
                    </Link>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(doc.updated_at)}</span>
                      <Badge className={`${getStatusBadgeClass(doc.status)} text-xs`}>
                        {doc.status.replace("-", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/documents/${doc.id}`} className="flex w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        Open Document
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await documentService.download(doc.id)
                          toast({
                            title: "Document downloaded",
                            description: "Your document has been downloaded as a PDF.",
                          })
                        } catch (error) {
                          console.error("Failed to download document:", error)
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: "Failed to download document. Please try again.",
                          })
                        }
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Document
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete Document</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
