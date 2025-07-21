"use client"

import { useEffect, useState } from "react"
import { clientService, type ClientProfileResponse } from "@/api/clients"
import type { UUID } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PlusCircle, Search, User, Phone, MapPin, AlertCircle, FileText, Edit, Trash, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientCreateForm } from "./ClientCreateForm"
import { ClientEditForm } from "./ClientEditForm"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function ClientList() {
  const [clients, setClients] = useState<ClientProfileResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false)
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientProfileResponse | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await clientService.getAttorneyClients()
      setClients(data)
    } catch (err: any) {
      console.error("Failed to fetch clients:", err)
      setError(err.message || "Failed to load clients. Please try again later.")
      toast({
        title: "Error",
        description: err.message || "Failed to load clients.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClientCreateSuccess = () => {
    setIsCreateClientDialogOpen(false)
    fetchClients()
  }

  const handleClientEditSuccess = () => {
    setIsEditClientDialogOpen(false)
    fetchClients()
  }

  const handleDeleteClient = async (clientId: UUID) => {
    try {
      await clientService.deleteClientProfile(clientId)
      toast({
        title: "Client Deleted",
        description: "Client profile has been successfully deleted.",
      })
      fetchClients()
    } catch (error: any) {
      console.error("Failed to delete client:", error)
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete client.",
        variant: "destructive",
      })
    }
  }

  const filteredClients = clients.filter((client) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const matchesFullName = client.full_name.toLowerCase().includes(lowerCaseSearchTerm)
    const matchesPhoneNumber = client.phone_number && client.phone_number.toLowerCase().includes(lowerCaseSearchTerm)
    return matchesFullName || matchesPhoneNumber
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-24" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
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
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Clients</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchClients} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Add Client */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name or phone..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isCreateClientDialogOpen} onOpenChange={setIsCreateClientDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Add New Client
              </DialogTitle>
            </DialogHeader>
            <ClientCreateForm onSuccess={handleClientCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 && !searchTerm ? (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-secondary/30 to-accent/20">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No Clients Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't added any clients yet. Start building your client base by adding your first client.
            </p>
            <Dialog open={isCreateClientDialogOpen} onOpenChange={setIsCreateClientDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Your First Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Add New Client
                  </DialogTitle>
                </DialogHeader>
                <ClientCreateForm onSuccess={handleClientCreateSuccess} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : filteredClients.length === 0 && searchTerm ? (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Matching Clients</h3>
            <p className="text-muted-foreground mb-4">No clients match your search for "{searchTerm}".</p>
            <Button onClick={() => setSearchTerm("")} variant="outline" className="mt-2">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {client.full_name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Client
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="truncate">{client.phone_number || "No phone number"}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-start space-x-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">
                        {client.address}
                        {client.city && `, ${client.city}`}
                        {client.state && `, ${client.state}`}
                        {client.zip_code && ` ${client.zip_code}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      href={`/clients/${client.id}/documents`}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center group/link"
                    >
                      <FileText className="mr-1 h-4 w-4 group-hover/link:scale-110 transition-transform" />
                      View Documents
                    </Link>
                  </div>

                  <div className="flex justify-between space-x-2">
                    <Dialog
                      open={isEditClientDialogOpen && selectedClient?.id === client.id}
                      onOpenChange={(open) => {
                        setIsEditClientDialogOpen(open)
                        if (!open) setSelectedClient(null)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 hover:bg-primary/5 hover:border-primary/30 bg-transparent"
                          onClick={() => setSelectedClient(client)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            <Edit className="h-5 w-5 mr-2 text-primary" />
                            Edit Client
                          </DialogTitle>
                        </DialogHeader>
                        {selectedClient && (
                          <ClientEditForm clientId={selectedClient.id} onSuccess={handleClientEditSuccess} />
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10 hover:border-destructive/30 bg-transparent"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the client profile for{" "}
                            <strong>{client.full_name}</strong> and remove their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteClient(client.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete Client
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
