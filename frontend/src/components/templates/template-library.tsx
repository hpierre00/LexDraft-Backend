"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, FileText, Star, StarOff, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Template {
  id: string
  name: string
  description: string
  category: string
  usedBy: number
  isFavorite: boolean
  tags: string[]
}

export function TemplateLibrary() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    // Simulate API call
    const fetchTemplates = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTemplates([
        {
          id: "1",
          name: "Employment Agreement",
          description: "Standard employment agreement for full-time employees",
          category: "employment",
          usedBy: 885,
          isFavorite: false,
          tags: ["employment", "full-time", "standard"],
        },
        {
          id: "2",
          name: "Non-Disclosure Agreement",
          description: "Protect your confidential information with this NDA template",
          category: "commercial",
          usedBy: 1243,
          isFavorite: true,
          tags: ["confidentiality", "protection", "commercial"],
        },
        {
          id: "3",
          name: "Software License Agreement",
          description: "License your software products with this comprehensive agreement",
          category: "ip",
          usedBy: 567,
          isFavorite: false,
          tags: ["software", "license", "intellectual property"],
        },
        {
          id: "4",
          name: "Service Agreement",
          description: "Template for service providers and their clients",
          category: "commercial",
          usedBy: 932,
          isFavorite: true,
          tags: ["services", "commercial", "business"],
        },
        {
          id: "5",
          name: "Consulting Agreement",
          description: "Agreement for consultants and consulting services",
          category: "commercial",
          usedBy: 721,
          isFavorite: false,
          tags: ["consulting", "services", "professional"],
        },
        {
          id: "6",
          name: "Independent Contractor Agreement",
          description: "Define the relationship with independent contractors",
          category: "employment",
          usedBy: 654,
          isFavorite: false,
          tags: ["contractor", "freelance", "employment"],
        },
        {
          id: "7",
          name: "Privacy Policy",
          description: "Comprehensive privacy policy for websites and applications",
          category: "data",
          usedBy: 1876,
          isFavorite: true,
          tags: ["privacy", "data protection", "compliance"],
        },
        {
          id: "8",
          name: "Terms of Service",
          description: "Standard terms of service for online platforms",
          category: "data",
          usedBy: 2134,
          isFavorite: false,
          tags: ["terms", "service", "platform"],
        },
      ])

      setIsLoading(false)
    }

    fetchTemplates()
  }, [])

  const toggleFavorite = (id: string) => {
    setTemplates(
      templates.map((template) => (template.id === id ? { ...template, isFavorite: !template.isFavorite } : template)),
    )

    const template = templates.find((t) => t.id === id)

    toast({
      title: template?.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: template?.isFavorite
        ? `${template.name} has been removed from your favorites.`
        : `${template.name} has been added to your favorites.`,
    })
  }

  const handleUseTemplate = (template: Template) => {
    toast({
      title: "Template selected",
      description: `You are now using the ${template.name} template.`,
    })
  }

  const handleDownloadTemplate = (template: Template) => {
    toast({
      title: "Template downloaded",
      description: `${template.name} has been downloaded.`,
    })
  }

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "commercial", name: "Commercial" },
    { id: "employment", name: "Employment" },
    { id: "ip", name: "IP & Data" },
    { id: "data", name: "Data Protection" },
    { id: "favorites", name: "My Favorites" },
  ]

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "favorites" && template.isFavorite) ||
      template.category === activeCategory

    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/templates/upload">Upload Template</Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="rounded-full">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {filteredTemplates.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search query" : "No templates available in this category"}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{template.name}</CardTitle>
                          <CardDescription className="mt-1">{template.description}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(template.id)}>
                          {template.isFavorite ? (
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {template.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          </span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-6 py-3">
                      <div className="text-sm text-muted-foreground">Used by {template.usedBy} people</div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadTemplate(template)}>
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </Button>
                        <Button size="sm" onClick={() => handleUseTemplate(template)}>
                          Use Template
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
