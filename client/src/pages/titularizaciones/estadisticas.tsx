import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { type TitularizacionEstadistica, JUNTA_TYPES, TITULARIZACION_TYPES } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CHART_COLORS = [
  "hsl(220, 70%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(280, 60%, 55%)",
  "hsl(30, 80%, 55%)",
  "hsl(350, 70%, 55%)",
  "hsl(190, 70%, 50%)",
  "hsl(45, 80%, 50%)",
  "hsl(120, 50%, 45%)",
  "hsl(0, 70%, 55%)",
  "hsl(240, 60%, 55%)",
  "hsl(80, 60%, 45%)",
];

export default function EstadisticasPage() {
  const [juntaFilter, setJuntaFilter] = useState<string>("all");

  const { data: estadisticas = [], isLoading } = useQuery<TitularizacionEstadistica[]>({
    queryKey: ["/api/titularizaciones/estadisticas"],
  });

  const filteredEstadisticas = useMemo(() => {
    if (juntaFilter === "all") return estadisticas;
    return estadisticas.filter((est) => est.juntaClasificacion === juntaFilter);
  }, [estadisticas, juntaFilter]);

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    TITULARIZACION_TYPES.forEach((tipo) => {
      grouped[tipo] = 0;
    });
    
    filteredEstadisticas.forEach((est) => {
      if (grouped[est.tipo] !== undefined) {
        grouped[est.tipo] += est.cantidad;
      }
    });

    return TITULARIZACION_TYPES.map((tipo, index) => ({
      name: tipo,
      cantidad: grouped[tipo] || 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [filteredEstadisticas]);

  const totalTitularizaciones = useMemo(() => {
    return filteredEstadisticas.reduce((sum, est) => sum + est.cantidad, 0);
  }, [filteredEstadisticas]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Skeleton className="h-10 w-64" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-96 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Estadísticas de Titularizaciones</h2>
        <p className="text-sm text-muted-foreground">Totales por tipo de titularización</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="space-y-2 w-full sm:w-72">
            <label className="text-sm font-medium text-foreground">Junta de Clasificación</label>
            <Select value={juntaFilter} onValueChange={setJuntaFilter}>
              <SelectTrigger data-testid="filter-junta">
                <SelectValue placeholder="Todas las juntas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las juntas</SelectItem>
                {JUNTA_TYPES.map((junta) => (
                  <SelectItem key={junta} value={junta}>{junta}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-6">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-2xl font-bold text-emerald-400" data-testid="stat-total">
              {totalTitularizaciones}
            </span>
          </div>
        </div>
      </Card>

      {/* Bar Chart */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Totales de Titularizaciones por Tipo</h3>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 200, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                width={190}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [value, "Cantidad"]}
              />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {chartData.map((item, index) => (
          <Card key={item.name} className="p-4" data-testid={`card-tipo-${index}`}>
            <div className="flex items-start gap-3">
              <div 
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground line-clamp-2">{item.name}</p>
                <p className="text-xl font-bold text-foreground">{item.cantidad}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
