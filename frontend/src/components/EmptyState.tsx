import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, TrendingUp, AlertTriangle, FileText, Bot } from "lucide-react";

interface EmptyStateProps {
  type: "no-analysis" | "no-trends" | "no-anomalies" | "no-findings" | "ai-unavailable";
  title?: string;
  description?: string;
}

export default function EmptyState({ type, title, description }: EmptyStateProps) {
  const configs = {
    "no-analysis": {
      icon: FileSpreadsheet,
      defaultTitle: "No analysis yet",
      defaultDescription: "Upload a dataset to begin your analysis.",
    },
    "no-trends": {
      icon: TrendingUp,
      defaultTitle: "No trends detected",
      defaultDescription: "There isn't enough evidence of a meaningful trend in this dataset.",
    },
    "no-anomalies": {
      icon: AlertTriangle,
      defaultTitle: "No anomalies detected",
      defaultDescription: "No statistically significant anomalies were identified.",
    },
    "no-findings": {
      icon: FileText,
      defaultTitle: "No findings available",
      defaultDescription: "No findings were generated from this analysis.",
    },
    "ai-unavailable": {
      icon: Bot,
      defaultTitle: "AI unavailable",
      defaultDescription: "Your dataset analysis is still available. AI interpretation is temporarily unavailable.",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card className="border border-dashed">
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-semibold">{title || config.defaultTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {description || config.defaultDescription}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
