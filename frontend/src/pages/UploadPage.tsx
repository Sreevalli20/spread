import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { analyzeDataset } from "@/lib/api";

type ProcessingStage =
  | "idle"
  | "uploading"
  | "reading"
  | "profiling"
  | "calculating"
  | "detecting"
  | "complete"
  | "error";

const stageLabels: Record<ProcessingStage, string> = {
  idle: "Ready to analyze",
  uploading: "Uploading file",
  reading: "Reading dataset...",
  profiling: "Profiling columns...",
  calculating: "Calculating KPIs...",
  detecting: "Detecting trends and anomalies...",
  complete: "Analysis complete",
  error: "Error occurred",
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      setError("Only CSV and XLSX files are supported");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10 MB limit");
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setStage("uploading");
    setError(null);

    try {
      // Simulate progress stages for visual feedback
      setStage("reading");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStage("profiling");
      const result = await analyzeDataset(file);

      setStage("complete");

      sessionStorage.setItem("analysisResult", JSON.stringify(result));

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setStage("error");
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze dataset";
      setError(errorMessage);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Analyze Your Data</h1>
            <p className="text-muted-foreground text-lg">
              Upload a CSV or XLSX file to get evidence-based decision intelligence.
            </p>
          </div>

          {/* Upload Card */}
          <Card className="border shadow-elevated">
            <CardContent className="p-8">
              {!file ? (
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={onFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-input"
                  />
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Drop CSV or XLSX here
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      or click to browse your files
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Maximum file size: 10 MB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Preview */}
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFile(null);
                        setError(null);
                        setStage("idle");
                      }}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Processing Stages */}
                  {stage !== "idle" && stage !== "error" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {stage === "complete" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        )}
                        <span className="font-medium">{stageLabels[stage]}</span>
                      </div>
                      
                      {stage !== "complete" && (
                        <div className="space-y-2">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-pulse-slow rounded-full" style={{ width: '60%' }} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            This may take a moment if the service is starting up...
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">Upload failed</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Analyze Button */}
                  {stage === "idle" && (
                    <Button
                      onClick={handleAnalyze}
                      className="w-full h-12 text-base shadow-elevated"
                      size="lg"
                    >
                      Analyze dataset
                      <Upload className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">CSV & XLSX</p>
                    <p className="text-xs text-muted-foreground">
                      Support for spreadsheet formats
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Evidence-Based</p>
                    <p className="text-xs text-muted-foreground">
                      Every finding is traceable
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Fast Analysis</p>
                    <p className="text-xs text-muted-foreground">
                      Results in seconds to minutes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
