import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComponentType } from "react";

export function ModuleStub({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid min-h-[70dvh] place-items-center">
      <div className="glass-strong shadow-soft mx-auto w-full max-w-xl rounded-3xl p-10 text-center">
        <div
          className="mx-auto grid size-14 place-items-center rounded-2xl text-primary-foreground shadow-glow"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Icon className="size-6" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" /> Coming next
        </div>
        <div className="mt-7 flex justify-center gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/dashboard">
              <ArrowLeft className="size-4" /> Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
