import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Briefcase,
  Calendar,
  Globe,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/mentors")({
  head: () => ({ meta: [{ title: "Mentor Network · Sahaayak AI" }] }),
  component: Mentors,
});

import { MentorAPI } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

function Mentors() {
  const { user } = useUser();
  const [mentors, setMentors] = useState<any[]>([]);
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

    const loadMentors = async () => {
      try {
        const res = await MentorAPI.getRecommended(studentId);
        if (res.success && res.data) {
          setMentors(res.data);
        }
      } catch (err) {
        console.error("Failed to load mentors", err);
      }
    };

    loadMentors();
  }, [studentId]);

  const handleBookSession = async (mentorId: string) => {
    try {
      const res = await MentorAPI.bookSession(mentorId, studentId);
      if (res.success) {
        toast.success("Session requested successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to book session.");
    }
  };

  return (
    <div className="space-y-4">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Mentor Network
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect with industry professionals who share your background and
              goals.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {mentors.map((m, idx) => (
          <MentorCard key={idx} mentor={m} onBook={handleBookSession} />
        ))}
      </div>
    </div>
  );
}

function MentorCard({
  mentor,
  onBook,
}: {
  mentor: any;
  onBook: (id: string) => void;
}) {
  const {
    id,
    mentor_id,
    mentor_name,
    designation,
    company,
    match_score,
    reason,
    languages,
    availability,
  } = mentor;
  const targetId = mentor_id || id;

  return (
    <section className="glass shadow-soft flex flex-col rounded-3xl p-5 border border-border/50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="size-14 rounded-full bg-muted grid place-items-center shrink-0 border-2 border-primary/20">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{mentor_name}</h3>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
              <Briefcase className="size-3" /> {designation}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Building2 className="size-3" /> {company}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-success/20 text-success shrink-0">
          {match_score}% Match
        </span>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        <div className="bg-primary/5 rounded-xl p-3 text-xs text-primary/80 border border-primary/10">
          <span className="font-semibold block mb-1">Why this match?</span>
          {reason}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="size-3" /> {languages && languages.join(", ")}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="size-3" /> {availability}
          </div>
        </div>
      </div>

      <Button
        onClick={() => onBook(targetId)}
        className="w-full rounded-xl gap-2 shadow-glow"
      >
        Book Session <Calendar className="size-4" />
      </Button>
    </section>
  );
}
