import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, CheckCircle, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type CoberturaEvento } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard1Page() {
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [juntaFilter, setJuntaFilter] = useState<string>("all");
  const [llamadoFilter, setLlamadoFilter] = useState<string>("all");

  const { data: eventos = [], isLoading } = useQuery<CoberturaEvento[]>({
    queryKey: ["/api/cobertura/eventos"],
  });

  const llamados = useMemo(() => {
    return Array.from(new Set(eventos.map(e => e.llamado))).sort((a, b) => {
      const numA = parseInt(a) || 0;
      const numB = parseInt(b) || 0;
      return numB - numA;
    });
  }, [eventos]);

  const tipos = useMemo(() => {
    return Array.from(new Set(eventos.map(e => e.tipo).filter(t => t))).sort();
  }, [eventos]);

  const juntas = useMemo(() => {
    return Array.from(new Set(eventos.map(e => e.juntaClasificacion).filter(j => j))).sort();
  }, [eventos]);

  const filteredEventos = useMemo(() => {
    return eventos.filter((evt) => {
      const matchesTipo = tipoFilter === "all" || evt.tipo === tipoFilter;
      const matchesJunta = juntaFilter === "all" || evt.juntaClasificacion === juntaFilter;
      const matchesLlamado = llamadoFilter === "all" || evt.llamado === llamadoFilter;
      return matchesTipo && matchesJunta && matchesLlamado;
    });
  }, [eventos, tipoFilter, juntaFilter, llamadoFilter]);

  const stats = useMemo(() => {
    return {
      totalLlamados: filteredEventos.length,
      totalCoberturas: filteredEventos.reduce((sum, e) => sum + e.coberturas, 0),
      totalPostulantes: filteredEventos.reduce((sum, e) => sum + e.postulantes, 0),
    };
  }, [filteredEventos]);

  const chartData = useMemo(() => {
    return filteredEventos.map((evt) => ({
      name: evt.llamado.replace("Llamado ", ""),
      Coberturas: evt.coberturas,
      Postulantes: evt.postulantes,
    }));
  }, [filteredEventos]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Dashboard de Estadísticas</h2>
        <p className="text-sm text-muted-foreground">Análisis comparativo de coberturas y postulantes</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tipo</label>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger data-testid="filter-tipo">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {tipos.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Junta de Clasificación</label>
          <Select value={juntaFilter} onValueChange={setJuntaFilter}>
            <SelectTrigger data-testid="filter-junta">
              <SelectValue placeholder="Todas las juntas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las juntas</SelectItem>
              {juntas.map((junta) => (
                <SelectItem key={junta} value={junta}>{junta}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Llamado</label>
          <Select value={llamadoFilter} onValueChange={setLlamadoFilter}>
            <SelectTrigger data-testid="filter-llamado">
              <SelectValue placeholder="Todos los llamados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los llamados</SelectItem>
              {llamados.map((llamado) => (
                <SelectItem key={llamado} value={llamado}>{llamado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-md bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Llamados</p>
              <p className="text-3xl font-bold text-foreground" data-testid="stat-total-llamados">
                {stats.totalLlamados}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-md bg-muted">
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Coberturas</p>
              <p className="text-3xl font-bold text-foreground" data-testid="stat-total-coberturas">
                {stats.totalCoberturas}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-md bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Postulantes</p>
              <p className="text-3xl font-bold text-foreground" data-testid="stat-total-postulantes">
                {stats.totalPostulantes}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Comparación Coberturas vs Postulantes</h3>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }} 
                />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                <Bar dataKey="Coberturas" fill="hsl(220 70% 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Postulantes" fill="hsl(160 60% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No hay datos para mostrar con los filtros seleccionados
          </div>
        )}
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Detalle de Eventos</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Llamado</TableHead>
                <TableHead>Junta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Establecimientos</TableHead>
                <TableHead className="text-right">Coberturas</TableHead>
                <TableHead className="text-right">Postulantes</TableHead>
                <TableHead className="text-right">Promedio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEventos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No hay eventos que coincidan con los filtros
                  </TableCell>
                </TableRow>
              ) : (
                filteredEventos.map((evt, index) => (
                  <TableRow 
                    key={evt.id} 
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                  >
                    <TableCell className="font-medium">{evt.llamado}</TableCell>
                    <TableCell>{evt.juntaClasificacion}</TableCell>
                    <TableCell>{evt.tipo}</TableCell>
                    <TableCell>{evt.fecha}</TableCell>
                    <TableCell className="text-right">{evt.establecimientos}</TableCell>
                    <TableCell className="text-right font-semibold">{evt.coberturas}</TableCell>
                    <TableCell className="text-right font-semibold">{evt.postulantes}</TableCell>
                    <TableCell className="text-right">{evt.promedio.toFixed(1)}</TableCell>
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
