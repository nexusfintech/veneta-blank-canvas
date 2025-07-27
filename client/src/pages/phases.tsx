import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Client } from "@shared/schema";
import { Building, User, MoveRight } from "lucide-react";

type PhaseType = "trattativa" | "contratto_inviato" | "contratto_firmato";

interface PhasesData {
  trattativa: Client[];
  contratto_inviato: Client[];
  contratto_firmato: Client[];
}

const phaseLabels: Record<PhaseType, string> = {
  trattativa: "In Trattativa",
  contratto_inviato: "Contratto Inviato", 
  contratto_firmato: "Contratto Firmato"
};

const phaseColors: Record<PhaseType, string> = {
  trattativa: "bg-yellow-100 border-yellow-200",
  contratto_inviato: "bg-blue-100 border-blue-200",
  contratto_firmato: "bg-green-100 border-green-200"
};

const phaseBadgeColors: Record<PhaseType, "secondary" | "default" | "destructive"> = {
  trattativa: "secondary",
  contratto_inviato: "default",
  contratto_firmato: "default"
};

export default function Phases() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [draggedClient, setDraggedClient] = useState<Client | null>(null);

  // Fetch clients grouped by phase
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      return response.json();
    },
  });

  // Group clients by phase
  const phasesData: PhasesData = {
    trattativa: clients?.filter(c => (c.practicePhase || "trattativa") === "trattativa") || [],
    contratto_inviato: clients?.filter(c => c.practicePhase === "contratto_inviato") || [],
    contratto_firmato: clients?.filter(c => c.practicePhase === "contratto_firmato") || []
  };

  // Mutation to update client phase
  const updatePhaseMutation = useMutation({
    mutationFn: async ({ clientId, newPhase }: { clientId: string; newPhase: PhaseType }) => {
      return await apiRequest(`/api/clients/${clientId}`, {
        method: "PUT",
        body: { practicePhase: newPhase },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Fase aggiornata",
        description: "La fase della pratica è stata aggiornata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (e: React.DragEvent, client: Client) => {
    setDraggedClient(client);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetPhase: PhaseType) => {
    e.preventDefault();
    if (draggedClient && draggedClient.practicePhase !== targetPhase) {
      updatePhaseMutation.mutate({
        clientId: draggedClient.id,
        newPhase: targetPhase,
      });
    }
    setDraggedClient(null);
  };

  const handlePhaseChange = (clientId: string, newPhase: PhaseType) => {
    updatePhaseMutation.mutate({ clientId, newPhase });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderClientCard = (client: Client) => (
    <Card 
      key={client.id}
      draggable
      onDragStart={(e) => handleDragStart(e, client)}
      className="mb-3 cursor-move hover:shadow-md transition-shadow bg-white"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              client.type === "persona_fisica" ? "bg-primary-100" : "bg-purple-100"
            }`}>
              {client.type === "persona_fisica" ? (
                <User className="h-4 w-4 text-primary-600" />
              ) : (
                <Building className="h-4 w-4 text-purple-600" />
              )}
            </div>
            <div>
              <div className="font-medium text-sm">
                {client.type === "persona_fisica" 
                  ? `${client.firstName} ${client.lastName}`
                  : client.companyName}
              </div>
              <div className="text-xs text-gray-500">{client.email}</div>
            </div>
          </div>
          <Badge variant={client.type === "persona_fisica" ? "default" : "secondary"} className="text-xs">
            {client.type === "persona_fisica" ? "PF" : "AZ"}
          </Badge>
        </div>
        
        <div className="space-y-1 text-xs text-gray-600">
          {client.requestedProduct && (
            <div><strong>Prodotto:</strong> {client.requestedProduct}</div>
          )}
          {client.requestedCapital && (
            <div><strong>Importo:</strong> {
              new Intl.NumberFormat('it-IT', { 
                style: 'currency', 
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              }).format(Number(client.requestedCapital))
            }</div>
          )}
          {user?.role === "admin" && (client as any).creatorName && (
            <div><strong>Proprietario:</strong> {(client as any).creatorName}</div>
          )}
        </div>

        {/* Phase selector for mobile/quick change */}
        <div className="mt-3">
          <Select 
            value={client.practicePhase || "trattativa"} 
            onValueChange={(value: PhaseType) => handlePhaseChange(client.id, value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trattativa">In Trattativa</SelectItem>
              <SelectItem value="contratto_inviato">Contratto Inviato</SelectItem>
              <SelectItem value="contratto_firmato">Contratto Firmato</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fasi delle Pratiche</h1>
        <p className="text-gray-600">Gestisci le fasi di ogni pratica cliente tramite kanban board</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(phasesData) as PhaseType[]).map((phase) => (
          <div key={phase}>
            <Card 
              className={`min-h-[500px] ${phaseColors[phase]}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, phase)}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{phaseLabels[phase]}</span>
                  <Badge variant={phaseBadgeColors[phase]} className="text-xs">
                    {phasesData[phase].length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {phasesData[phase].length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">Nessuna pratica in questa fase</div>
                    <div className="text-xs mt-1">Trascina qui le pratiche</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {phasesData[phase].map(renderClientCard)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center text-blue-800">
          <MoveRight className="h-5 w-5 mr-2" />
          <div>
            <div className="font-medium">Come usare il Kanban</div>
            <div className="text-sm mt-1">
              Trascina le pratiche tra le colonne per aggiornare la fase oppure usa il menu a tendina nella carta.
              Le modifiche vengono salvate automaticamente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}