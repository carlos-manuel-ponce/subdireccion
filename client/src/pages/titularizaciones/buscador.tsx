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
import { type TitularizacionRegistro } from "@shared/schema";

export default function BuscadorPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: registros = [], isLoading } = useQuery<TitularizacionRegistro[]>({
    queryKey: ["/api/titularizaciones/registros"],
  });

  const filteredRegistros = useMemo(() => {
    if (!searchQuery.trim()) return registros;
    const query = searchQuery.toLowerCase();
    return registros.filter((reg) =>
      reg.expediente.toLowerCase().includes(query) ||
      reg.establecimiento.toLowerCase().includes(query) ||
      reg.apellido.toLowerCase().includes(query) ||
      reg.nombre.toLowerCase().includes(query) ||
      reg.dni.includes(query) ||
      reg.localidad.toLowerCase().includes(query) ||
      reg.departamento.toLowerCase().includes(query)
    );
  }, [registros, searchQuery]);

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/titularizaciones/registros/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registros: filteredRegistros }),
      });
      if (!response.ok) throw new Error("Error al generar el informe");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `informe-titularizaciones-${Date.now()}.pdf`;
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
    if (filteredRegistros.length === 0) {
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
        <h2 className="text-lg font-semibold text-foreground">Buscador de Titularizaciones</h2>
        <p className="text-sm text-muted-foreground">Busque por expediente, establecimiento, docente, DNI, localidad o departamento</p>
      </div>

      {/* Search and Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por expediente, establecimiento, docente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-titularizaciones"
            />
          </div>
          {searchQuery && (
            <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleGenerateReport}
            disabled={generateReportMutation.isPending || filteredRegistros.length === 0}
            data-testid="button-generate-report"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {generateReportMutation.isPending ? "Generando..." : "Generar Informe"}
          </Button>
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-3">
            {filteredRegistros.length} resultado(s) encontrado(s)
          </p>
        )}
      </Card>

      {/* Results Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="min-w-[100px]">Expediente</TableHead>
                <TableHead className="min-w-[150px]">Nombre y Apellido</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead className="min-w-[150px]">Establecimiento</TableHead>
                <TableHead>Localidad</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead className="min-w-[140px]">Junta de Clasificación</TableHead>
                <TableHead className="min-w-[120px]">Renuncia a</TableHead>
                <TableHead className="min-w-[180px]">Titularizar en</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    {searchQuery
                      ? "No se encontraron registros con la búsqueda realizada"
                      : "No hay registros disponibles"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistros.map((reg, index) => (
                  <TableRow
                    key={reg.id}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                    data-testid={`row-titularizacion-${reg.id}`}
                  >
                    <TableCell className="font-mono text-sm">{reg.expediente}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {reg.apellido}, {reg.nombre}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{reg.dni}</TableCell>
                    <TableCell>{reg.establecimiento}</TableCell>
                    <TableCell>{reg.localidad}</TableCell>
                    <TableCell>{reg.departamento}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{reg.juntaClasificacion}</Badge>
                    </TableCell>
                    <TableCell>
                      {reg.renunciaA ? (
                        <Badge variant="secondary" className="text-xs">
                          {reg.renunciaA}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-xs">
                        {reg.titularizarEn}
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
