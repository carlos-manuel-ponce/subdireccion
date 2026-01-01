import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { EstadoBadge } from "@/components/estado-badge";
import { ExpedienteDialog } from "@/components/expediente-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Expediente, type InsertExpediente, SOLICITUD_TYPES, ESTADO_TYPES, type EstadoType, type SolicitudType } from "@shared/schema";
import logoUrl from "@assets/LOGO_BLANCO_1767308770849.png";

const ITEMS_PER_PAGE = 10;

export default function CreacionesHome() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState<EstadoType | "all">("all");
  const [solicitudFilter, setSolicitudFilter] = useState<SolicitudType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
  const [expedienteToDelete, setExpedienteToDelete] = useState<Expediente | null>(null);

  const { data: expedientes = [], isLoading } = useQuery<Expediente[]>({
    queryKey: ["/api/expedientes"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertExpediente) => apiRequest("POST", "/api/expedientes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expedientes"] });
      setDialogOpen(false);
      setSelectedExpediente(null);
      toast({ title: "Expediente creado", description: "El expediente se ha creado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el expediente.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertExpediente }) => 
      apiRequest("PUT", `/api/expedientes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expedientes"] });
      setDialogOpen(false);
      setSelectedExpediente(null);
      toast({ title: "Expediente actualizado", description: "Los cambios se han guardado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el expediente.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/expedientes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expedientes"] });
      setDeleteDialogOpen(false);
      setExpedienteToDelete(null);
      toast({ title: "Expediente eliminado", description: "El expediente se ha eliminado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el expediente.", variant: "destructive" });
    },
  });

  const filteredExpedientes = useMemo(() => {
    return expedientes.filter((exp) => {
      const matchesSearch = 
        exp.expediente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.establecimiento.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.comentario.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEstado = estadoFilter === "all" || exp.estado === estadoFilter;
      const matchesSolicitud = solicitudFilter === "all" || exp.solicita === solicitudFilter;
      return matchesSearch && matchesEstado && matchesSolicitud;
    });
  }, [expedientes, searchQuery, estadoFilter, solicitudFilter]);

  const totalPages = Math.ceil(filteredExpedientes.length / ITEMS_PER_PAGE);
  const paginatedExpedientes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExpedientes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExpedientes, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, estadoFilter, solicitudFilter]);

  const estadoStats = useMemo(() => {
    const counts: Record<EstadoType, number> = {} as Record<EstadoType, number>;
    ESTADO_TYPES.forEach(estado => {
      counts[estado] = expedientes.filter(e => e.estado === estado).length;
    });
    return counts;
  }, [expedientes]);

  const handleOpenCreate = () => {
    setSelectedExpediente(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (expediente: Expediente) => {
    setSelectedExpediente(expediente);
    setDialogOpen(true);
  };

  const handleOpenDelete = (expediente: Expediente) => {
    setExpedienteToDelete(expediente);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (data: InsertExpediente) => {
    if (selectedExpediente) {
      updateMutation.mutate({ id: selectedExpediente.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (expedienteToDelete) {
      deleteMutation.mutate(expedienteToDelete.id);
    }
  };

  const clearFilters = () => {
    setEstadoFilter("all");
    setSolicitudFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = estadoFilter !== "all" || solicitudFilter !== "all" || searchQuery !== "";

  useEffect(() => {
    const authModule = localStorage.getItem("authModule");
    if (authModule !== "CREACIONES") {
      setLocation("/");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("authModule");
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col items-center text-center">
            <img 
              src={logoUrl} 
              alt="Gobierno de la Provincia - Ministerio de Educación" 
              className="h-10 mb-2"
              data-testid="img-logo"
            />
            <h1 className="text-xl font-bold tracking-tight text-foreground" data-testid="text-title">CREACIONES</h1>
            <p className="text-sm text-muted-foreground">SUBDIRECCIÓN COBERTURA DE CARGOS</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="absolute right-0 top-1/2 -translate-y-1/2" data-testid="button-logout">
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Estado Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {ESTADO_TYPES.map((estado) => (
            <Card 
              key={estado} 
              className={`p-4 cursor-pointer transition-all hover-elevate ${estadoFilter === estado ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setEstadoFilter(estadoFilter === estado ? "all" : estado)}
              data-testid={`counter-${estado}`}
            >
              <div className="text-center">
                <span className="text-2xl font-bold text-foreground" data-testid={`stat-value-${estado}`}>
                  {estadoStats[estado] || 0}
                </span>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{estado}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Button onClick={handleOpenCreate} data-testid="button-add-new">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Nuevo
          </Button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar expediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {(estadoFilter !== "all" ? 1 : 0) + (solicitudFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Estado</label>
                <Select value={estadoFilter} onValueChange={(val) => setEstadoFilter(val as EstadoType | "all")}>
                  <SelectTrigger data-testid="filter-estado">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {ESTADO_TYPES.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipo de Solicitud</label>
                <Select value={solicitudFilter} onValueChange={(val) => setSolicitudFilter(val as SolicitudType | "all")}>
                  <SelectTrigger data-testid="filter-solicitud">
                    <SelectValue placeholder="Todas las solicitudes" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">Todas las solicitudes</SelectItem>
                    {SOLICITUD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto" data-testid="button-clear-filters">
                  <X className="mr-2 h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Main Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                  <TableHead className="text-foreground font-medium w-[120px]">Expediente</TableHead>
                  <TableHead className="text-foreground font-medium min-w-[280px]">Solicita</TableHead>
                  <TableHead className="text-foreground font-medium min-w-[200px]">Establecimiento</TableHead>
                  <TableHead className="text-foreground font-medium w-[140px]">Estado</TableHead>
                  <TableHead className="text-foreground font-medium">Comentario</TableHead>
                  <TableHead className="text-foreground font-medium w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedExpedientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {hasActiveFilters ? "No se encontraron expedientes con los filtros aplicados." : "No hay expedientes registrados. Haga clic en \"Agregar Nuevo\" para crear uno."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedExpedientes.map((exp, index) => (
                    <TableRow 
                      key={exp.id} 
                      className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                      data-testid={`row-expediente-${exp.id}`}
                    >
                      <TableCell className="font-mono text-sm" data-testid={`text-expediente-${exp.id}`}>
                        {exp.expediente}
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-solicita-${exp.id}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="line-clamp-2 cursor-default">{exp.solicita}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>{exp.solicita}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-establecimiento-${exp.id}`}>
                        {exp.establecimiento}
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={exp.estado} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                        {exp.comentario ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="line-clamp-1 cursor-default" data-testid={`text-comentario-${exp.id}`}>
                                {exp.comentario}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-sm">
                              <p>{exp.comentario}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(exp)}
                                data-testid={`button-edit-${exp.id}`}
                                aria-label="Editar expediente"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDelete(exp)}
                                data-testid={`button-delete-${exp.id}`}
                                aria-label="Eliminar expediente"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredExpedientes.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
              <p className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredExpedientes.length)} de {filteredExpedientes.length} registros
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        data-testid={`button-page-${page}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  data-testid="button-next-page"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-foreground" data-testid="text-footer">
            Desarrollado por Dirección Gestión Educativa
          </p>
        </div>
      </footer>

      {/* Dialogs */}
      <ExpedienteDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedExpediente(null);
        }}
        expediente={selectedExpediente}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setExpedienteToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
        expedienteNumber={expedienteToDelete?.expediente}
      />
    </div>
  );
}
