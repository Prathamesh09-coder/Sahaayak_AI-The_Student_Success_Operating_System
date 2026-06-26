import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/app/brand";
import { cn } from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { OnboardingAPI } from "@/lib/api";
import { useInvalidateUser } from "@/hooks/useUser";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Welcome · Sahaayak AI" }],
  }),
  component: Onboarding,
});

// ─── Validation Schema ──────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(10).max(100),
  language: z.string().min(1),
  firstGen: z.boolean(),
  income: z.string().min(1),
  college: z.string().min(1, "College name is required"),
  branch: z.string().min(1, "Branch is required"),
  year: z.string().min(1),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  careers: z.array(z.string()).min(0),
  interests: z.array(z.string()).min(0),
});

type FormData = z.infer<typeof formSchema>;

// ─── Step Definitions ────────────────────────────────────────────────────────

const STEPS = [
  { key: "intro", title: "Welcome to Sahaayak" },
  { key: "personal", title: "About you" },
  { key: "language", title: "Your language" },
  { key: "family", title: "Family background" },
  { key: "academic", title: "Academic life" },
  { key: "career", title: "Career dreams" },
  { key: "interests", title: "Interests & skills" },
  { key: "done", title: "All set" },
];

const INCOME_OPTIONS = [
  { key: "below-3l", label: "Below ₹3L", value: 200000 },
  { key: "3-6l", label: "₹3L – ₹6L", value: 450000 },
  { key: "6-12l", label: "₹6L – ₹12L", value: 800000 },
  { key: "12l+", label: "Above ₹12L", value: 1500000 },
  { key: "skip", label: "Prefer not to say", value: 0 },
];

const LANGUAGES = [
  "English",
  "हिन्दी",
  "தமிழ்",
  "తెలుగు",
  "বাংলা",
  "मराठी",
  "ગુજરાતી",
  "ಕನ್ನಡ",
  "മലയാളം",
  "ਪੰਜਾਬੀ",
  "ଓଡ଼ିଆ",
  "اردو",
];

const CAREERS = [
  "Software Engineering",
  "Data Science",
  "Civil Services",
  "Medicine",
  "Design",
  "Teaching",
  "Business",
  "Research",
  "Law",
  "Finance",
];

const INTERESTS = [
  "Coding",
  "Writing",
  "Math",
  "Sports",
  "Music",
  "Public speaking",
  "Art",
  "Volunteering",
  "Languages",
  "Entrepreneurship",
];

const YEAR_OPTIONS = ["1st year", "2nd year", "3rd year", "4th year", "PG"];

