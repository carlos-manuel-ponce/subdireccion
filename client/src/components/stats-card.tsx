import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-primary" }: StatsCardProps) {
  return (
    <Card className="transition-all">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-md bg-primary/10 ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-foreground" data-testid={`stat-value-${title.toLowerCase().replace(/\s/g, '-')}`}>
              {value}
            </span>
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
