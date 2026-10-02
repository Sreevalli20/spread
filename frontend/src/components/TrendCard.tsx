import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import type { Trend } from "@/types";

interface TrendCardProps {
  trend: Trend;
  onViewEvidence?: (evidenceId: string) => void;
}

export default function TrendCard({ trend, onViewEvidence }: TrendCardProps) {
  const getDirectionIcon = (direction: string) => {
    switch (direction.toLowerCase()) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction.toLowerCase()) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="border hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{trend.metric}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Direction</span>
          <div className="flex items-center gap-2">
            {getDirectionIcon(trend.direction)}
            <span className={`font-medium ${getDirectionColor(trend.direction)}`}>
              {trend.direction}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Strength</span>
          <span className="font-medium">{(trend.strength * 100).toFixed(1)}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Recent Change</span>
          <span className="font-medium">{trend.recent_change.toFixed(2)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Period</span>
          <Badge variant="outline" className="text-xs">
            {trend.period_type}
          </Badge>
        </div>

        {onViewEvidence && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewEvidence(trend.evidence_id)}
            className="w-full mt-2"
          >
            View evidence
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
