import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MODULE_TYPES, type ModuleType } from "@shared/schema";
import logoUrl from "@assets/LOGO_BLANCO_1767308770849.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);
  const [pin, setPin] = useState("");

  const loginMutation = useMutation({
    mutationFn: async ({ module, pin }: { module: ModuleType; pin: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", { module, pin });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("authModule", data.module);
      if (data.module === "CREACIONES") {
        setLocation("/creaciones");
      } else if (data.module === "COBERTURA") {
        setLocation("/cobertura");
      } else {
        setLocation("/titularizaciones");
      }
    },
    onError: () => {
      toast({
        title: "PIN Incorrecto",
        description: "El PIN ingresado no es válido. Intente nuevamente.",
        variant: "destructive",
      });
      setPin("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModule && pin.length === 4) {
      loginMutation.mutate({ module: selectedModule, pin });
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setPin(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <img 
              src={logoUrl} 
              alt="Gobierno de la Provincia - Ministerio de Educación" 
              className="h-14 mx-auto"
              data-testid="img-logo"
            />
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-login-title">
                  SUBDIRECCIÓN COBERTURA DE CARGOS
                </h1>
                <p className="text-muted-foreground">Seleccione un módulo e ingrese su PIN</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`p-4 rounded-md cursor-pointer transition-all hover-elevate bg-muted/50 ${
                    selectedModule === "CREACIONES" ? "ring-2 ring-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedModule("CREACIONES")}
                  data-testid="card-module-creaciones"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-md bg-background flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">CREACIONES</h3>
                    <p className="text-xs text-muted-foreground mt-1">Expedientes</p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-md cursor-pointer transition-all hover-elevate bg-muted/50 ${
                    selectedModule === "COBERTURA" ? "ring-2 ring-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedModule("COBERTURA")}
                  data-testid="card-module-cobertura"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-md bg-background flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">COBERTURA</h3>
                    <p className="text-xs text-muted-foreground mt-1">Registro</p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-md cursor-pointer transition-all hover-elevate bg-muted/50 ${
                    selectedModule === "TITULARIZACIONES" ? "ring-2 ring-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedModule("TITULARIZACIONES")}
                  data-testid="card-module-titularizaciones"
                >
                  <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-md bg-background flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">TITULARIZACIONES</h3>
                    <p className="text-xs text-muted-foreground mt-1">Estadísticas</p>
                  </div>
                </div>
              </div>

              {selectedModule && (
                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Ingrese el PIN para <span className="font-semibold text-foreground">{selectedModule}</span>
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
                    disabled={pin.length !== 4 || loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
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
