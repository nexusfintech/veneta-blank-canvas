import { SidebarNavigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Search } from "lucide-react";

export default function Contracts() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNavigation />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Contratti</h1>
              <p className="text-slate-600 mt-2">Gestione contratti e documenti</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Contratto
            </Button>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Funzionalità in Sviluppo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Il sistema di gestione contratti è attualmente in fase di sviluppo. 
                  Prossimamente sarà possibile:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li>Generare contratti automaticamente dai dati cliente</li>
                  <li>Gestire template personalizzabili</li>
                  <li>Tracciare lo stato dei contratti</li>
                  <li>Archiviare documenti firmati</li>
                  <li>Gestire scadenze e rinnovi</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}