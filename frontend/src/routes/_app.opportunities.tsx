import { createFileRoute } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  MapPin,
  Target,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/opportunities")({
  head: () => ({ meta: [{ title: "Opportunity Copilot · Sahaayak AI" }] }),
  component: Opportunities,
});

import { OpportunitiesAPI } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

function Opportunities() {
  const { user } = useUser();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      setStudentId(user.id);
    } else {
      setStudentId("student_123");
    }
  }, [user]);

  useEffect(() => {
    if (!studentId) return;

    const loadOpportunities = async () => {
      try {
        const res = await OpportunitiesAPI.getRecommended(studentId);
        if (res.success && res.data) {
          setOpportunities(res.data);
        }
      } catch (err) {
        console.error("Failed to load opportunities", err);
      }
    };

    loadOpportunities();
  }, [studentId]);

  const handleApply = async (opportunityId: string) => {
    try {
      const res = await OpportunitiesAPI.apply(opportunityId, studentId);
      if (res.success) {
        toast.success("Successfully applied!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application.");
    }
  };

  return (
    <div className="space-y-4">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Briefcase className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Opportunity Copilot
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-curated internships and jobs matching your digital twin.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {opportunities.map((match, idx) => (
          <OpportunityCard key={idx} match={match} onApply={handleApply} />
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({
  match,
  onApply,
}: {
  match: any;
  onApply: (id: string) => void;
}) {
  const {
    opportunity,
    eligibility_score,
    readiness,
    missing_skills,
    recommended_actions,
  } = match;
  const isReady = readiness === "Ready";

  return (
    <section
      className={`glass shadow-soft flex flex-col rounded-3xl p-5 border border-border/50`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="size-12 rounded-xl bg-muted grid place-items-center shrink-0">
            <Building2 className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{opportunity.title}</h3>
            <p className="text-sm text-muted-foreground">
              {opportunity.company}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-background border border-border">
            {opportunity.type}
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${isReady ? "bg-success/20 text-success" : "bg-primary/20 text-primary"}`}
          >
            {eligibility_score}% Match
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <MapPin className="size-3" /> {opportunity.location}
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-6">
        {!isReady && missing_skills && missing_skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-warning">
              <Target className="size-4" /> Missing Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {missing_skills.map((s: string, i: number) => (
                <span
                  key={i}
                  className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-md"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {recommended_actions && recommended_actions.length > 0 && (
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-primary">
              <Zap className="size-4" /> Recommended Actions
            </div>
            <ul className="space-y-1">
              {recommended_actions.map((act: string, i: number) => (
                <li
                  key={i}
                  className="text-xs text-foreground/80 flex items-start gap-2"
                >
                  <ArrowRight className="size-3 mt-0.5 shrink-0 text-primary/60" />{" "}
                  {act}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button
        onClick={() => onApply(opportunity.id)}
        className="w-full rounded-xl gap-2 shadow-glow"
        variant={isReady ? "default" : "outline"}
      >
        {isReady ? "Apply Now" : "Save for Later"}{" "}
        <ExternalLink className="size-3" />
      </Button>
    </section>
  );
}
