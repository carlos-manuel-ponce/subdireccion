import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { BarChart3, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EstadisticasPage from "./estadisticas";
import BuscadorPage from "./buscador";

type TabType = "estadisticas" | "buscador";

export default function TitularizacionesLayout() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/titularizaciones/:tab");
  const [activeTab, setActiveTab] = useState<TabType>("estadisticas");

  useEffect(() => {
    const authModule = localStorage.getItem("authModule");
    if (authModule !== "TITULARIZACIONES") {
      setLocation("/");
    }
  }, [setLocation]);

  useEffect(() => {
    if (match && params?.tab) {
      const tab = params.tab as TabType;
      if (["estadisticas", "buscador"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [match, params]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType);
    setLocation(`/titularizaciones/${value}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authModule");
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground" data-testid="text-titularizaciones-title">
              TITULARIZACIONES
            </h1>
            <p className="text-sm text-muted-foreground">SUBDIRECCIÓN COBERTURA DE CARGOS</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="estadisticas" data-testid="tab-estadisticas">
              <BarChart3 className="mr-2 h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="buscador" data-testid="tab-buscador">
              <Search className="mr-2 h-4 w-4" />
              Buscador
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estadisticas">
            <EstadisticasPage />
          </TabsContent>

          <TabsContent value="buscador">
            <BuscadorPage />
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
