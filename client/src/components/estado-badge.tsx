import { Badge } from "@/components/ui/badge";
import type { EstadoType } from "@shared/schema";

const estadoColors: Record<EstadoType, string> = {
  "INICIAL": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  "SECUNDARIO": "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20",
  "OBLIGATORIA": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  "LIQUIDACIONES": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  "LEGAL Y TÉCNICA": "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20",
  "DESPACHO": "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  "INNOVACIÓN": "bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/20",
  "INFRAESTRUCTURA": "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
  "GESTIÓN": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  "HACIENDA": "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/20",
  "FIRMA MINISTRO": "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
  "FIRMA INT.": "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/20",
};

interface EstadoBadgeProps {
  estado: EstadoType;
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${estadoColors[estado]} font-medium text-xs whitespace-nowrap`}
      data-testid={`badge-estado-${estado}`}
    >
      {estado}
    </Badge>
  );
}
