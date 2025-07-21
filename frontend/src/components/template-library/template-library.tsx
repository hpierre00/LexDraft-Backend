"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Search, FileText, Download, ChevronLeft, ChevronRight, BookOpen, Star, Filter, Grid3X3, List, Calendar, Tag, Sparkles, Eye, Plus, Edit, Trash2, Upload, MoreHorizontal } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { templateService, type Template } from "@/api/templates"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Checkbox } from "@/components/ui/checkbox"

export function TemplateLibrary() {
  const { toast } = useToast()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories, setCategories] = useState<{ id: string; name: string; document_type_id?: string }[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    fetchTemplatesAndCategories()
  }, [searchQuery, activeCategory])

  const fetchTemplatesAndCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const selectedCategory = categories.find((cat) => cat.id === activeCategory)
      const documentTypeId = activeCategory === "all" ? undefined : selectedCategory?.document_type_id
      
      const fetchedTemplates = await templateService.listWithFilters(
        undefined,
        documentTypeId,
        searchQuery,
      )
      
      setTemplates(fetchedTemplates)
      
      if (categories.length === 0) {
        const uniqueCategories = new Set<string>()
        const tempCategories: {
          id: string
          name: string
          document_type_id?: string
        }[] = [{ id: "all", name: "All Templates" }]
        
        fetchedTemplates.forEach((template) => {
          if (
            template.document_types?.document_type_name &&
            !uniqueCategories.has(template.document_types.document_type_name)
          ) {
            uniqueCategories.add(template.document_types.document_type_name)
            tempCategories.push({
              id: template.document_types.document_type_name.toLowerCase().replace(/\s/g, "-"),
              name: template.document_types.document_type_name,
              document_type_id: template.document_types.document_type_id,
            })
          }
        })
        
        setCategories(tempCategories)
      }
      
      setCurrentPage(1)
    } catch (err) {
      console.error("Failed to fetch templates:", err)
      setError("Failed to load templates. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseTemplate = (template: Template) => {
    router.push(
      `/create?title=${encodeURIComponent(template.template_name)}&templateId=${encodeURIComponent(template.id)}`,
    )
    toast({
      title: "Template selected",
      description: `You are now using the ${template.template_name} template.`,
    })
  }

  const handleDownloadTemplate = async (template: Template) => {
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

  const handleDeleteTemplate = async (template: Template) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return
    
    setIsDeleting(true)
    try {
      await templateService.delete(templateToDelete.id)
      setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      toast({
        title: "Template deleted",
        description: `${templateToDelete.template_name} has been deleted.`,
      })
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
      setTemplateToDelete(null)
    }
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      const deletePromises = Array.from(selectedTemplates).map(id => 
        templateService.delete(id)
      )
      await Promise.all(deletePromises)
      
      setTemplates(templates.filter(t => !selectedTemplates.has(t.id)))
      setSelectedTemplates(new Set())
      
      toast({
        title: "Templates deleted",
        description: `${selectedTemplates.size} templates have been deleted.`,
      })
    } catch (error) {
      console.error("Failed to delete templates:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete some templates. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  const handleSelectTemplate = (templateId: string, checked: boolean) => {
    const newSelected = new Set(selectedTemplates)
    if (checked) {
      newSelected.add(templateId)
    } else {
      newSelected.delete(templateId)
    }
    setSelectedTemplates(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(new Set(currentTemplates.map(t => t.id)))
    } else {
      setSelectedTemplates(new Set())
    }
  }

  // Client-side pagination logic
  const indexOfLastTemplate = currentPage * itemsPerPage
  const indexOfFirstTemplate = indexOfLastTemplate - itemsPerPage
  const currentTemplates = useMemo(() => {
    return templates.slice(indexOfFirstTemplate, indexOfLastTemplate)
  }, [templates, indexOfFirstTemplate, indexOfLastTemplate])

  const totalPages = Math.ceil(templates.length / itemsPerPage)
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-80 w-full" />
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
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Templates</h3>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchTemplatesAndCategories} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Template Library
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Browse our extensive collection of professional legal templates. Find the perfect starting point for your
          documents.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            {templates.length}+ Templates
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            <Star className="h-3 w-3 mr-1" />
            Professional Quality
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-primary/20 bg-gradient-to-r from-secondary/30 to-accent/20">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates by name, type, or content..."
                className="pl-10 border-primary/30 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="w-[200px] border-primary/30">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border border-primary/30 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/templates/upload">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Template
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTemplates.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedTemplates.size} template{selectedTemplates.size !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplates(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Showing {indexOfFirstTemplate + 1}-{Math.min(indexOfLastTemplate, templates.length)} of {templates.length}{" "}
            templates
          </span>
          {(searchQuery || activeCategory !== "all") && (
            <Badge variant="outline" className="border-primary/30">
              Filtered
            </Badge>
          )}
        </div>
        {currentTemplates.length > 0 && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedTemplates.size === currentTemplates.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">Select all</span>
          </div>
        )}
      </div>

      {/* Templates Grid/List */}
      {currentTemplates.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-secondary/30 to-accent/20">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No templates found</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              {searchQuery || activeCategory !== "all"
                ? "Try adjusting your search query or filters to find what you're looking for"
                : "No templates available in this category"}
            </p>
            {searchQuery || activeCategory !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setActiveCategory("all")
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/templates/upload">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload First Template
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
          {currentTemplates.map((template) => (
            <Card
              key={template.id}
              className={`group hover:shadow-lg transition-all duration-200 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 overflow-hidden ${
                viewMode === "list" ? "flex flex-row" : ""
              } ${selectedTemplates.has(template.id) ? "ring-2 ring-primary/50" : ""}`}
            >
              {/* Grid View */}
              {viewMode === "grid" && (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedTemplates.has(template.id)}
                          onCheckedChange={(checked) => handleSelectTemplate(template.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm leading-tight truncate">{template.template_name}</CardTitle>
                          <CardDescription className="mt-1 text-xs line-clamp-2">
                            {template.content.substring(0, 80)}...
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/templates/${template.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/templates/${template.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteTemplate(template)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1 overflow-hidden">
                      {template.document_types?.document_type_name && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0 truncate max-w-[120px]"
                          title={template.document_types.document_type_name}
                        >
                          <Tag className="h-2 w-2 mr-1 flex-shrink-0" />
                          <span className="truncate">{template.document_types.document_type_name}</span>
                        </Badge>
                      )}
                      {template.states?.state_name && (
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-xs px-2 py-0 truncate max-w-[80px]"
                          title={template.states.state_name}
                        >
                          <span className="truncate">{template.states.state_name}</span>
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-4 py-3">
                    <div className="text-sm text-muted-foreground flex items-center space-x-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">{new Date(template.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="px-2 text-xs bg-transparent" asChild>
                        <Link href={`/templates/${template.id}`}>
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="bg-primary hover:bg-primary/90 px-3 text-xs"
                      >
                        Use
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <>
                  <div className="flex items-center space-x-3 p-4">
                    <Checkbox
                      checked={selectedTemplates.has(template.id)}
                      onCheckedChange={(checked) => handleSelectTemplate(template.id, checked as boolean)}
                    />
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 p-4 pr-0">
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="text-sm font-semibold truncate">{template.template_name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {template.content.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 overflow-hidden">
                          {template.document_types?.document_type_name && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0 truncate max-w-[120px]"
                              title={template.document_types.document_type_name}
                            >
                              <Tag className="h-2 w-2 mr-1 flex-shrink-0" />
                              <span className="truncate">{template.document_types.document_type_name}</span>
                            </Badge>
                          )}
                          {template.states?.state_name && (
                            <Badge
                              variant="outline"
                              className="border-primary/30 text-xs px-2 py-0 truncate max-w-[80px]"
                              title={template.states.state_name}
                            >
                              <span className="truncate">{template.states.state_name}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{new Date(template.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4 flex-shrink-0 p-4">
                        <Button variant="outline" size="sm" className="px-2 text-xs bg-transparent" asChild>
                          <Link href={`/templates/${template.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="bg-primary hover:bg-primary/90 px-3 text-xs"
                        >
                          Use
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/templates/${template.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTemplate(template)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-primary/30"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(pageNum)}
                        className={currentPage === pageNum ? "bg-primary" : "border-primary/30"}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-primary/30"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.template_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Templates</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTemplates.size} selected template{selectedTemplates.size !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
