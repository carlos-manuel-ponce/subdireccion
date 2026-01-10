import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Download, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RegistroDialog } from "@/components/registro-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type CoberturaRegistro, type InsertCoberturaRegistro } from "@shared/schema";

const ITEMS_PER_PAGE = 10;

export default function RegistroPage() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<CoberturaRegistro | null>(null);
  const [registroToDelete, setRegistroToDelete] = useState<CoberturaRegistro | null>(null);

  const { data: registros = [], isLoading } = useQuery<CoberturaRegistro[]>({
    queryKey: ["/api/cobertura/registros"],
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/cobertura/registros", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Error al crear registro");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cobertura/registros"] });
      setDialogOpen(false);
      setSelectedRegistro(null);
      toast({ title: "Registro creado", description: "El registro se ha creado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo crear el registro.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await fetch(`/api/cobertura/registros/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Error al actualizar registro");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cobertura/registros"] });
      setDialogOpen(false);
      setSelectedRegistro(null);
      toast({ title: "Registro actualizado", description: "Los cambios se han guardado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar el registro.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cobertura/registros/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cobertura/registros"] });
      setDeleteDialogOpen(false);
      setRegistroToDelete(null);
      toast({ title: "Registro eliminado", description: "El registro se ha eliminado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar el registro.", variant: "destructive" });
    },
  });

  const sortedRegistros = useMemo(() => {
    return [...registros].sort((a, b) => {
      const llamadoA = parseInt(a.llamado) || 0;
      const llamadoB = parseInt(b.llamado) || 0;
      return llamadoA - llamadoB;
    });
  }, [registros]);

  const totalPages = Math.ceil(sortedRegistros.length / ITEMS_PER_PAGE);
  const paginatedRegistros = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedRegistros.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedRegistros, currentPage]);

  const handleOpenCreate = () => {
    setSelectedRegistro(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (registro: CoberturaRegistro) => {
    setSelectedRegistro(registro);
    setDialogOpen(true);
  };

  const handleOpenDelete = (registro: CoberturaRegistro) => {
    setRegistroToDelete(registro);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (formData: FormData) => {
    if (selectedRegistro) {
      updateMutation.mutate({ id: selectedRegistro.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (registroToDelete) {
      deleteMutation.mutate(registroToDelete.id);
    }
  };

  const handleDownload = (registro: CoberturaRegistro) => {
    if (registro.pedidoFilePath) {
      window.open(`/api/cobertura/registros/${registro.id}/download`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Registro de Pedidos</h2>
          <p className="text-sm text-muted-foreground">Gestión de pedidos por región educativa</p>
        </div>
        <Button onClick={handleOpenCreate} data-testid="button-add-registro">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Nuevo
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="text-foreground font-medium w-[80px]">Llamado</TableHead>
                <TableHead className="text-foreground font-medium min-w-[200px]">Región y Nivel</TableHead>
                <TableHead className="text-foreground font-medium min-w-[150px]">Responsable</TableHead>
                <TableHead className="text-foreground font-medium w-[120px]">Expediente</TableHead>
                <TableHead className="text-foreground font-medium w-[150px]">Pedido</TableHead>
                <TableHead className="text-foreground font-medium w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedRegistros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No hay registros. Haga clic en "Agregar Nuevo" para crear uno.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRegistros.map((reg, index) => (
                  <TableRow 
                    key={reg.id}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                    data-testid={`row-registro-${reg.id}`}
                  >
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {reg.llamado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{reg.regionNivel}</TableCell>
                    <TableCell className="text-sm">{reg.responsable}</TableCell>
                    <TableCell className="font-mono text-sm">{reg.expediente}</TableCell>
                    <TableCell>
                      {reg.pedidoFileName ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(reg)}
                          className="text-xs"
                          data-testid={`button-download-${reg.id}`}
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          {reg.pedidoFileName.length > 15 
                            ? reg.pedidoFileName.substring(0, 15) + "..." 
                            : reg.pedidoFileName}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">Sin archivo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(reg)}
                              data-testid={`button-edit-${reg.id}`}
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
                              onClick={() => handleOpenDelete(reg)}
                              data-testid={`button-delete-${reg.id}`}
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

        {sortedRegistros.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedRegistros.length)} de {sortedRegistros.length} registros
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <RegistroDialog
        open={dialogOpen}
        onOpenChange={(isOpen: boolean) => {
          setDialogOpen(isOpen);
          if (!isOpen) setSelectedRegistro(null);
        }}
        registro={selectedRegistro}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setRegistroToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
        expedienteNumber={registroToDelete?.expediente}
      />
    </div>
  );
}
