import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Handshake, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StatsCards } from "@/components/stats-cards";
import { SearchFilters } from "@/components/search-filters";
import { ClientsTable } from "@/components/clients-table";
import { ClientModal } from "@/components/client-modal";
import { apiRequest } from "@/lib/queryClient";
import { Client } from "@shared/schema";
import { ClientFormData } from "@/lib/validation";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);
  if (clientTypeFilter && clientTypeFilter !== "all") queryParams.append("type", clientTypeFilter);
  if (statusFilter && statusFilter !== "all") queryParams.append("status", statusFilter);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients", queryParams.toString()],
    queryFn: async () => {
      const url = `/api/clients${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsModalOpen(false);
      setEditingClient(null);
      toast({
        title: "Cliente creato",
        description: "Il cliente è stato creato con successo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la creazione del cliente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientFormData }) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsModalOpen(false);
      setEditingClient(null);
      toast({
        title: "Cliente aggiornato",
        description: "Il cliente è stato aggiornato con successo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'aggiornamento del cliente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Cliente eliminato",
        description: "Il cliente è stato eliminato con successo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante l'eliminazione del cliente.",
        variant: "destructive",
      });
    },
  });

  const handleOpenModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = (data: ClientFormData) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo cliente?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Handshake className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-slate-900">Gestionale Mediatore</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <UserCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Marco Rossi</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Anagrafica Clienti</h2>
              <p className="text-slate-600 mt-1">Gestisci le anagrafiche di persone fisiche e aziende</p>
            </div>
            <Button onClick={handleOpenModal} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuovo Cliente</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Search and Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          clientTypeFilter={clientTypeFilter}
          onClientTypeChange={setClientTypeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Clients Table */}
        <ClientsTable
          clients={clients}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
          isLoading={isLoading}
        />
      </main>

      {/* Client Modal */}
      <ClientModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        client={editingClient}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
