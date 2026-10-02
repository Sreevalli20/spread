import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { Anomaly } from "@/types";

interface AnomalyCardProps {
  anomaly: Anomaly;
  onViewEvidence?: (evidenceId: string) => void;
}

export default function AnomalyCard({ anomaly, onViewEvidence }: AnomalyCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "high":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border hover:shadow-medium transition-shadow">
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold truncate">{anomaly.metric}</h3>
            </div>
            <Badge className={getSeverityColor(anomaly.severity)} variant="outline">
              {anomaly.severity}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Observed</span>
              <span className="font-medium">{anomaly.observed_value.toFixed(2)}</span>
            </div>
            {anomaly.expected_value && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected</span>
                <span className="font-medium">{anomaly.expected_value.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deviation</span>
              <span className="font-medium text-destructive">
                {(anomaly.deviation * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Method: {anomaly.method}
            </p>
            
            {onViewEvidence && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewEvidence(anomaly.evidence_id)}
                className="h-8 text-xs"
              >
                View evidence
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
