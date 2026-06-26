import { createFileRoute } from "@tanstack/react-router";
import {
  GraduationCap,
  Award,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/scholarships")({
  head: () => ({ meta: [{ title: "Scholarships · Sahaayak AI" }] }),
  component: Scholarships,
});

import { ScholarshipAPI } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

function Scholarships() {
  const { user } = useUser();
  const [scholarships, setScholarships] = useState<any[]>([]);
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

    const loadScholarships = async () => {
      try {
        const res = await ScholarshipAPI.getRecommended(studentId);
        if (res.success && res.data) {
          setScholarships(res.data);
        }
      } catch (err) {
        console.error("Failed to load scholarships", err);
      }
    };

    loadScholarships();
  }, [studentId]);

  return (
    <div className="space-y-4">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <GraduationCap className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Scholarship Hub
            </h1>
            <p className="text-sm text-muted-foreground">
              Personalized scholarships matched to your profile and eligibility.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((match, idx) => (
          <Card key={idx} match={match} />
        ))}
      </div>
    </div>
  );
}

function Card({ match }: { match: any }) {
  const { scholarship, eligibility_score, is_eligible, missing_requirements } =
    match;

  return (
    <section
      className={`glass shadow-soft flex flex-col rounded-3xl p-5 border-2 ${is_eligible ? "border-primary/20" : "border-border/50"}`}
    >
      <header className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="bg-primary/10 text-primary p-2 rounded-xl">
            <Award className="size-5" />
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${is_eligible ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}
          >
            {eligibility_score}% Match
          </span>
        </div>
        <h3 className="font-bold text-lg">{scholarship.title}</h3>
        <p className="text-xs text-muted-foreground">{scholarship.provider}</p>
      </header>

      <div className="flex-1 space-y-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <Calendar className="size-4" />
          <span>Deadline: {scholarship.deadline}</span>
        </div>

        {is_eligible ? (
          <div className="flex items-start gap-2 text-xs text-success/80 bg-success/10 p-2 rounded-lg">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <p>You meet all criteria! Apply before the deadline.</p>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-xs text-warning/80 bg-warning/10 p-2 rounded-lg">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Missing Requirements:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {missing_requirements.map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <Button
        className="w-full rounded-full gap-2 shadow-glow"
        disabled={!is_eligible}
        onClick={() => window.open(scholarship.url || "https://scholarships.gov.in", "_blank")}
      >
        Apply Now <ExternalLink className="size-3" />
      </Button>
    </section>
  );
}
