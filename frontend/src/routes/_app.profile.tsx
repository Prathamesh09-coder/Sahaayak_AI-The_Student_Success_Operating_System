import { createFileRoute, Link } from "@tanstack/react-router";
import {
  User,
  GraduationCap,
  Users,
  Compass,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { OnboardingAPI, TwinAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useUser, useInvalidateUser } from "@/hooks/useUser";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "My Profile · Sahaayak AI" }] }),
  component: ProfilePage,
});

const INCOME_OPTIONS = [
  { key: "below-3l", label: "Below ₹3L", value: 200000 },
  { key: "3-6l", label: "₹3L – ₹6L", value: 450000 },
  { key: "6-12l", label: "₹6L – ₹12L", value: 800000 },
  { key: "12l+", label: "Above ₹12L", value: 1500000 },
  { key: "skip", label: "Prefer not to say", value: 0 },
];

const YEAR_OPTIONS = ["1st year", "2nd year", "3rd year", "4th year", "PG"];

function ProfilePage() {
  const { user, student, refetch: refetchUser } = useUser();
  const invalidateUser = useInvalidateUser();

  // ─── Query: Full Profile Details ───────────────────────────────────────────
  const {
    data: fullProfileRes,
    isLoading: isProfileLoading,
    refetch: refetchProfileData,
  } = useQuery<any, Error>({
    queryKey: ["fullProfileDetailsForPage"],
    queryFn: () => OnboardingAPI.getMe().then((res) => res.data),
  });

  // ─── Profile Form States ──────────────────────────────────────────────────
  const [profName, setProfName] = useState("");
  const [profAge, setProfAge] = useState<number>(18);
  const [profLang, setProfLang] = useState("English");
  const [profCollege, setProfCollege] = useState("");
  const [profBranch, setProfBranch] = useState("");
  const [profYear, setProfYear] = useState("1st year");
  const [profCgpa, setProfCgpa] = useState<number>(0);
  const [profFirstGen, setProfFirstGen] = useState(true);
  const [profIncome, setProfIncome] = useState("below-3l");
  const [profDreamCareer, setProfDreamCareer] = useState("");
  const [profSkills, setProfSkills] = useState("");
  const [profInterests, setProfInterests] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profile data when query loads
  useEffect(() => {
    if (fullProfileRes) {
      const sp = fullProfileRes.student_profile || {};
      const fp = fullProfileRes.family_profile || {};
      const cp = fullProfileRes.career_profile || {};

      setProfName(user?.full_name || "");
      setProfAge(sp.age || 18);
      setProfLang(sp.preferred_language || "English");
      setProfCollege(sp.college || "");
      setProfBranch(sp.branch || "");

      // Map year number to string
      const yearMapReverse: Record<number, string> = {
        1: "1st year",
        2: "2nd year",
        3: "3rd year",
        4: "4th year",
        5: "PG",
      };
      setProfYear(yearMapReverse[sp.year] || "1st year");
      setProfCgpa(sp.cgpa || 0);

      setProfFirstGen(fp.first_generation_learner ?? true);

      // Map income back to option
      const incomeVal = fp.annual_income || 0;
      const matchingIncome =
        INCOME_OPTIONS.find((o) => o.value === incomeVal) || INCOME_OPTIONS[0];
      setProfIncome(matchingIncome.key);

      setProfDreamCareer(cp.dream_career || "");
      setProfSkills(cp.skills ? cp.skills.join(", ") : "");
      setProfInterests(cp.interests ? cp.interests.join(", ") : "");
    }
  }, [fullProfileRes, user]);

  // Checklist computation based on form inputs / database values
  const checklist = useMemo(() => {
    const sp = fullProfileRes?.student_profile || {};
    const fp = fullProfileRes?.family_profile || {};
    const cp = fullProfileRes?.career_profile || {};

    return [
      {
        label: "Personal & Academic Info",
        desc: "Name, Age, Language, College, Branch, Year, CGPA",
        done: !!(
          user?.full_name &&
          sp.age &&
          sp.college &&
          sp.branch &&
          sp.year &&
          sp.cgpa
        ),
      },
      {
        label: "Family & Economic Background",
        desc: "Annual Income, First-Gen learner status",
        done: !!fp.id,
      },
      {
        label: "Career Aspirations",
        desc: "Dream Career path",
        done: !!cp.dream_career,
      },
      {
        label: "Skills & Interests",
        desc: "Core skills and personal interests",
        done: !!(cp.skills?.length && cp.interests?.length),
      },
    ];
  }, [fullProfileRes, user]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      // 1. Map year
      const yearMap: Record<string, number> = {
        "1st year": 1,
        "2nd year": 2,
        "3rd year": 3,
        "4th year": 4,
        PG: 5,
      };

      // 2. Map income
      const incomeEntry = INCOME_OPTIONS.find((o) => o.key === profIncome);

      // 3. Save Academic Profile
      await OnboardingAPI.saveAcademic({
        name: profName,
        age: Number(profAge),
        preferred_language: profLang,
        college: profCollege,
        branch: profBranch,
        year: yearMap[profYear] ?? 1,
        cgpa: Number(profCgpa),
      });

      // 4. Save Family Profile
      await OnboardingAPI.saveFamily({
        annual_income: incomeEntry?.value ?? 0,
        first_generation_learner: profFirstGen,
      });

      // 5. Save Career Profile
      const skillsArray = profSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const interestsArray = profInterests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      await OnboardingAPI.saveCareer({
        dream_career: profDreamCareer,
        skills: skillsArray,
        interests: interestsArray,
      });

      // 6. Recalculate Digital Twin
      await TwinAPI.recalculate();

      // 7. Refresh contexts
      invalidateUser();
      await refetchUser();
      await refetchProfileData();

      toast.success(
        "Profile saved and Digital Twin recalculated in real-time! 🚀",
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* ─── Header ─── */}
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8 shrink-0">
        <div
          aria-hidden
          className="absolute -right-20 -top-24 size-72 rounded-full blur-3xl"
          style={{ background: "var(--gradient-primary)", opacity: 0.25 }}
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <User className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                My Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your credentials, academic details, and career
                aspirations in real-time.
              </p>
            </div>
          </div>
          {student && (
            <div className="flex items-center gap-2 rounded-2xl bg-success/15 border border-success/20 px-4 py-2 text-xs font-semibold text-success shadow-[0_0_15px_var(--success)]/10">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              Real-time Database Synced
            </div>
          )}
        </div>
      </header>

      {/* ─── Two Column Layout ─── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column: Progress Card & Checklist */}
        <div className="lg:col-span-1 space-y-4">
          {/* Progress Circular Gauge */}
          <section className="glass shadow-soft rounded-3xl p-5 md:p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold mb-4 w-full text-left flex items-center gap-2">
              <Award className="size-4 text-primary" /> Completion Progress
            </h3>
            <div className="relative size-36">
              <svg className="size-full" viewBox="0 0 36 36">
                <path
                  className="text-muted"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-1000"
                  strokeWidth="2.5"
                  strokeDasharray={`${Math.round(student?.profile_completeness || 0)}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-extrabold tracking-tight">
                  {Math.round(student?.profile_completeness || 0)}%
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                  Complete
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              A 100% complete profile improves matching accuracy for
              scholarships and career path roadmaps by up to 4x.
            </p>
          </section>

          {/* Checklist */}
          <section className="glass shadow-soft rounded-3xl p-5 md:p-6">
            <h3 className="text-sm font-semibold mb-3">Profile Checklist</h3>
            <ul className="space-y-3">
              {checklist.map((item: any, idx: number) => (
                <li
                  key={idx}
                  className={`flex items-start gap-3 rounded-2xl p-3 border transition-colors ${
                    item.done
                      ? "bg-success/5 border-success/25"
                      : "bg-background/40 border-border/40"
                  }`}
                >
                  {item.done ? (
                    <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-success" />
                  ) : (
                    <AlertCircle className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <div
                      className={`text-xs font-bold ${item.done ? "text-success" : "text-foreground"}`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Column: Profile Editor Form */}
        <div className="lg:col-span-2">
          {isProfileLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground bg-card rounded-3xl border border-border/30">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs">Loading profile from database...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Personal & Academic */}
              <section className="glass shadow-soft rounded-3xl p-5 md:p-6">
                <header className="mb-4 flex items-center gap-2">
                  <GraduationCap className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    1. Personal & Academic Details
                  </h3>
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Anjali Raj"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Age
                    </label>
                    <input
                      type="number"
                      required
                      value={profAge}
                      onChange={(e) => setProfAge(Number(e.target.value))}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="19"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      College Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profCollege}
                      onChange={(e) => setProfCollege(e.target.value)}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="College name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Branch / Specialization
                    </label>
                    <input
                      type="text"
                      required
                      value={profBranch}
                      onChange={(e) => setProfBranch(e.target.value)}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Academic Year
                    </label>
                    <select
                      value={profYear}
                      onChange={(e) => setProfYear(e.target.value)}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y} className="bg-card">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      CGPA / Percentage
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={profCgpa}
                      onChange={(e) => setProfCgpa(Number(e.target.value))}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="8.5"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Preferred Communication Language
                    </label>
                    <input
                      type="text"
                      required
                      value={profLang}
                      onChange={(e) => setProfLang(e.target.value)}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="English, Hindi, Telugu, etc."
                    />
                  </div>
                </div>
              </section>

              {/* Family & Economic */}
              <section className="glass shadow-soft rounded-3xl p-5 md:p-6">
                <header className="mb-4 flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    2. Family & Economic Status
                  </h3>
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Annual Household Income
                    </label>
                    <select
                      value={profIncome}
                      onChange={(e) => setProfIncome(e.target.value)}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                    >
                      {INCOME_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key} className="bg-card">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-background/30 border border-border/50 rounded-2xl sm:mt-5">
                    <div>
                      <div className="text-xs font-bold">
                        First-Generation Learner
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        First in family to attend college
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={profFirstGen}
                      onChange={(e) => setProfFirstGen(e.target.checked)}
                      className="size-5 rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </section>

              {/* Career & Skills */}
              <section className="glass shadow-soft rounded-3xl p-5 md:p-6">
                <header className="mb-4 flex items-center gap-2">
                  <Compass className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    3. Career Dreams & Skill Baseline
                  </h3>
                </header>

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Dream Career Path
                    </label>
                    <input
                      type="text"
                      required
                      value={profDreamCareer}
                      onChange={(e) => setProfDreamCareer(e.target.value)}
                      className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Software Engineer, Civil Servant, Business Analyst, etc."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Skills (Comma-separated)
                    </label>
                    <textarea
                      value={profSkills}
                      onChange={(e) => setProfSkills(e.target.value)}
                      className="w-full min-h-[70px] bg-background/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="React, Python, SQL, Excel, Communication"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Interests (Comma-separated)
                    </label>
                    <textarea
                      value={profInterests}
                      onChange={(e) => setProfInterests(e.target.value)}
                      className="w-full min-h-[70px] bg-background/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="Coding, Writing, Sports, Design, Volunteering"
                    />
                  </div>
                </div>
              </section>

              {/* Form Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      Save & Complete Profile <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
