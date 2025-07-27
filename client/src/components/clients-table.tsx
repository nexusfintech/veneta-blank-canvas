import { useState } from "react";
import { Eye, Edit, FileText, Trash2, User, Building, Copy, ExternalLink } from "lucide-react";
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
  onView?: (client: Client) => void;
  isLoading?: boolean;
}

export function ClientsTable({ clients, onEdit, onDelete, onView, isLoading }: ClientsTableProps) {
  const { toast } = useToast();
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});

  const generateZohoSignUrl = (client: Client) => {
    const baseUrl = "https://sign.zoho.eu/zsfl/eQ5Xh9cwtQ7SL4tbPSlm";
    const params = new URLSearchParams({
      'i': '7857',
      'recipient_name': client.companyName || `${client.firstName || ' '} ${client.lastName || ' '}`,
      'recipient_email': client.email || ' ',
      'e contrattuali del contratto di mediazione sottoscritto in data': client.contractDate || ' ',
      'Compenso mediatore': client.mediatorCompensation || ' ',
      'Euro': client.requestedCapital || ' ',
      'Ragione sociale': client.companyName || ' ',
      'Sede legale': `${client.legalAddress || ' '}, ${client.legalZipCode || ' '} ${client.legalCity || ' '} (${client.legalProvince || ' '})`,
      'Telefono': client.phone || ' ',
      'Fax': client.fax || ' ',
      'Indirizzo email': client.email || ' ',
      'PEC': client.pec || ' ',
      'Partita IVA': client.vatNumber || ' ',
      'Codice Fiscale': client.companyFiscalCode || client.fiscalCode || ' ',
      'Nome cognome': client.legalRepresentative ? `${client.legalRepresentative.firstName || ' '} ${client.legalRepresentative.lastName || ' '}` : ' ',
      'nome mediatore': 'Venetagroup S.r.l.',
      'PRODOTTO FINANZIARIO RICHIESTO:': client.requestedProduct || ' ',
      'CAPITALE RICHIESTO': client.requestedCapital || ' ',
      'TIPOLOGIA TASSO': client.interestRateType || ' ',
      'DURATA DEL FINANZIAMENTO': client.financingDuration || ' ',
      '% mediatore': client.commission || ' ',
      'Luogo e data': `${client.legalCity || client.city || ' '}, ${client.contractDate || ' '}`,
      'Nome Cognome': client.legalRepresentative ? `${client.legalRepresentative.firstName || ' '} ${client.legalRepresentative.lastName || ' '}` : `${client.firstName || ' '} ${client.lastName || ' '}`,
      'Codice fiscale': client.legalRepresentative?.fiscalCode || client.fiscalCode || ' ',
      'Luogo e data di nascita': client.legalRepresentative ? `${client.legalRepresentative.birthPlace || ' '}, ${client.legalRepresentative.birthDate || ' '}` : `${client.birthPlace || ' '}, ${client.birthDate || ' '}`,
      'Indirizzo di residenza': client.legalRepresentative?.residenceAddress || client.address || ' ',
      'CAP': client.legalRepresentative?.residenceZipCode || client.zipCode || ' ',
      'Comune': client.legalRepresentative?.residenceCity || client.city || ' ',
      'Prov': client.legalRepresentative?.residenceProvince || client.province || ' ',
      'Tipo documento identifi': client.legalRepresentative?.documentType || client.documentType || ' ',
      'Numero documento': client.legalRepresentative?.documentNumber || client.documentNumber || ' ',
      'Luogo e data rilascio': client.legalRepresentative ? `${client.legalRepresentative.documentIssuePlace || ' '}, ${client.legalRepresentative.documentIssueDate || ' '}` : `${client.documentIssuePlace || ' '}, ${client.documentIssueDate || ' '}`,
      'Autorit rilascio': client.legalRepresentative?.documentAuthority || client.documentIssuedBy || ' ',
      'Tipo documento identific.': client.legalRepresentative?.documentType || client.documentType || ' ',
      'Autorita rilascio': client.legalRepresentative?.documentAuthority || client.documentIssuedBy || ' ',
      'Addetto di Venetagroup S.r.I. che ha raccolto le informazioni e innanzi al quale il/i dichiarante/': 'Venetagroup S.r.l.',
      'cod. Fisc': client.companyFiscalCode || client.fiscalCode || ' ',
      'e': client.vatNumber || ' ',
      'Cod. Fisc. e Part. IVA': `${client.companyFiscalCode || client.fiscalCode || ' '} - ${client.vatNumber || ' '}`,
      'con sede legale in': `${client.legalAddress || client.address || ' '}, ${client.legalZipCode || client.zipCode || ' '} ${client.legalCity || client.city || ' '} (${client.legalProvince || client.province || ' '})`,
      'in persona di': client.legalRepresentative ? `${client.legalRepresentative.firstName || ' '} ${client.legalRepresentative.lastName || ' '}` : `${client.firstName || ' '} ${client.lastName || ' '}`,
      'Per Venetagroup S.r.I. (Sig.': 'Venetagroup S.r.l.',
      'Luogo e Data': `${client.legalCity || client.city || ' '}, ${new Date().toLocaleDateString('it-IT')}`,
      'Sig ../ra': client.legalRepresentative ? `${client.legalRepresentative.firstName || ' '} ${client.legalRepresentative.lastName || ' '}` : `${client.firstName || ' '} ${client.lastName || ' '}`,
      'Sig./ra': client.legalRepresentative ? `${client.legalRepresentative.firstName || ' '} ${client.legalRepresentative.lastName || ' '}` : `${client.firstName || ' '} ${client.lastName || ' '}`,
      'INDIRIZZO:': client.legalAddress || client.address || ' ',
      'CODICE FISCALE,': client.companyFiscalCode || client.fiscalCode || ' ',
      'PRODOTTO': client.requestedProduct || ' ',
      'RICHIEDENTE/I': client.companyName || `${client.firstName || ' '} ${client.lastName || ' '}`,
      // Campi aggiuntivi per completezza del contratto
      'provincia o Stato estero di svolgimento principale attività': client.mainActivityProvince || ' ',
      'provincia/stato estero di destinazione del rapporto': client.relationshipDestinationProvince || ' ',
      'provincia/stato area controparte': client.counterpartyAreaProvince || ' ',
      'attività professionale svolta dal cliente': client.professionalActivity || ' ',
      'oneri di istruttoria': client.instructionFees || ' ',
      'data di sottoscrizione del contratto': client.contractDate || ' '
    });
    
    return `${baseUrl}?${params.toString()}`;
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
                          className="text-amber-600 hover:text-amber-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContractGeneration(client);
                          }}
                          title="Genera Contratto"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(client.id);
                          }}
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4" />
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
