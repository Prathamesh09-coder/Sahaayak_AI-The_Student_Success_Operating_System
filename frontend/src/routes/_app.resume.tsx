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

export const Route = createFileRoute("/_app/resume")({
  head: () => ({ meta: [{ title: "Resume Analyzer · Sahaayak AI" }] }),
  component: ResumeAnalyzer,
});

function ResumeAnalyzer() {
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
          <Button variant="outline" className="h-10 rounded-full shadow-none">
            <Download className="size-4 mr-2" /> Download Template
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upload Zone */}
        <Card title="Upload Resume" className="lg:col-span-1">
          <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-background/20 p-6 text-center hover:bg-background/40 transition-colors cursor-pointer">
            <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary mb-4">
              <Upload className="size-6" />
            </div>
            <p className="text-sm font-semibold">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PDF or DOCX (max. 5MB)
            </p>
          </div>
        </Card>

        {/* Results Panel */}
        <Card
          title="Latest Analysis"
          className="lg:col-span-2"
          icon={<FileSearch className="size-4 text-primary" />}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              {/* ATS Score */}
              <div className="flex items-center justify-center size-24 rounded-full border-[6px] border-warning text-2xl font-bold text-warning shadow-[0_0_15px_var(--warning)]/20">
                68%
              </div>
              <div>
                <h4 className="text-lg font-semibold">Needs Improvement</h4>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Your resume has good content but lacks proper formatting and
                  keyword optimization for Software Engineering roles.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-success/10 border border-success/20 p-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-success mb-3">
                  <CheckCircle2 className="size-4" /> Strengths
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <div className="mt-1 size-1.5 rounded-full bg-success shrink-0" />
                    Strong project descriptions with measurable outcomes.
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <div className="mt-1 size-1.5 rounded-full bg-success shrink-0" />
                    Clear education timeline.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-destructive mb-3">
                  <AlertCircle className="size-4" /> Areas to Fix
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <div className="mt-1 size-1.5 rounded-full bg-destructive shrink-0" />
                    Missing keywords: "React", "Node.js", "Agile".
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <div className="mt-1 size-1.5 rounded-full bg-destructive shrink-0" />
                    Formatting is not completely ATS-friendly (avoid columns).
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button
                className="rounded-full shadow-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                Fix with AI Mentor
              </Button>
            </div>
          </div>
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
