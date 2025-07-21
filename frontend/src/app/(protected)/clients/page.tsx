"use client"

import { ClientList } from "@/components/clients/ClientList"
import { Users, Plus, Search } from "lucide-react"

export default function ClientsPage() {
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Client Management</h1>
                  <p className="text-xl text-white/90">Manage your clients and their documents</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 text-white border border-white/30 rounded-full px-3 py-1 text-sm">
                  <Search className="h-3 w-3 mr-1 inline" />
                  Search & Filter
                </div>
                <div className="bg-white/20 text-white border border-white/30 rounded-full px-3 py-1 text-sm">
                  <Plus className="h-3 w-3 mr-1 inline" />
                  Quick Add
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <ClientList />
    </div>
  )
}
