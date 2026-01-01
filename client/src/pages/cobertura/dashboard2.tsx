import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, FileDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { type CoberturaDetalle } from "@shared/schema";

export default function Dashboard2Page() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: detalles = [], isLoading } = useQuery<CoberturaDetalle[]>({
    queryKey: ["/api/cobertura/detalles"],
  });

  const filteredDetalles = useMemo(() => {
    if (!searchQuery.trim()) return detalles;
    const query = searchQuery.toLowerCase();
    return detalles.filter((det) =>
      det.establecimiento.toLowerCase().includes(query) ||
      det.localidad.toLowerCase().includes(query) ||
      det.apellido.toLowerCase().includes(query) ||
      det.nombre.toLowerCase().includes(query) ||
      det.dni.includes(query)
    );
  }, [detalles, searchQuery]);

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cobertura/detalles/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establecimiento: searchQuery || undefined,
          detalles: filteredDetalles,
        }),
      });
      if (!response.ok) throw new Error("Error al generar el informe");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `informe-cobertura-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Informe generado", description: "El archivo PDF se ha descargado correctamente." });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo generar el informe.", variant: "destructive" });
    },
  });

  const handleGenerateReport = () => {
    if (filteredDetalles.length === 0) {
      toast({ title: "Sin datos", description: "No hay registros para incluir en el informe.", variant: "destructive" });
      return;
    }
    generateReportMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Skeleton className="h-10 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Buscador Completo</h2>
        <p className="text-sm text-muted-foreground">Busque por establecimiento, localidad, docente o DNI y genere informes PDF</p>
      </div>

      {/* Search and Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por establecimiento, localidad, docente o DNI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-detalles"
            />
          </div>
          {searchQuery && (
            <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleGenerateReport}
            disabled={generateReportMutation.isPending || filteredDetalles.length === 0}
            data-testid="button-generate-report"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {generateReportMutation.isPending ? "Generando..." : "Generar Informe"}
          </Button>
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-3">
            {filteredDetalles.length} resultado(s) encontrado(s)
          </p>
        )}
      </Card>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="min-w-[150px]">Establecimiento</TableHead>
                <TableHead>Región</TableHead>
                <TableHead>Localidad</TableHead>
                <TableHead>Llamado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Carácter</TableHead>
                <TableHead className="min-w-[200px]">Descripción</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Habilitación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDetalles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                    {searchQuery 
                      ? "No se encontraron registros con la búsqueda realizada"
                      : "No hay registros disponibles"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDetalles.map((det, index) => (
                  <TableRow 
                    key={det.id}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                    data-testid={`row-detalle-${det.id}`}
                  >
                    <TableCell className="font-medium">{det.establecimiento}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{det.region}</Badge>
                    </TableCell>
                    <TableCell>{det.localidad}</TableCell>
                    <TableCell className="text-sm">{det.llamado}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{det.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{det.fecha}</TableCell>
                    <TableCell>{det.nivel}</TableCell>
                    <TableCell>{det.caracter}</TableCell>
                    <TableCell className="text-sm">{det.descripcion}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {det.apellido}, {det.nombre}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{det.dni}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={det.habilitacion === "HABILITADO" ? "default" : "secondary"}
                        className={det.habilitacion === "HABILITADO" 
                          ? "bg-green-500/20 text-green-300 border-green-500/30" 
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"}
                      >
                        {det.habilitacion}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