// ─── Component ───────────────────────────────────────────────────────────────

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const invalidateUser = useInvalidateUser();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: 18,
      language: "English",
      firstGen: true,
      income: "below-3l",
      college: "",
      branch: "",
      year: "1st year",
      cgpa: 0,
      careers: [],
      interests: [],
    },
  });

  // Resume from last saved step
  useEffect(() => {
    OnboardingAPI.getStatus()
      .then((res) => {
        if (res.data?.current_step && res.data.current_step > 1) {
          setStep(Math.min(res.data.current_step - 1, STEPS.length - 1));
        }
      })
      .catch(() => {}); // Silently ignore — user may not have a profile yet
  }, []);

  const progress = useMemo(
    () => Math.round(((step + 1) / STEPS.length) * 100),
    [step],
  );
  const current = STEPS[step];

  // ─── Per-Step Save Logic ─────────────────────────────────────────────────

  const saveCurrentStep = async (data: FormData): Promise<boolean> => {
    try {
      if (step === 1) {
        // Personal info → save name and age in real-time
        await OnboardingAPI.saveAcademic({ name: data.name, age: data.age });
        invalidateUser(); // Refresh user state in real-time
      } else if (step === 2) {
        await OnboardingAPI.saveAcademic({ preferred_language: data.language });
      } else if (step === 3) {
        const incomeEntry = INCOME_OPTIONS.find((o) => o.key === data.income);
        await OnboardingAPI.saveFamily({
          annual_income: incomeEntry?.value ?? 0,
          first_generation_learner: data.firstGen,
        });
      } else if (step === 4) {
        const yearMap: Record<string, number> = {
          "1st year": 1,
          "2nd year": 2,
          "3rd year": 3,
          "4th year": 4,
          PG: 5,
        };
        await OnboardingAPI.saveAcademic({
          college: data.college,
          branch: data.branch,
          year: yearMap[data.year] ?? 1,
          cgpa: data.cgpa || 0,
        });
      } else if (step === 5) {
        await OnboardingAPI.saveCareer({
          dream_career: data.careers[0] || "",
          skills: data.careers,
          interests: data.interests,
        });
      } else if (step === 6) {
        // Save interests + assessment
        await OnboardingAPI.saveCareer({
          interests: data.interests,
        });
        await OnboardingAPI.saveAssessment({
          motivation_level: 7,
          confidence_level: 7,
          communication_skill: 7,
        });
      }
      return true;
    } catch (err: any) {
      toast.error(err?.message || "Failed to save. Please try again.");
      return false;
    }
  };

  // ─── Advance to next step ────────────────────────────────────────────────

  const next = async () => {
    const data = watch();
    setLoading(true);
    try {
      const saved = await saveCurrentStep(data);
      if (!saved) return;

      if (step === STEPS.length - 1) {
        // Final step → complete onboarding
        await OnboardingAPI.complete();
        invalidateUser(); // Refresh global user context
        toast.success("Your Digital Twin is being generated! 🎉");
        navigate({ to: "/dashboard" });
      } else {
        setStep((s) => s + 1);
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const toggle = (k: "careers" | "interests", v: string) => {
    const curr = watch(k);
    setValue(k, curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="hero-bg min-h-dvh px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Home">
            <BrandLogo />
          </Link>
          <div className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${progress}%`,
              background: "var(--gradient-primary)",
            }}
          />
        </div>

        <div className="glass-strong shadow-soft mt-6 rounded-3xl p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {current.title}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            {/* ── Step 0: Intro ── */}
            {step === 0 && (
              <div className="mt-4 space-y-5">
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Hi 👋 Let's set things up — gently.
                </h1>
                <p className="text-muted-foreground">
                  This takes about a minute. We'll use your answers to build
                  your <b>Digital Twin</b> — a private model that gets you
                  better matches and guidance. You can edit anything later.
                </p>
                <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <Li>Private by default</Li>
                  <Li>Skip anything you want</Li>
                  <Li>22 Indian languages</Li>
                  <Li>Free forever</Li>
                </ul>
              </div>
            )}

            {/* ── Step 1: Personal ── */}
            {step === 1 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Your name">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        className="h-11 rounded-xl"
                        placeholder="Anjali Raj"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </Field>
                <Field label="Age">
                  <Controller
                    name="age"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="age"
                        type="number"
                        className="h-11 rounded-xl"
                        placeholder="18"
                        inputMode="numeric"
                      />
                    )}
                  />
                </Field>
              </div>
            )}

            {/* ── Step 2: Language ── */}
            {step === 2 && (
              <div className="mt-4">
                <Label>Pick the language you think in</Label>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {LANGUAGES.map((l) => (
                    <Chip
                      key={l}
                      selected={watch("language") === l}
                      onClick={() => setValue("language", l)}
                    >
                      {l}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Family ── */}
            {step === 3 && (
              <div className="mt-4 space-y-5">
                <Field label="Are you the first in your family to attend college?">
                  <div className="flex gap-2">
                    <Chip
                      selected={watch("firstGen")}
                      onClick={() => setValue("firstGen", true)}
                    >
                      Yes
                    </Chip>
                    <Chip
                      selected={!watch("firstGen")}
                      onClick={() => setValue("firstGen", false)}
                    >
                      No
                    </Chip>
                  </div>
                </Field>
                <Field label="Annual family income">
                  <div className="flex flex-wrap gap-2">
                    {INCOME_OPTIONS.map(({ key, label }) => (
                      <Chip
                        key={key}
                        selected={watch("income") === key}
                        onClick={() => setValue("income", key)}
                      >
                        {label}
                      </Chip>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {/* ── Step 4: Academic ── */}
            {step === 4 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="College / Institute">
                  <Controller
                    name="college"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="college"
                        className="h-11 rounded-xl"
                        placeholder="e.g. Patna Women's College"
                      />
                    )}
                  />
                </Field>
                <Field label="Branch / Major">
                  <Controller
                    name="branch"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="branch"
                        className="h-11 rounded-xl"
                        placeholder="e.g. Computer Science"
                      />
                    )}
                  />
                </Field>
                <Field label="Current year">
                  <div className="flex flex-wrap gap-2">
                    {YEAR_OPTIONS.map((y) => (
                      <Chip
                        key={y}
                        selected={watch("year") === y}
                        onClick={() => setValue("year", y)}
                      >
                        {y}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field label="CGPA (optional)">
                  <Controller
                    name="cgpa"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="cgpa"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="h-11 rounded-xl"
                        placeholder="e.g. 8.2"
                        inputMode="decimal"
                      />
                    )}
                  />
                </Field>
              </div>
            )}

            {/* ── Step 5: Career ── */}
            {step === 5 && (
              <div className="mt-4">
                <Label>Which careers excite you? (pick any)</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CAREERS.map((c) => (
                    <Chip
                      key={c}
                      selected={watch("careers").includes(c)}
                      onClick={() => toggle("careers", c)}
                    >
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 6: Interests ── */}
            {step === 6 && (
              <div className="mt-4">
                <Label>What lights you up?</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INTERESTS.map((c) => (
                    <Chip
                      key={c}
                      selected={watch("interests").includes(c)}
                      onClick={() => toggle("interests", c)}
                    >
                      {c}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 7: Done ── */}
            {step === 7 && (
              <div className="mt-4 space-y-5 text-center">
                <div
                  className="mx-auto grid size-16 place-items-center rounded-2xl text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Sparkles className="size-7" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Your Digital Twin is ready.
                </h2>
                <p className="mx-auto max-w-md text-muted-foreground">
                  We've created your first dashboard — with personalized
                  scholarships, mentors and a career roadmap waiting.
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-10 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={back}
                disabled={step === 0 || loading}
                className="rounded-full"
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-full px-6 text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : step === STEPS.length - 1 ? (
                  "Enter dashboard"
                ) : (
                  <>
                    Continue <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Chip({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all",
        selected
          ? "border-transparent text-primary-foreground shadow-glow"
          : "border-border bg-background/40 text-foreground hover:bg-accent/40",
      )}
      style={selected ? { background: "var(--gradient-primary)" } : undefined}
    >
      {children}
    </button>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="size-4 text-success" /> {children}
    </li>
  );
}
