import { useState } from "react";
import { useLocation } from "wouter";

import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MODULE_TYPES, type ModuleType } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);
  const [pin, setPin] = useState("");


  // Usuarios y PINs hardcodeados (solo para uso provisorio/demo)
  const USERS: Record<string, Array<{ name: string; pin: string }>> = {
    CREACIONES: [
      { name: "Nancy Carrizo", pin: "3087" },
      { name: "Magdalena Martinez", pin: "2314" },
      { name: "Antonella Escudero", pin: "1609" },
      { name: "Manuel Ponce", pin: "1111" },
    ],
    COBERTURA: [
      { name: "Nancy Carrizo", pin: "3087" },
      { name: "Yanina Vargas", pin: "4457" },
      { name: "Noelia Villa", pin: "8901" },
      { name: "Axel Cabrera", pin: "4017" },
      { name: "Laura Morales", pin: "9932" },
      { name: "Manuel Ponce", pin: "1111" },
    ],
    TITULARIZACIONES: [
      { name: "Nancy Carrizo", pin: "3087" },
      { name: "Manuel Ponce", pin: "1111" },
    ],
    INFORMES: [
      { name: "Nancy Carrizo", pin: "3087" },
      { name: "Manuel Ponce", pin: "1111" },
    ],
    JUNTAS: [
      { name: "Nancy Carrizo", pin: "3087" },
      { name: "Manuel Ponce", pin: "1111" },
    ],
  };

  const [isPending, setIsPending] = useState(false);

  const handleLogin = () => {
    if (!selectedModule) return;
    setIsPending(true);
    setTimeout(() => {
      const user = USERS[selectedModule]?.find(u => u.pin === pin);
      if (user) {
        localStorage.setItem("authModule", selectedModule);
        localStorage.setItem("authUserName", user.name);
        if (selectedModule === "CREACIONES") {
          setLocation("/creaciones");
        } else if (selectedModule === "COBERTURA") {
          setLocation("/cobertura");
        } else if (selectedModule === "TITULARIZACIONES") {
          setLocation("/titularizaciones");
        } else if (selectedModule === "INFORMES") {
          setLocation("/informes");
        } else if (selectedModule === "JUNTAS") {
          setLocation("/juntas");
        }
      } else {
        toast({
          title: "PIN Incorrecto",
          description: "El PIN ingresado no es válido. Intente nuevamente.",
          variant: "destructive",
        });
        setPin("");
      }
      setIsPending(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModule && pin.length === 4) {
      handleLogin();
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-login-title">
                  SUBDIRECCIÓN COBERTURA DE CARGOS
                </h1>
                <p className="text-muted-foreground">Seleccione un módulo e ingrese su PIN</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div
                  className={`p-3 rounded-md cursor-pointer transition-all hover-elevate bg-muted/50 ${
                    selectedModule === "CREACIONES" ? "ring-2 ring-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedModule("CREACIONES")}
                  data-testid="card-module-creaciones"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-md bg-background flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-xs leading-tight">CREACIONES</h3>
                    <p className="text-xs text-muted-foreground mt-1">Expedientes</p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-md cursor-pointer transition-all hover-elevate bg-muted/50 ${
                    selectedModule === "COBERTURA" ? "ring-2 ring-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedModule("COBERTURA")}
                  data-testid="card-module-cobertura"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-md bg-background flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-xs leading-tight">PUBLICACIONES</h3>
                    <p className="text-xs text-muted-foreground mt-1">Registro</p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-md cursor-pointer transition-all hover-elevate bg-muted/50 ${
                    selectedModule === "TITULARIZACIONES" ? "ring-2 ring-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedModule("TITULARIZACIONES")}
                  data-testid="card-module-titularizaciones"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-md bg-background flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-xs leading-tight">TITULARIZACIONES</h3>
                    <p className="text-xs text-muted-foreground mt-1">Estadísticas</p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-md cursor-pointer transition-all hover-elevate bg-muted/50 ${
                    selectedModule === "INFORMES" ? "ring-2 ring-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedModule("INFORMES")}
                  data-testid="card-module-informes"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-md bg-background flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-xs leading-tight">INFORMES</h3>
                    <p className="text-xs text-muted-foreground mt-1">Actividades</p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-md cursor-pointer transition-all hover-elevate bg-muted/50 ${
                    selectedModule === "JUNTAS" ? "ring-2 ring-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedModule("JUNTAS")}
                  data-testid="card-module-juntas"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-md bg-background flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-xs leading-tight">JUNTAS DE<br/>CLASIFICACIÓN</h3>
                    <p className="text-xs text-muted-foreground mt-1">Calendario</p>
                  </div>
                </div>
              </div>

              {selectedModule && (
                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Ingrese el PIN para <span className="font-semibold text-foreground">{selectedModule === "COBERTURA" ? "PUBLICACIONES" : selectedModule}</span>
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {selectedModule === "CREACIONES" && "4 usuarios autorizados"}
                      {selectedModule === "COBERTURA" && "6 usuarios autorizados"}
                      {selectedModule === "TITULARIZACIONES" && "2 usuarios autorizados"}
                      {selectedModule === "INFORMES" && "2 usuarios autorizados"}
                      {selectedModule === "JUNTAS" && "2 usuarios autorizados"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN de acceso</Label>
                    <Input
                      id="pin"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={pin}
                      onChange={handlePinChange}
                      placeholder="****"
                      className="text-center text-2xl tracking-widest"
                      autoFocus
                      data-testid="input-pin"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={pin.length !== 4 || isPending}
                    data-testid="button-login"
                  >
                    {isPending ? (
                      "Verificando..."
                    ) : (
                      <>
                        Ingresar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>
      </div>

      <footer className="bg-card border-t border-border py-4 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            Desarrollado por Dirección Gestión Educativa
          </p>
        </div>
      </footer>
    </div>
  );
}
