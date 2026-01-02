import { Badge } from "@/components/ui/badge";
import type { UbicacionType } from "@shared/schema";

const ubicacionColors: Record<UbicacionType, string> = {
  "INICIAL": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "SECUNDARIO": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "OBLIGATORIA": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "LIQUIDACIONES": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "LEGAL Y TÉCNICA": "bg-slate-400/20 text-slate-300 border-slate-400/30",
  "DESPACHO": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "INNOVACIÓN": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "INFRAESTRUCTURA": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "GESTIÓN": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "HACIENDA": "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "FIRMA MINISTRO": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  "FIRMA INT.": "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

interface UbicacionBadgeProps {
  ubicacion: UbicacionType;
}

export function UbicacionBadge({ ubicacion }: UbicacionBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${ubicacionColors[ubicacion]} font-medium text-xs whitespace-nowrap`}
      data-testid={`badge-ubicacion-${ubicacion}`}
    >
      {ubicacion}
    </Badge>
  );
}
