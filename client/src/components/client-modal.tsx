import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  X, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2,
  User,
  Building,
  CreditCard,
  MapPin,
  Euro
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clientFormSchema, type ClientFormData } from "@/lib/validation";
import { Client } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => void;
  client?: Client | null;
  isSaving?: boolean;
}

export function ClientModal({ open, onClose, onSave, client, isSaving }: ClientModalProps) {
  const { toast } = useToast();
  const [clientType, setClientType] = useState<"persona_fisica" | "azienda">("persona_fisica");
  const [generatedUrl, setGeneratedUrl] = useState<string>("");
  const [openSections, setOpenSections] = useState({
    personal: true,
    residence: false,
    document: false,
    company: true,
    representative: false,
    owners: false,
    geography: false,
    product: false,
    compensation: false
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      type: "persona_fisica",
      status: "attivo",
      firstName: "",
      lastName: "",
      fiscalCode: "",
      birthDate: "",
      gender: "",
      birthPlace: "",
      citizenship: "",
      residenceLocality: "",
      documentType: "",
      documentNumber: "",
      documentIssuedBy: "",
      documentIssuePlace: "",
      documentIssueDate: "",
      companyName: "",
      vatNumber: "",
      companyFiscalCode: "",
      repFirstName: "",
      repLastName: "",
      repFiscalCode: "",
      repBirthPlace: "",
      repBirthDate: "",
      repResidenceAddress: "",
      repResidenceZipCode: "",
      repResidenceCity: "",
      repResidenceProvince: "",
      repDocumentType: "",
      repDocumentNumber: "",
      repDocumentAuthority: "",
      repDocumentIssuePlace: "",
      repDocumentIssueDate: "",
      legalAddress: "",
      legalZipCode: "",
      legalCity: "",
      legalProvince: "",
      fax: "",
      pec: "",
      legalRepresentative: {
        firstName: "",
        lastName: "",
        fiscalCode: "",
        birthPlace: "",
        birthDate: "",
        residenceAddress: "",
        residenceZipCode: "",
        residenceCity: "",
        residenceProvince: "",
        documentType: "",
        documentNumber: "",
        documentAuthority: "",
        documentIssuePlace: "",
        documentIssueDate: "",
        isPoliticallyExposed: false,
        benefitsPublicFunds: false,
        hasApicalRoles: false,
        hasPublicCharges: false,
        hasCriminalRecord: false,
      },
      beneficialOwners: [],
      mainActivityProvince: "",
      relationshipDestinationProvince: "",
      counterpartyAreaProvince: "",
      professionalActivity: "",
      requestedProduct: "",
      requestedCapital: "",
      financingDuration: "",
      interestRateType: "",
      mediatorCompensation: "",
      compensationType: "amount",
      commission: "",
      commissionType: "percentage",
      instructionFees: "",
      contractDate: "",
      email: "",
      phone: "",
      address: "",
      zipCode: "",
      city: "",
      province: "",
      notes: "",
    },
  });

  const { fields: beneficialOwnerFields, append: addBeneficialOwner, remove: removeBeneficialOwner } = useFieldArray({
    control: form.control,
    name: "beneficialOwners"
  });

  useEffect(() => {
    if (client) {
      // Edit mode
      const formData: ClientFormData = {
        type: client.type as "persona_fisica" | "azienda",
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        fiscalCode: client.fiscalCode || "",
        birthDate: client.birthDate || "",
        companyName: client.companyName || "",
        vatNumber: client.vatNumber || "",
        companyFiscalCode: client.companyFiscalCode || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        zipCode: client.zipCode || "",
        city: client.city || "",
        province: client.province || "",
        notes: client.notes || "",
        status: client.status as "attivo" | "inattivo",
      };
      form.reset(formData);
      setClientType(client.type as "persona_fisica" | "azienda");
    } else {
      // Add mode
      form.reset({
        type: "persona_fisica",
        status: "attivo",
        firstName: "",
        lastName: "",
        fiscalCode: "",
        birthDate: "",
        companyName: "",
        vatNumber: "",
        companyFiscalCode: "",
        email: "",
        phone: "",
        address: "",
        zipCode: "",
        city: "",
        province: "",
        notes: "",
      });
      setClientType("persona_fisica");
    }
  }, [client, form]);

  const handleClientTypeChange = (value: string) => {
    const newType = value as "persona_fisica" | "azienda";
    setClientType(newType);
    form.setValue("type", newType);
  };

  const generateZohoSignUrl = (clientData: ClientFormData) => {
    const baseUrl = "https://sign.zoho.eu/zsfl/eQ5Xh9cwtQ7SL4tbPSlm";
    const params = new URLSearchParams({
      'i': '7857',
      'recipient_name': clientData.companyName || '',
      'recipient_email': clientData.email || '',
      'e contrattuali del contratto di mediazione sottoscritto in data': clientData.contractDate || '',
      'Compenso mediatore': clientData.mediatorCompensation || '',
      'Euro': clientData.requestedCapital || '',
      'Ragione sociale': clientData.companyName || '',
      'Sede legale': `${clientData.legalAddress || ''}, ${clientData.legalZipCode || ''} ${clientData.legalCity || ''} (${clientData.legalProvince || ''})`,
      'Telefono': clientData.phone || '',
      'Fax': clientData.fax || '',
      'Indirizzo email': clientData.email || '',
      'PEC': clientData.pec || '',
      'Partita IVA': clientData.vatNumber || '',
      'Codice Fiscale': clientData.companyFiscalCode || '',
      'Nome cognome': `${clientData.legalRepresentative?.firstName || ''} ${clientData.legalRepresentative?.lastName || ''}`,
      'nome mediatore': 'Venetagroup S.r.l.',
      'PRODOTTO FINANZIARIO RICHIESTO:': clientData.requestedProduct || '',
      'CAPITALE RICHIESTO': clientData.requestedCapital || '',
      'TIPOLOGIA TASSO': clientData.interestRateType || '',
      'DURATA DEL FINANZIAMENTO': clientData.financingDuration || '',
      '% mediatore': clientData.commission || '',
      'Luogo e data': `${clientData.legalCity || ''}, ${clientData.contractDate || ''}`,
      'Nome Cognome': `${clientData.legalRepresentative?.firstName || ''} ${clientData.legalRepresentative?.lastName || ''}`,
      'Codice fiscale': clientData.legalRepresentative?.fiscalCode || '',
      'Luogo e data di nascita': `${clientData.legalRepresentative?.birthPlace || ''}, ${clientData.legalRepresentative?.birthDate || ''}`,
      'Indirizzo di residenza': clientData.legalRepresentative?.residenceAddress || '',
      'CAP': clientData.legalRepresentative?.residenceZipCode || '',
      'Comune': clientData.legalRepresentative?.residenceCity || '',
      'Prov': clientData.legalRepresentative?.residenceProvince || '',
      'Tipo documento identifi': clientData.legalRepresentative?.documentType || '',
      'Numero documento': clientData.legalRepresentative?.documentNumber || '',
      'Luogo e data rilascio': `${clientData.legalRepresentative?.documentIssuePlace || ''}, ${clientData.legalRepresentative?.documentIssueDate || ''}`,
      'Autorit rilascio': clientData.legalRepresentative?.documentAuthority || '',
      'Tipo documento identific.': clientData.legalRepresentative?.documentType || '',
      'Autorita rilascio': clientData.legalRepresentative?.documentAuthority || '',
      'Addetto di Venetagroup S.r.I. che ha raccolto le informazioni e innanzi al quale il/i dichiarante/': 'Venetagroup S.r.l.',
      'cod. Fisc': clientData.companyFiscalCode || '',
      'e': clientData.vatNumber || '',
      'Cod. Fisc. e Part. IVA': `${clientData.companyFiscalCode || ''} - ${clientData.vatNumber || ''}`,
      'con sede legale in': `${clientData.legalAddress || ''}, ${clientData.legalZipCode || ''} ${clientData.legalCity || ''} (${clientData.legalProvince || ''})`,
      'in persona di': `${clientData.legalRepresentative?.firstName || ''} ${clientData.legalRepresentative?.lastName || ''}`,
      'Per Venetagroup S.r.I. (Sig.': 'Venetagroup S.r.l.',
      'Luogo e Data': `${clientData.legalCity || ''}, ${new Date().toLocaleDateString('it-IT')}`,
      'Sig ../ra': `${clientData.legalRepresentative?.firstName || ''} ${clientData.legalRepresentative?.lastName || ''}`,
      'Sig./ra': `${clientData.legalRepresentative?.firstName || ''} ${clientData.legalRepresentative?.lastName || ''}`,
      'INDIRIZZO:': clientData.legalAddress || '',
      'CODICE FISCALE,': clientData.companyFiscalCode || '',
      'PRODOTTO': clientData.requestedProduct || '',
      'RICHIEDENTE/I': clientData.companyName || ''
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handleContractGeneration = () => {
    if (clientType === "azienda") {
      const formData = form.getValues();
      const contractUrl = generateZohoSignUrl(formData);
      
      setGeneratedUrl(contractUrl);
      
      toast({
        title: "URL Contratto Generato",
        description: "L'URL del contratto è stato generato e visualizzato sotto il pulsante.",
      });
    } else {
      toast({
        title: "Funzionalità in arrivo",
        description: "La generazione contratti per persone fisiche sarà disponibile presto.",
      });
    }
  };

  const onSubmit = (data: ClientFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? "Modifica Cliente" : "Aggiungi Nuovo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {client ? "Modifica i dettagli del cliente esistente" : "Inserisci i dettagli per un nuovo cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Type Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-3">Tipo di Cliente</Label>
              <RadioGroup
                value={clientType}
                onValueChange={handleClientTypeChange}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="persona_fisica" id="persona_fisica" />
                  <Label htmlFor="persona_fisica">Persona Fisica</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="azienda" id="azienda" />
                  <Label htmlFor="azienda">Azienda</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Person Form */}
            {clientType === "persona_fisica" && (
              <div className="space-y-6">
                {/* Dati Anagrafici */}
                <Collapsible open={openSections.personal} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, personal: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Dati Anagrafici</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.personal ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cognome *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sesso</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="M">Maschio</SelectItem>
                                <SelectItem value="F">Femmina</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="birthPlace"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Luogo di Nascita</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data di Nascita *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fiscalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codice Fiscale *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="RSSMRA85M01H501Z" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="citizenship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cittadinanza</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Italiana" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Residenza */}
                <Collapsible open={openSections.residence} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, residence: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Residenza</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.residence ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="residenceLocality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Località/Comune di Residenza</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indirizzo (Via/Piazza e numero civico)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Via Roma, 123" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CAP</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provincia</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Documento di Identità */}
                <Collapsible open={openSections.document} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, document: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Documento di Identità</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.document ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo Documento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="carta_identita">Carta d'Identità</SelectItem>
                                <SelectItem value="passaporto">Passaporto</SelectItem>
                                <SelectItem value="patente">Patente di Guida</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="documentNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numero Documento</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="documentIssuedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Autorità che ha rilasciato</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Comune di Milano" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="documentIssuePlace"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Luogo di Rilascio</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="documentIssueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data di Rilascio</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Prodotto Richiesto */}
                <Collapsible open={openSections.product} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, product: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Prodotto Richiesto</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.product ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="requestedProduct"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prodotto Finanziario Richiesto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona prodotto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mutuo_ipotecario">Mutuo Ipotecario</SelectItem>
                              <SelectItem value="prestito_personale">Prestito Personale</SelectItem>
                              <SelectItem value="finanziamento_auto">Finanziamento Auto</SelectItem>
                              <SelectItem value="cessione_quinto">Cessione del Quinto</SelectItem>
                              <SelectItem value="carta_credito">Carta di Credito</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="requestedCapital"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capitale Richiesto (€)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="financingDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durata Finanziamento (mesi)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="interestRateType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipologia di Tasso</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona tipo tasso" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fisso">Fisso</SelectItem>
                                <SelectItem value="variabile">Variabile</SelectItem>
                                <SelectItem value="misto">Misto</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Compenso e Oneri */}
                <Collapsible open={openSections.compensation} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, compensation: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Compenso e Oneri</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.compensation ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mediatorCompensation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compenso Mediatore (€ o %)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="1500 o 2.5%" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="commission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provvigione (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="instructionFees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Oneri di Istruttoria (€)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contractDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Sottoscrizione Contratto</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Company Form */}
            {clientType === "azienda" && (
              <div className="space-y-6">
                {/* Dati Aziendali */}
                <Collapsible open={openSections.company} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, company: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Dati Aziendali</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.company ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Denominazione/Ragione Sociale *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="vatNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partita IVA *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="IT12345678901" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyFiscalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codice Fiscale</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium text-slate-800">Sede Legale</h5>
                      <FormField
                        control={form.control}
                        name="legalAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indirizzo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="legalZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CAP</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="legalCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Città</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="legalProvince"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provincia</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fax</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="pec"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PEC</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Legale Rappresentante */}
                <Collapsible open={openSections.representative} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, representative: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Legale Rappresentante</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.representative ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="repFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="repLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cognome *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="repFiscalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Codice Fiscale *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="repBirthDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data di Nascita</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium text-slate-800">Residenza</h5>
                      <FormField
                        control={form.control}
                        name="repResidenceAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indirizzo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="repResidenceZipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CAP</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="repResidenceCity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Città</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="repResidenceProvince"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provincia</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium text-slate-800">Documenti</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="repDocumentType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo Documento</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleziona tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="carta_identita">Carta d'Identità</SelectItem>
                                  <SelectItem value="passaporto">Passaporto</SelectItem>
                                  <SelectItem value="patente">Patente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="repDocumentNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numero Documento</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="repDocumentIssueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data Rilascio</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="repDocumentExpiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data Scadenza</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="repDocumentIssuedBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rilasciato da</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-medium text-slate-800">Status e Cariche</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="repIsPep"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Persona Esposta Politicamente (PEP)</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="repHasPublicRoles"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Cariche Pubbliche</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="repPublicRoleDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dettagli Cariche Pubbliche</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Specificare cariche pubbliche ricoperte..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Titolari Effettivi */}
                <Collapsible open={openSections.owners} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, owners: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Titolari Effettivi</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.owners ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="beneficialOwners"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Elenco Titolari Effettivi (JSON)</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder='[{"name": "Mario Rossi", "fiscalCode": "RSSMRA85M01H501Z", "ownershipPercentage": 50, "isPep": false}]' rows={6} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>

                {/* Area Geografica e Attività */}
                <Collapsible open={openSections.geography} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, geography: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Area Geografica e Attività</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.geography ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="mainActivityProvince"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provincia Attività Principale</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="relationshipDestinationProvince"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provincia Destinazione Rapporto</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="counterpartyAreaProvince"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provincia Area Controparte</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Prodotto Richiesto */}
                <Collapsible open={openSections.product} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, product: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Prodotto Richiesto</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.product ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="requestedProduct"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Prodotto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona prodotto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mutuo_ipotecario">Mutuo Ipotecario</SelectItem>
                              <SelectItem value="prestito_personale">Prestito Personale</SelectItem>
                              <SelectItem value="finanziamento_azienda">Finanziamento Aziendale</SelectItem>
                              <SelectItem value="leasing">Leasing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="requestedCapital"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capitale Richiesto (€)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="financingDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durata Finanziamento (mesi)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="interestRateType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo Tasso</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleziona tipo tasso" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fisso">Fisso</SelectItem>
                                <SelectItem value="variabile">Variabile</SelectItem>
                                <SelectItem value="misto">Misto</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Compenso e Oneri */}
                <Collapsible open={openSections.compensation} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, compensation: open }))}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                    <h4 className="text-lg font-medium text-slate-900">Compenso e Oneri</h4>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openSections.compensation ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mediatorCompensation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compenso Mediatore (€)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="commission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provvigione (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="instructionFees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spese Istruttoria (€)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contractDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Contratto</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Common Fields */}
            <div className="space-y-6 border-t border-slate-200 pt-6">
              <h4 className="text-lg font-medium text-slate-900">Informazioni di Contatto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Indirizzo</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Via/Piazza</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CAP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Note</h4>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Note aggiuntive..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center border-t border-slate-200 pt-6">
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleContractGeneration}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Genera Contratto
                  </Button>
                  {generatedUrl && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">URL Contratto Generato:</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generatedUrl, '_blank')}
                          className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                          Apri in Zoho Sign
                        </Button>
                      </div>
                      <div className="mt-2 p-2 bg-white border rounded text-xs font-mono break-all text-slate-600">
                        {generatedUrl}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(generatedUrl)}
                          className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                          Copia URL
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Salvataggio..." : "Salva Cliente"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
