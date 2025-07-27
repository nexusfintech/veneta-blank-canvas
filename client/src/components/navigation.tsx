import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  Users, 
  FileText, 
  Settings,
  Handshake,
  ChevronRight,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const navigationItems = [
  {
    name: "Anagrafiche",
    href: "/",
    icon: Users,
    description: "Gestione clienti"
  },
  {
    name: "Contratti",
    href: "/contracts",
    icon: FileText,
    description: "Gestione contratti"
  },
  {
    name: "Impostazioni",
    href: "/settings",
    icon: Settings,
    description: "Configurazione"
  }
];

// Sidebar Navigation Component
export function SidebarNavigation() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logout effettuato",
        description: "Sei stato disconnesso con successo",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore durante la disconnessione",
        variant: "destructive",
      });
    },
  });

  return (
    <div className={`bg-white border-r border-slate-200 transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    } flex flex-col h-screen fixed left-0 top-0 z-50`}>
      {/* Logo Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Handshake className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Gestionale</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-primary-100 text-primary-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"} mb-3`}>
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500">
                {user?.role === "admin" ? "Amministratore" : "Utente"}
              </p>
            </div>
          )}
        </div>
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className={`w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
          {!isCollapsed && "Esci"}
        </Button>
      </div>
    </div>
  );
}

// Top Navigation for mobile
export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="md:hidden bg-white shadow-sm border-b border-slate-200">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Handshake className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Gestionale</h1>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <Handshake className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold">Gestionale Mediatore</span>
                </div>
                
                <nav className="flex-1 space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary-100 text-primary-700"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <div>
                          <div>{item.name}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                <Separator />

                <div className="pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">MR</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Marco Rossi</p>
                      <p className="text-xs text-slate-500">Mediatore Creditizio</p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}