"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface Document {
  id: string
  title: string
  updatedAt: string
  status: "draft" | "completed" | "in-review"
}

export function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchDocuments = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setDocuments([
        {
          id: "1",
          title: "Employment Agreement - Software Engineer",
          updatedAt: "2023-05-15T10:30:00Z",
          status: "completed",
        },
        {
          id: "2",
          title: "Non-Disclosure Agreement - Project Alpha",
          updatedAt: "2023-05-14T14:45:00Z",
          status: "draft",
        },
        {
          id: "3",
          title: "Service Agreement - Web Development",
          updatedAt: "2023-05-12T09:15:00Z",
          status: "in-review",
        },
        {
          id: "4",
          title: "Software License Agreement",
          updatedAt: "2023-05-10T16:20:00Z",
          status: "completed",
        },
      ])

      setIsLoading(false)
    }

    fetchDocuments()
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
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-review":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create your first document to get started</p>
          <Button asChild className="mt-4">
            <Link href="/create">Create document</Link>
          </Button>
        </div>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Link href={`/documents/${doc.id}`} className="font-medium hover:underline">
                  {doc.title}
                </Link>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Updated {formatDate(doc.updatedAt)}</span>
                  <span>•</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(doc.status)}`}>
                    {doc.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link href={`/documents/${doc.id}`} className="flex w-full">
                    Edit document
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Download PDF</DropdownMenuItem>
                <DropdownMenuItem>Share document</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete document</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))
      )}
    </div>
  )
}
