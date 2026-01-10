import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Activity, LogOut, Search, Calendar, User, FileText, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/LOGO_BLANCO_1767308770849.png";
import type { ActividadLog, ModuleType } from "@shared/schema";

const ACTIVIDAD_LABELS: Record<string, string> = {
  CARGA_EXPEDIENTE: "Carga de Expediente",
  EDICION_EXPEDIENTE: "Edición de Expediente",
  ELIMINACION_EXPEDIENTE: "Eliminación de Expediente",
  GENERACION_INFORME: "Generación de Informe",
  CARGA_REGISTRO: "Carga de Registro",
  EDICION_REGISTRO: "Edición de Registro",
  ELIMINACION_REGISTRO: "Eliminación de Registro",
  INICIO_SESION: "Inicio de Sesión",
  CIERRE_SESION: "Cierre de Sesión",
};

const MODULO_COLORS: Record<string, string> = {
  CREACIONES: "text-violet-400",
  COBERTURA: "text-blue-400",
  PUBLICACIONES: "text-blue-400",
  TITULARIZACIONES: "text-emerald-400",
  INFORMES: "text-amber-400",
};

export default function InformesLayout() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [moduloFilter, setModuloFilter] = useState<string>("all");
  const [actividadFilter, setActividadFilter] = useState<string>("all");

  useEffect(() => {
    const authModule = localStorage.getItem("authModule");
    if (authModule !== "INFORMES") {
      setLocation("/");
    }
  }, [setLocation]);

  const { data: actividades = [], isLoading } = useQuery<ActividadLog[]>({
    queryKey: ["/api/informes/actividades"],
  });

  const handleLogout = () => {
    localStorage.removeItem("authModule");
    localStorage.removeItem("authUserName");
    setLocation("/");
  };

  const currentUserName = localStorage.getItem("authUserName") || "Usuario";

  const filteredActividades = actividades.filter((actividad) => {
    const matchesSearch =
      searchQuery === "" ||
      actividad.usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actividad.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (actividad.detalles && actividad.detalles.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModulo = moduloFilter === "all" || actividad.modulo === moduloFilter;
    const matchesActividad = actividadFilter === "all" || actividad.tipoActividad === actividadFilter;

    return matchesSearch && matchesModulo && matchesActividad;
  });

  const stats = {
    total: actividades.length,
    hoy: actividades.filter(a => a.fecha === new Date().toISOString().split('T')[0]).length,
    informes: actividades.filter(a => a.tipoActividad === "GENERACION_INFORME").length,
    cargas: actividades.filter(a => a.tipoActividad.includes("CARGA")).length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground" data-testid="text-informes-title">
              INFORMES
            </h1>
            <p className="text-sm text-muted-foreground">REGISTRO DE ACTIVIDADES DEL SISTEMA</p>
          </div>
          <div className="flex-1 flex justify-center">
            <img 
              src={logoUrl} 
              alt="Gobierno de la Provincia - Ministerio de Educación" 
              className="h-10"
              data-testid="img-logo"
            />
          </div>
          <div className="flex-1 flex justify-end items-center gap-3">
            <span className="text-sm text-muted-foreground" data-testid="text-current-user">{currentUserName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-violet-500/10">
                <Activity className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Actividades</p>
                <p className="text-2xl font-bold text-violet-400" data-testid="stat-total">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hoy</p>
                <p className="text-2xl font-bold text-blue-400" data-testid="stat-hoy">{stats.hoy}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-500/10">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Informes Generados</p>
                <p className="text-2xl font-bold text-emerald-400" data-testid="stat-informes">{stats.informes}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10">
                <User className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cargas Realizadas</p>
                <p className="text-2xl font-bold text-amber-400" data-testid="stat-cargas">{stats.cargas}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por usuario, descripción o detalles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={moduloFilter} onValueChange={setModuloFilter}>
                <SelectTrigger className="w-[160px]" data-testid="select-modulo">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los módulos</SelectItem>
                  <SelectItem value="CREACIONES">CREACIONES</SelectItem>
                  <SelectItem value="COBERTURA">PUBLICACIONES</SelectItem>
                  <SelectItem value="TITULARIZACIONES">TITULARIZACIONES</SelectItem>
                  <SelectItem value="INFORMES">INFORMES</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actividadFilter} onValueChange={setActividadFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-actividad">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las actividades</SelectItem>
                  {Object.entries(ACTIVIDAD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <span className="text-blue-400 font-semibold">{filteredActividades.length}</span> actividad(es) encontrada(s)
          </p>
        </Card>

        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[120px]">Fecha</TableHead>
                <TableHead className="w-[80px]">Hora</TableHead>
                <TableHead className="w-[140px]">Usuario</TableHead>
                <TableHead className="w-[140px]">Módulo</TableHead>
                <TableHead className="w-[180px]">Actividad</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Cargando actividades...
                  </TableCell>
                </TableRow>
              ) : filteredActividades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron actividades registradas
                  </TableCell>
                </TableRow>
              ) : (
                filteredActividades.map((actividad) => (
                  <TableRow key={actividad.id} className="hover-elevate" data-testid={`row-actividad-${actividad.id}`}>
                    <TableCell className="font-medium text-foreground">{actividad.fecha}</TableCell>
                    <TableCell className="text-muted-foreground">{actividad.hora}</TableCell>
                    <TableCell className="text-foreground">{actividad.usuario}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${MODULO_COLORS[actividad.modulo] || "text-foreground"}`}>
                        {actividad.modulo === "COBERTURA" ? "PUBLICACIONES" : actividad.modulo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ACTIVIDAD_LABELS[actividad.tipoActividad] || actividad.tipoActividad}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate">
                      {actividad.descripcion}
                      {actividad.detalles && (
                        <span className="text-xs text-muted-foreground/70 ml-2">({actividad.detalles})</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>

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
