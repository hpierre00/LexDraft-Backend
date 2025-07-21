"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { documentService, type Document } from "@/api/documents"
import { clientService } from "@/api/clients"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, AlertCircle, Calendar, Eye, Plus, User, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UUID } from "@/lib/types"

export default function ClientDocumentsPage() {
  const { clientId } = useParams()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clientId) {
      fetchClientData(clientId as UUID)
    }
  }, [clientId])

  const fetchClientData = async (id: UUID) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch client info and documents in parallel
      const [allDocuments, client] = await Promise.all([documentService.getAll(), clientService.getClientProfile(id)])
      // Filter documents by client_profile_id
      const clientRelatedDocuments = allDocuments.filter((doc) => doc.client_profile_id === id)

      setDocuments(clientRelatedDocuments)
      setClientInfo(client)
    } catch (err) {
      console.error("Failed to fetch client data:", err)
      setError("Failed to load client information and documents. Please try again later.")
      toast({
        title: "Error",
        description: "Failed to load client data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-3/4" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-6 px-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Client Data</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => fetchClientData(clientId as UUID)} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
        </div>

        {/* Client Info Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{clientInfo?.full_name || "Client Documents"}</h1>
                    <p className="text-xl text-white/90">Document management and overview</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <FileText className="h-3 w-3 mr-1" />
                    {documents.length} Documents
                  </Badge>
                  {clientInfo?.phone_number && (
                    <Badge className="bg-white/20 text-white border-white/30">📞 {clientInfo.phone_number}</Badge>
                  )}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                  <FileText className="h-12 w-12 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      {documents.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-secondary/30 to-accent/20">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No documents found for this client</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              It looks like there are no documents linked to {clientInfo?.full_name || "this client"} yet. Create a new
              document to get started.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href={`/create?clientId=${clientId}`}>
                <Plus className="h-5 w-5 mr-2" />
                Create First Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Client Documents</h2>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href={`/create?clientId=${clientId}`}>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Link>
            </Button>
          </div>

          <div className="grid gap-6">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <Link
                            href={`/documents/${doc.id}`}
                            className="text-xl font-semibold hover:text-primary transition-colors block truncate group-hover:text-primary"
                            title={doc.title}
                          >
                            {doc.title}
                          </Link>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Updated {formatDate(doc.updated_at)}</span>
                            </div>
                            <Badge className={`${getStatusBadgeClass(doc.status)} text-xs`}>
                              {doc.status.replace("-", " ")}
                            </Badge>
                          </div>
                        </div>
                        {doc.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doc.content.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="group-hover:border-primary/50 bg-transparent"
                      >
                        <Link href={`/documents/${doc.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
