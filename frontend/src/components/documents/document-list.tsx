"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, MoreHorizontal, Plus, Search, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface Document {
  id: string
  title: string
  updatedAt: string
  status: "draft" | "completed" | "in-review"
  type: string
}

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

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
          type: "Employment",
        },
        {
          id: "2",
          title: "Non-Disclosure Agreement - Project Alpha",
          updatedAt: "2023-05-14T14:45:00Z",
          status: "draft",
          type: "NDA",
        },
        {
          id: "3",
          title: "Service Agreement - Web Development",
          updatedAt: "2023-05-12T09:15:00Z",
          status: "in-review",
          type: "Service",
        },
        {
          id: "4",
          title: "Software License Agreement",
          updatedAt: "2023-05-10T16:20:00Z",
          status: "completed",
          type: "License",
        },
        {
          id: "5",
          title: "Consulting Agreement - Marketing Strategy",
          updatedAt: "2023-05-08T11:20:00Z",
          status: "draft",
          type: "Consulting",
        },
        {
          id: "6",
          title: "Partnership Agreement - Joint Venture",
          updatedAt: "2023-05-05T13:40:00Z",
          status: "completed",
          type: "Partnership",
        },
        {
          id: "7",
          title: "Lease Agreement - Office Space",
          updatedAt: "2023-05-03T09:10:00Z",
          status: "in-review",
          type: "Lease",
        },
        {
          id: "8",
          title: "Independent Contractor Agreement",
          updatedAt: "2023-05-01T15:30:00Z",
          status: "completed",
          type: "Employment",
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

  const filteredDocuments = documents
    .filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (statusFilter === "all" || doc.status === statusFilter),
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime()
      const dateB = new Date(b.updatedAt).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 rounded-lg border p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            <span className="sr-only">Sort by date {sortOrder === "asc" ? "ascending" : "descending"}</span>
          </Button>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first document to get started"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button asChild className="mt-4">
              <Link href="/create">Create document</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
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
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span>Updated {formatDate(doc.updatedAt)}</span>
                    <span>•</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(doc.status)}`}>
                      {doc.status.replace("-", " ")}
                    </span>
                    <span>•</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      {doc.type}
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
          ))}
        </div>
      )}
    </div>
  )
}
