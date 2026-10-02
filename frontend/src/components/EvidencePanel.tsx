import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, FileText, Calculator as CalculatorIcon, Database } from "lucide-react";
import type { Evidence } from "@/types";

interface EvidencePanelProps {
  evidence: Evidence;
  onClose?: () => void;
}

export default function EvidencePanel({ evidence, onClose }: EvidencePanelProps) {
  return (
    <Card className="border shadow-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Evidence Details</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Evidence ID */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Evidence ID</p>
          <p className="text-sm font-mono bg-muted/50 p-2 rounded">{evidence.evidence_id}</p>
        </div>

        {/* Claim */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Claim</p>
          <p className="text-sm">{evidence.claim}</p>
        </div>

        {/* Source Columns */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Source Columns</p>
          <div className="flex flex-wrap gap-2">
            {evidence.source_columns.map((col) => (
              <Badge key={col} variant="outline" className="text-xs">
                {col}
              </Badge>
            ))}
          </div>
        </div>

        {/* Sample Size */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Sample Size</p>
            <p className="text-sm font-medium">{evidence.sample_size.toLocaleString()} records</p>
          </div>
        </div>

        {/* Calculation */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <CalculatorIcon className="h-3 w-3" />
            Calculation
          </p>
          <pre className="text-xs text-muted-foreground bg-muted/50 p-3 rounded overflow-x-auto font-mono">
            {evidence.calculation}
          </pre>
        </div>

        {/* Values */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Values</p>
          <pre className="text-xs text-muted-foreground bg-muted/50 p-3 rounded overflow-x-auto max-h-48 overflow-y-auto">
            {JSON.stringify(evidence.values, null, 2)}
          </pre>
        </div>

        {/* Limitations */}
        {evidence.limitations.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Limitations</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              {evidence.limitations.map((limit, idx) => (
                <li key={idx}>{limit}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
