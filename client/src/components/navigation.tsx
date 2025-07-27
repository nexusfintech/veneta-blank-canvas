import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  X, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Handshake 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
    name: "Statistiche",
    href: "/stats",
    icon: BarChart3,
    description: "Dashboard e report"
  },
  {
    name: "Impostazioni",
    href: "/settings",
    icon: Settings,
    description: "Configurazione"
  }
];

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavItems = ({ mobile = false }) => (
    <div className={mobile ? "flex flex-col space-y-2" : "hidden md:flex md:space-x-8"}>
      {navigationItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => mobile && setIsOpen(false)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary-100 text-primary-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Handshake className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Gestionale Mediatore</h1>
          </div>

          {/* Desktop Navigation */}
          <NavItems />

          {/* User Profile & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-slate-600">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">MR</span>
              </div>
              <span className="text-sm font-medium">Marco Rossi</span>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
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
                    
                    <nav className="flex-1">
                      <NavItems mobile />
                    </nav>

                    <div className="border-t border-slate-200 pt-4">
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
        </div>
      </div>
    </header>
  );
}