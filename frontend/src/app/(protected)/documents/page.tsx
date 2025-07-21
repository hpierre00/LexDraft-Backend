"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, MoreHorizontal, PlusCircle, Search, Calendar, Eye, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { documentService, type Document } from "@/api/documents"
import { useToast } from "@/components/ui/use-toast"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const getDocuments = async () => {
      try {
        const docs = await documentService.getAll()
        setDocuments(docs)
      } catch (err) {
        console.error("Failed to fetch documents:", err)
        setError("Failed to load documents. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    getDocuments()
  }, [])

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

  const filteredDocuments = documents
    .filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-12 w-80" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Documents</h3>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            My Documents
          </h1>
          <p className="text-muted-foreground text-lg mt-2">Manage and organize your legal documents</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90" size="lg">
          <Link href="/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Document
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card className="border-primary/20 bg-gradient-to-r from-secondary/30 to-accent/20">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-primary/30 focus-visible:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 && documents.length > 0 ? (
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="p-12 text-center">
            <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms to find what you're looking for.</p>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 && documents.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-secondary/30 to-accent/20">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Welcome to Your Document Library</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Create your first document to get started with Lawverra's powerful document management system.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90" size="lg">
              <Link href="/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Your First Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="group hover:shadow-lg transition-all duration-200 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 min-w-0"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight">
                        <Link
                          href={`/documents/${doc.id}`}
                          className="hover:text-primary transition-colors block truncate"
                          title={doc.title}
                        >
                          {doc.title}
                        </Link>
                      </CardTitle>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/5"
                      >
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
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground min-w-0 flex-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{formatDate(doc.updated_at)}</span>
                  </div>
                  <Badge className={`${getStatusBadgeClass(doc.status)} flex-shrink-0`}>
                    {doc.status.replace("-", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
