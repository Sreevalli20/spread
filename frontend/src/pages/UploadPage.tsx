import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { analyzeDataset } from "@/lib/api";

type ProcessingStage =
  | "idle"
  | "uploading"
  | "reading"
  | "complete"
  | "error";

const stageLabels: Record<ProcessingStage, string> = {
  idle: "Ready to analyze",
  uploading: "Uploading file",
  reading: "Analyzing dataset...",
  complete: "Analysis complete",
  error: "Error occurred",
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    // Check file type
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      setError("Only CSV and XLSX files are supported");
      return;
    }

    // Check file size (10 MB)
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
      setStage("reading");
      const result = await analyzeDataset(file);

      setStage("complete");

      // Store result in sessionStorage for dashboard
      sessionStorage.setItem("analysisResult", JSON.stringify(result));

      // Navigate to dashboard after a short delay
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">DecisionLens</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Analyze Your Data</h2>
          <p className="text-muted-foreground mb-8">
            Upload a CSV or XLSX file to get started with evidence-based decision analysis.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Upload Dataset</CardTitle>
              <CardDescription>
                Supported formats: CSV, XLSX. Maximum file size: 10 MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  className="border-2 border-dashed rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">or</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={onFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <Button variant="outline">Browse Files</Button>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <FileSpreadsheet className="w-10 h-10 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type || "Unknown type"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setError(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  {stage !== "idle" && stage !== "error" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {stage === "complete" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        )}
                        <span className="font-medium">{stageLabels[stage]}</span>
                      </div>
                      {stage === "reading" && (
                        <p className="text-sm text-muted-foreground">
                          This may take a moment if the service is starting up...
                        </p>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-900 dark:text-red-300">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {stage === "idle" && (
                    <Button onClick={handleAnalyze} className="w-full" size="lg">
                      Analyze Dataset
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
