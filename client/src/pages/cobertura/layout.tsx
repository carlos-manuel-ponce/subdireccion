import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { ClipboardList, BarChart3, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RegistroPage from "./registro";
import Dashboard1Page from "./dashboard1";
import Dashboard2Page from "./dashboard2";
import logoUrl from "@assets/LOGO_BLANCO_1767308770849.png";

type TabType = "registro" | "dashboard1" | "dashboard2";

export default function CoberturaLayout() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/cobertura/:tab");
  const [activeTab, setActiveTab] = useState<TabType>("registro");

  useEffect(() => {
    const authModule = localStorage.getItem("authModule");
    if (authModule !== "COBERTURA") {
      setLocation("/");
    }
  }, [setLocation]);

  useEffect(() => {
    if (match && params?.tab) {
      const tab = params.tab as TabType;
      if (["registro", "dashboard1", "dashboard2"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [match, params]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
    setLocation(`/cobertura/${value}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authModule");
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground" data-testid="text-cobertura-title">
              COBERTURA DE CARGOS
            </h1>
            <p className="text-sm text-muted-foreground">SUBDIRECCIÓN COBERTURA DE CARGOS</p>
          </div>
          <div className="flex-1 flex justify-center">
            <img 
              src={logoUrl} 
              alt="Gobierno de la Provincia - Ministerio de Educación" 
              className="h-10"
              data-testid="img-logo"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="registro" data-testid="tab-registro">
              <ClipboardList className="mr-2 h-4 w-4" />
              Registro
            </TabsTrigger>
            <TabsTrigger value="dashboard1" data-testid="tab-dashboard1">
              <BarChart3 className="mr-2 h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="dashboard2" data-testid="tab-dashboard2">
              <Search className="mr-2 h-4 w-4" />
              Buscador
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registro">
            <RegistroPage />
          </TabsContent>

          <TabsContent value="dashboard1">
            <Dashboard1Page />
          </TabsContent>

          <TabsContent value="dashboard2">
            <Dashboard2Page />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-card border-t border-border py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-foreground" data-testid="text-footer">
            Desarrollado por Dirección Gestión Educativa
          </p>
        </div>
      </footer>
    </div>
  );
}
