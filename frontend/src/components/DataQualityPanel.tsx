import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DataQuality } from "@/types";

interface DataQualityPanelProps {
  dataQuality: DataQuality;
}

export default function DataQualityPanel({ dataQuality }: DataQualityPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-lg">Data Quality</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quality Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Quality Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(dataQuality.score)}`}>
              {dataQuality.score.toFixed(1)}/100
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBg(dataQuality.score)} rounded-full transition-all`}
              style={{ width: `${dataQuality.score}%` }}
            />
          </div>
        </div>

        {/* Dataset Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Rows</p>
            <p className="text-lg font-semibold">{dataQuality.row_count.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Columns</p>
            <p className="text-lg font-semibold">{dataQuality.column_count}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Missing Cells</p>
            <p className="text-lg font-semibold">{dataQuality.missing_cells.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duplicate Rows</p>
            <p className="text-lg font-semibold">{dataQuality.duplicate_rows.toLocaleString()}</p>
          </div>
        </div>

        {/* Column Types */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Numeric Columns</p>
            <p className="text-sm font-medium">{dataQuality.numeric_columns}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Date Columns</p>
            <p className="text-sm font-medium">{dataQuality.date_columns}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Categorical Columns</p>
            <p className="text-sm font-medium">{dataQuality.categorical_columns}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Constant Columns</p>
            <p className="text-sm font-medium">{dataQuality.constant_columns}</p>
          </div>
        </div>

        {/* Quality Issues */}
        {dataQuality.reasons.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Quality Issues</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              {dataQuality.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
