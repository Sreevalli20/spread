import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KPI } from "@/types";

interface KPICardProps {
  kpi: KPI;
}

export default function KPICard({ kpi }: KPICardProps) {
  return (
    <Card className="border hover:shadow-medium transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {kpi.name}
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {kpi.formatted_value}
              </p>
            </div>
          </div>
          
          {kpi.unit && (
            <p className="text-xs text-muted-foreground">{kpi.unit}</p>
          )}
          
          {kpi.warnings.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {kpi.warnings[0]}
            </Badge>
          )}
          
          <p className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
            {kpi.calculation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
