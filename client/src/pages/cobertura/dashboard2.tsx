import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, FileDown, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { type CoberturaDetalle } from "@shared/schema";

export default function Dashboard2Page() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstablecimientos, setSelectedEstablecimientos] = useState<string[]>([]);
  const [estSearchQuery, setEstSearchQuery] = useState("");

  const { data: detalles = [], isLoading } = useQuery<CoberturaDetalle[]>({
    queryKey: ["/api/cobertura/detalles"],
  });

  const uniqueEstablecimientos = useMemo(() => {
    const establecimientos = Array.from(new Set(detalles.map((det) => det.establecimiento)));
    return establecimientos.sort();
  }, [detalles]);

  const filteredEstablecimientos = useMemo(() => {
    if (!estSearchQuery.trim()) return uniqueEstablecimientos;
    const query = estSearchQuery.toLowerCase();
    return uniqueEstablecimientos.filter((est) => est.toLowerCase().includes(query));
  }, [uniqueEstablecimientos, estSearchQuery]);

  const toggleEstablecimiento = (est: string) => {
    setSelectedEstablecimientos((prev) =>
      prev.includes(est) ? prev.filter((e) => e !== est) : [...prev, est]
    );
  };

  const clearEstablecimientos = () => {
    setSelectedEstablecimientos([]);
  };

  const filteredDetalles = useMemo(() => {
    let filtered = detalles;
    
    if (selectedEstablecimientos.length > 0) {
      filtered = filtered.filter((det) => selectedEstablecimientos.includes(det.establecimiento));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((det) =>
        det.establecimiento.toLowerCase().includes(query) ||
        det.localidad.toLowerCase().includes(query) ||
        det.apellido.toLowerCase().includes(query) ||
        det.nombre.toLowerCase().includes(query) ||
        det.dni.includes(query)
      );
    }
    
    return filtered;
  }, [detalles, searchQuery, selectedEstablecimientos]);

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cobertura/detalles/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          establecimiento: searchQuery || undefined,
          detalles: filteredDetalles,
          userName: "Carlos Manuel Ponce"
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por localidad, docente o DNI..."
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="button-filter-establecimientos">
                  <Building2 className="mr-2 h-4 w-4" />
                  Establecimientos
                  {selectedEstablecimientos.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedEstablecimientos.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Filtrar por establecimiento</span>
                    {selectedEstablecimientos.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearEstablecimientos}>
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar establecimiento..."
                      value={estSearchQuery}
                      onChange={(e) => setEstSearchQuery(e.target.value)}
                      className="pl-8 h-8"
                      data-testid="input-search-establecimientos"
                    />
                  </div>
                </div>
                <ScrollArea className="h-64">
                  <div className="p-2 space-y-1">
                    {filteredEstablecimientos.map((est) => (
                      <div
                        key={est}
                        className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer"
                        onClick={() => toggleEstablecimiento(est)}
                        data-testid={`checkbox-est-${est}`}
                      >
                        <Checkbox
                          checked={selectedEstablecimientos.includes(est)}
                          onCheckedChange={() => toggleEstablecimiento(est)}
                        />
                        <span className="text-sm">{est}</span>
                      </div>
                    ))}
                    {filteredEstablecimientos.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No se encontraron establecimientos
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <Button
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending || filteredDetalles.length === 0}
              data-testid="button-generate-report"
            >
              <FileDown className="mr-2 h-4 w-4" />
              {generateReportMutation.isPending ? "Generando..." : "Generar Informe"}
            </Button>
          </div>
          
          {selectedEstablecimientos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedEstablecimientos.map((est) => (
                <Badge
                  key={est}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleEstablecimiento(est)}
                >
                  {est}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            {filteredDetalles.length} resultado(s) encontrado(s)
          </p>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="min-w-[180px]">Establecimiento</TableHead>
                <TableHead className="min-w-[120px]">Llamado</TableHead>
                <TableHead className="min-w-[130px]">Región / Localidad</TableHead>
                <TableHead className="min-w-[110px]">Nivel / Carácter</TableHead>
                <TableHead className="min-w-[250px]">Descripción</TableHead>
                <TableHead className="min-w-[180px]">Docente</TableHead>
                <TableHead className="min-w-[90px]">Habilitación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDetalles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
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
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{det.llamado}</div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{det.tipo}</Badge>
                          <span className="text-xs text-muted-foreground">{det.fecha}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <Badge variant="outline" className="font-mono text-xs">{det.region}</Badge>
                        <div className="text-sm">{det.localidad}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-sm">{det.nivel}</div>
                        <div className="text-xs text-muted-foreground">{det.caracter}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-[300px]">
                      <div className="line-clamp-3">{det.descripcion}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium whitespace-nowrap">{det.apellido}, {det.nombre}</div>
                        <div className="text-xs text-muted-foreground font-mono">DNI: {det.dni}</div>
                      </div>
                    </TableCell>
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
