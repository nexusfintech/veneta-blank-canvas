import { useState } from "react";
import { Eye, Edit, FileText, Trash2, User, Building, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Client } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onView?: (client: Client) => void;
  isLoading?: boolean;
}

export function ClientsTable({ clients, onEdit, onDelete, onView, isLoading }: ClientsTableProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});

  const generateZohoSignUrl = (client: Client) => {
    return "https://sign.zoho.eu/zsfl/eQ5Xh9cwtQ7SL4tbPSlm?i=7857";
  };

  const handleContractGeneration = (client: Client) => {
    const contractUrl = generateZohoSignUrl(client);

    setGeneratedUrls(prev => ({
      ...prev,
      [client.id]: contractUrl
    }));

    toast({
      title: "URL Contratto Generato",
      description: `L'URL del contratto per ${client.type === 'azienda' ? client.companyName : `${client.firstName} ${client.lastName}`} è stato generato.`,
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copiato",
      description: "L'URL è stato copiato negli appunti.",
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
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo Cliente</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Prodotto</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Importo</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Codice Fiscale/P.IVA</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contatti</TableHead>
                {user?.role === "admin" && (
                  <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Proprietario</TableHead>
                )}
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === "admin" ? 8 : 7} className="text-center py-8 text-slate-500">
                    Nessun cliente trovato
                  </TableCell>
                </TableRow>
              ) : (
                clients.flatMap((client) => [
                  <TableRow 
                    key={client.id} 
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onView ? onView(client) : onEdit(client)}
                  >
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
                      <div className="font-medium">{client.requestedProduct || "N/A"}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      <div className="font-medium">
                        {client.requestedCapital ? `€ ${parseInt(client.requestedCapital).toLocaleString('it-IT')}` : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-900">
                      {client.type === "persona_fisica" ? client.fiscalCode : client.vatNumber}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      <div>{client.phone}</div>
                      <div>{client.city}</div>
                    </TableCell>
                    {user?.role === "admin" && (
                      <TableCell className="text-sm text-slate-500 w-24">
                        <div className="truncate">{(client as any).creatorName || "N/A"}</div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary-600 hover:text-primary-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView ? onView(client) : onEdit(client);
                          }}
                          title="Visualizza"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(client);
                          }}
                          title="Modifica"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Delete button clicked for client ID:", client.id);
                            onDelete(client.id);
                          }}
                          title="Elimina"
                          disabled={false} // We don't have access to loading state here, but we can add it later
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open("https://sign.zoho.eu/zsfl/eQ5Xh9cwtQ7SL4tbPSlm?i=7857", "_blank");
                          }}
                          title="Genera contratto"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>,
                  ...(generatedUrls[client.id] ? [
                    <TableRow key={`${client.id}-url`}>
                      <TableCell colSpan={6} className="bg-green-50 border-l-4 border-green-400">
                        <div className="py-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-800">URL Contratto Zoho Sign Generato:</span>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generatedUrls[client.id])}
                                className="text-green-700 border-green-300 hover:bg-green-100"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copia
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(generatedUrls[client.id], '_blank')}
                                className="text-green-700 border-green-300 hover:bg-green-100"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Apri
                              </Button>
                            </div>
                          </div>
                          <div className="p-2 bg-white border border-green-200 rounded text-xs font-mono break-all text-slate-600 max-h-20 overflow-y-auto">
                            {generatedUrls[client.id]}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ] : [])
                ])
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}