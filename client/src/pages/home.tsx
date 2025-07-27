import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation, SidebarNavigation } from "@/components/navigation";
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
  const [isImporting, setIsImporting] = useState(false);

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
      console.log("Deleting client with ID:", id);
      const response = await apiRequest("DELETE", `/api/clients/${id}`);
      console.log("Delete response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("Client deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Cliente eliminato",
        description: "Il cliente è stato eliminato con successo.",
      });
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
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
    console.log("handleDeleteClient called with ID:", id);
    if (window.confirm("Sei sicuro di voler eliminare questo cliente?")) {
      console.log("User confirmed deletion, calling mutation");
      deleteMutation.mutate(id);
    } else {
      console.log("User cancelled deletion");
    }
  };

  // Excel import handler
  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Errore",
        description: "Seleziona un file Excel valido (.xlsx o .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      const formData = new FormData();
      formData.append("excel", file);

      const response = await fetch("/api/import-excel", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to import Excel file");
      }

      const result = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });

      toast({
        title: "Importazione completata",
        description: `${result.imported} clienti importati con successo${result.errors > 0 ? ` (${result.errors} errori)` : ''}`,
      });

      if (result.errors > 0 && result.errorDetails) {
        console.log("Import errors:", result.errorDetails);
      }

    } catch (error) {
      console.error("Excel import error:", error);
      toast({
        title: "Errore nell'importazione",
        description: "Non è stato possibile importare il file Excel. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarNavigation />
      </div>
      
      {/* Mobile Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Anagrafica Clienti</h2>
                <p className="text-slate-600 mt-1">Gestisci le anagrafiche di persone fisiche e aziende</p>
              </div>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelImport}
                    className="hidden"
                    disabled={isImporting}
                  />
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    <span>{isImporting ? "Importando..." : "Importa Excel"}</span>
                  </Button>
                </label>
                
                <Button onClick={handleOpenModal} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Nuovo Cliente</span>
                </Button>
              </div>
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
        </div>
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
