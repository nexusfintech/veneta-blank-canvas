import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  clientTypeFilter: string;
  onClientTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  clientTypeFilter,
  onClientTypeChange,
  statusFilter,
  onStatusChange,
}: SearchFiltersProps) {
  return (
    <Card className="shadow-sm mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label className="text-sm font-medium text-slate-700 mb-2">Cerca cliente</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="Nome, cognome, ragione sociale, codice fiscale..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2">Tipo cliente</Label>
            <Select value={clientTypeFilter} onValueChange={onClientTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="persona_fisica">Persona Fisica</SelectItem>
                <SelectItem value="azienda">Azienda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2">Stato</Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="attivo">Attivo</SelectItem>
                <SelectItem value="inattivo">Inattivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
