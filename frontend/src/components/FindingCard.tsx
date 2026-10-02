import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, ChevronRight } from "lucide-react";
import type { Finding } from "@/types";

interface FindingCardProps {
  finding: Finding;
  onViewEvidence?: (evidenceId: string) => void;
}

export default function FindingCard({ finding, onViewEvidence }: FindingCardProps) {
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

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "negative":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border hover:shadow-medium transition-shadow">
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getImpactIcon(finding.impact)}
              <h3 className="font-semibold truncate">{finding.title}</h3>
            </div>
            <Badge className={getSeverityColor(finding.severity)} variant="outline">
              {finding.severity}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {finding.description}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Confidence:</span>
              <span className="font-medium">{(finding.confidence * 100).toFixed(0)}%</span>
            </div>
            
            {onViewEvidence && finding.evidence_ids.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewEvidence(finding.evidence_ids[0])}
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
