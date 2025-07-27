import { SidebarNavigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Shield, Database } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNavigation />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Impostazioni</h1>
            <p className="text-slate-600 mt-2">Configurazione sistema e preferenze</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profilo Utente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Il tuo nome" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="la-tua-email@esempio.com" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company">Azienda</Label>
                  <Input id="company" placeholder="Nome della tua azienda" />
                </div>
                <Button>Salva Modifiche</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifiche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Configurazione notifiche e alert del sistema:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li>Notifiche email per nuovi clienti</li>
                  <li>Alert scadenze contratti</li>
                  <li>Promemoria follow-up</li>
                  <li>Report periodici automatici</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database e Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Gestione dati e backup di sicurezza:
                </p>
                <div className="space-y-3">
                  <Button variant="outline">Esporta Dati Clienti</Button>
                  <Button variant="outline">Backup Database</Button>
                  <Button variant="outline">Importa Dati</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Sicurezza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Configurazioni di sicurezza e privacy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                  <li>Gestione password</li>
                  <li>Autenticazione a due fattori</li>
                  <li>Log accessi</li>
                  <li>Politiche di retention dati</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}