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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [sectionsOpen, setSectionsOpen] = useState({
    basicData: true,
    legalRep: false,
    beneficialOwners: false,
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
      companyName: "",
      vatNumber: "",
      companyFiscalCode: "",
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

  const handleContractGeneration = () => {
    toast({
      title: "Funzionalità in arrivo",
      description: "La generazione automatica dei contratti sarà disponibile presto.",
    });
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    name="birthDate"
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
              </div>
            )}

            {/* Company Form */}
            {clientType === "azienda" && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ragione Sociale *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleContractGeneration}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Genera Contratto
                </Button>
                <span className="text-xs text-slate-500">*Funzionalità in arrivo</span>
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
