import { Eye, Edit, FileText, Trash2, User, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function ClientsTable({ clients, onEdit, onDelete, isLoading }: ClientsTableProps) {
  const { toast } = useToast();

  const handleContractGeneration = () => {
    toast({
      title: "Funzionalità in arrivo",
      description: "La generazione automatica dei contratti sarà disponibile presto.",
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Lista Clienti</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span>Mostra {clients.length} risultati</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Codice Fiscale/P.IVA</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contatti</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nessun cliente trovato
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          client.type === "persona_fisica" ? "bg-primary-100" : "bg-purple-100"
                        }`}>
                          {client.type === "persona_fisica" ? (
                            <User className={`h-5 w-5 ${client.type === "persona_fisica" ? "text-primary-600" : "text-purple-600"}`} />
                          ) : (
                            <Building className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {client.type === "persona_fisica" 
                              ? `${client.firstName} ${client.lastName}`
                              : client.companyName}
                          </div>
                          <div className="text-sm text-slate-500">{client.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.type === "persona_fisica" ? "default" : "secondary"}>
                        {client.type === "persona_fisica" ? "Persona Fisica" : "Azienda"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {client.type === "persona_fisica" ? client.fiscalCode : client.vatNumber}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      <div>{client.phone}</div>
                      <div>{client.city}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === "attivo" ? "default" : "secondary"}>
                        {client.status === "attivo" ? "Attivo" : "Inattivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary-600 hover:text-primary-900"
                          title="Visualizza"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-900"
                          onClick={() => onEdit(client)}
                          title="Modifica"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-900"
                          onClick={handleContractGeneration}
                          title="Genera Contratto (Coming Soon)"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => onDelete(client.id)}
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
