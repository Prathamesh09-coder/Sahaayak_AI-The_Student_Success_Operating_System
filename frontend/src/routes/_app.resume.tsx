import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { ResumeAPI } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/resume")({
  head: () => ({ meta: [{ title: "Resume Analyzer · Sahaayak AI" }] }),
  component: ResumeAnalyzer,
});

function ResumeAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size is 5MB.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await ResumeAPI.analyze(file);
      if (response.success) {
        setResult(response.data);
        toast.success("Resume successfully analyzed!");
      } else {
        toast.error(response.message || "Failed to analyze resume.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8 shrink-0">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Resume Analyzer
              </h1>
              <p className="text-sm text-muted-foreground">
                Get instant feedback and ATS optimization for your resume.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="h-10 rounded-full shadow-none"
            onClick={() => {
              toast.success("Downloading ATS-friendly resume template...");
              window.open("https://docs.google.com/document/d/1Z_u10aD12Ea1X96b4rP2JdYd2a2A0J1c/edit", "_blank");
            }}
          >
            <Download className="size-4 mr-2" /> Download Template
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upload Zone */}
        <Card title="Upload Resume" className="lg:col-span-1">
          <div 
            onClick={handleUploadClick}
            className={`flex h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-background/20 p-6 text-center hover:bg-background/40 transition-colors ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              disabled={isAnalyzing}
            />
            <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary mb-4">
              <Upload className={`size-6 ${isAnalyzing ? 'animate-bounce' : ''}`} />
            </div>
            <p className="text-sm font-semibold">
              {isAnalyzing ? "AI is analyzing your resume..." : "Click to upload or drag & drop"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PDF, DOCX, or TXT (max. 5MB)
            </p>
          </div>
        </Card>

        {/* Results Panel */}
        <Card
          title="Latest Analysis"
          className="lg:col-span-2"
          icon={<FileSearch className="size-4 text-primary" />}
        >
          {isAnalyzing ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <div className="flex flex-col items-center gap-4">
                <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm">NVIDIA AI is reading your resume...</p>
              </div>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                {/* ATS Score */}
                {(() => {
                  const scoreClass = result.ats_score >= 80 ? 'border-success text-success' : result.ats_score >= 60 ? 'border-warning text-warning' : 'border-destructive text-destructive';
                  return (
                    <div className={`flex items-center justify-center size-24 rounded-full border-[6px] text-2xl font-bold shadow-[0_0_15px_rgba(0,0,0,0.2)] ${scoreClass}`}>
                      {result.ats_score}%
                    </div>
                  );
                })()}
                <div>
                  <h4 className="text-lg font-semibold">{result.status}</h4>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    {result.summary}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-success/10 border border-success/20 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-success mb-3">
                    <CheckCircle2 className="size-4" /> Strengths
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {result.strengths?.map((strength: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <div className="mt-1 size-1.5 rounded-full bg-success shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-destructive mb-3">
                    <AlertCircle className="size-4" /> Areas to Fix
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {result.weaknesses?.map((weakness: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <div className="mt-1 size-1.5 rounded-full bg-destructive shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  className="rounded-full shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={() => {
                    const weaknessesStr = result.weaknesses ? result.weaknesses.join(", ") : "";
                    const prompt = "Hi Sahaayak! I just ran an AI Resume Analysis and got an ATS score of " + result.ats_score + "%. The AI told me my weaknesses are: " + weaknessesStr + ". Can you help me fix these issues and rewrite my bullet points?";
                    sessionStorage.setItem("sahaayak_chat_prompt", prompt);
                    navigate({ to: "/dashboard" });
                  }}
                >
                  Fix with AI Mentor
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              <p className="text-sm">Upload a resume to see your ATS score and optimization tips.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  className,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <section
      className={`glass shadow-soft flex flex-col rounded-3xl p-5 md:p-6 ${className ?? ""}`}
    >
      <header className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}
