import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Compass,
  GraduationCap,
  FileText,
  Users,
  Gauge,
  Mic,
  HeartHandshake,
  Rocket,
  Network,
  Play,
  CheckCircle2,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/app/brand";
import { ThemeToggle } from "@/components/app/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Sahaayak AI — Your AI Companion for Academic & Career Success",
      },
      {
        name: "description",
        content:
          "Ensuring no first-generation student is left behind. Personalized AI mentorship, scholarships, career roadmaps and opportunities — built for students from every background.",
      },
      {
        property: "og:title",
        content: "Sahaayak AI — Student Success Ecosystem",
      },
      {
        property: "og:description",
        content:
          "AI mentorship, scholarships, careers and opportunities for first-generation learners.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Mentor",
    body: "Always-on guidance in your language, from doubts to decisions.",
  },
  {
    icon: Network,
    title: "Student Digital Twin",
    body: "A living profile that learns who you are and what you need.",
  },
  {
    icon: Compass,
    title: "Career GPS",
    body: "Step-by-step roadmaps from where you are to where you dream.",
  },
  {
    icon: Rocket,
    title: "Opportunity Copilot",
    body: "Internships, fellowships and contests, ranked for you.",
  },
  {
    icon: GraduationCap,
    title: "Scholarships",
    body: "Discover, qualify and apply — without missing deadlines.",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    body: "ATS score, gaps and rewrites — in seconds.",
  },
  {
    icon: Gauge,
    title: "Success Index",
    body: "A holistic signal of your academic, career and wellness journey.",
  },
  {
    icon: Mic,
    title: "Voice AI",
    body: "Speak in Hindi, Tamil, Bengali, Marathi — and 18 more.",
  },
  {
    icon: HeartHandshake,
    title: "Parent Assistant",
    body: "Helps families understand placements, degrees and aid.",
  },
];

const STATS = [
  { value: "1.2 Cr+", label: "First-gen learners in India" },
  { value: "73%", label: "Lack structured career guidance" },
  { value: "₹8,000 Cr", label: "Of scholarships go unclaimed yearly" },
  { value: "4.3×", label: "Higher confidence with a mentor" },
];

const STEPS = [
  {
    n: "01",
    t: "Create your profile",
    b: "Tell us your story — academics, family, dreams.",
  },
  {
    n: "02",
    t: "We build your Digital Twin",
    b: "An evolving model of your strengths and gaps.",
  },
  {
    n: "03",
    t: "Receive personalized guidance",
    b: "Mentorship, scholarships and roadmaps — for you.",
  },
  {
    n: "04",
    t: "Track your success journey",
    b: "Watch your Success Index grow week by week.",
  },
];

const TESTIMONIALS = [
  {
    name: "Anjali R.",
    where: "B.Sc · Patna",
    quote:
      "I'm the first in my family to go to college. Sahaayak helped me find ₹60,000 in scholarships I never knew existed.",
  },
  {
    name: "Vignesh K.",
    where: "B.Tech · Coimbatore",
    quote:
      "The Career GPS made the data-science path feel possible. Three internships later, I know it is.",
  },
  {
    name: "Pooja S.",
    where: "B.A · Bhopal",
    quote:
      "My parents finally understand my career — Sahaayak explained it to them in Hindi, with voice. That mattered.",
  },
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Nav */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <BrandLogo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#impact" className="hover:text-foreground">
              Impact
            </a>
            <a href="#stories" className="hover:text-foreground">
              Stories
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full text-primary-foreground shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Link to="/sign-up">
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <GridBackdrop />
        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <span className="size-1.5 rounded-full bg-success" />
                Built for first-generation college students
              </div>
              <h1 className="mt-5 text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Your AI companion for{" "}
                <span className="gradient-text">academic and career</span>{" "}
                success.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Personalized guidance, scholarships, mentorship and
                opportunities for every first-generation learner — in the
                language you think in.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-7 text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Link to="/sign-up">
                    Get started free <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 backdrop-blur"
                >
                  <a href="#how">
                    <Play className="size-4" /> Watch the demo
                  </a>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" /> Free for
                  students
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" /> 22 Indian
                  languages
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" />{" "}
                  Privacy-first
                </div>
              </div>
            </div>

            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-border/60 bg-surface/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-12 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="gradient-text text-3xl font-bold md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            The ecosystem
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Everything you need to thrive, in one calm place.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sahaayak weaves together mentorship, money, opportunities and
            wellbeing — and adapts as you grow.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="glass shadow-soft group relative overflow-hidden rounded-3xl p-6 transition-transform hover:-translate-y-0.5"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(400px circle at var(--x,50%) var(--y,0%), color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%)",
                  }}
                />
                <div
                  className="grid size-11 place-items-center rounded-2xl text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How */}
      <section id="how" className="relative bg-surface/40 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              From confused to confident in four steps.
            </h2>
          </div>

          <ol className="relative mt-14 grid gap-6 md:grid-cols-4">
            <div
              aria-hidden
              className="absolute left-6 right-6 top-7 hidden h-px md:block"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--primary), transparent)",
              }}
            />
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="glass shadow-soft relative rounded-3xl p-6"
              >
                <div
                  className="grid size-12 place-items-center rounded-2xl text-sm font-bold text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {s.n}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.b}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Stories */}
      <section id="stories" className="mx-auto max-w-7xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Stories
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Real students. Real first steps.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="glass shadow-soft rounded-3xl p-7">
              <Quote className="size-6 text-primary" />
              <blockquote className="mt-4 text-base leading-relaxed text-foreground/90">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div
                  className="grid size-10 place-items-center rounded-full text-sm font-bold text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.where}</div>
                </div>
                <div className="ml-auto flex text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section
        id="impact"
        className="border-y border-border/60 bg-surface/40 py-20"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 md:grid-cols-4">
          {[
            { v: "120k+", l: "Students supported" },
            { v: "₹14 Cr", l: "Scholarships won" },
            { v: "38k", l: "Opportunities matched" },
            { v: "9.2k", l: "Mentors connected" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="gradient-text text-4xl font-bold md:text-5xl">
                {s.v}
              </div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-24">
        <div className="hero-bg relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border p-12 text-center shadow-soft md:p-16">
          <Sparkles className="mx-auto size-8 text-primary" />
          <h2 className="mt-5 text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Your first college step shouldn't be the hardest.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join Sahaayak — and never figure it out alone again.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full px-7 text-primary-foreground shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Link to="/sign-up">
                Create my free account <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-6 backdrop-blur"
            >
              <Link to="/dashboard">Explore the platform</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground md:flex-row">
          <BrandLogo />
          <div>
            Ensuring no first-generation student is left behind. ©{" "}
            {new Date().getFullYear()} Sahaayak AI.
          </div>
        </div>
      </footer>
    </div>
  );
}

function GridBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent 70%)",
        }}
      />
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative isolate mx-auto aspect-[1/1] w-full max-w-lg">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute inset-8 rounded-full blur-3xl"
        style={{ background: "var(--gradient-primary)", opacity: 0.35 }}
      />
      {/* Central orb */}
      <div
        className="absolute inset-12 grid place-items-center rounded-full border border-border shadow-glow"
        style={{
          background:
            "conic-gradient(from 120deg, color-mix(in oklab, var(--primary) 40%, var(--surface)), color-mix(in oklab, var(--accent) 30%, var(--surface)), color-mix(in oklab, var(--secondary) 35%, var(--surface)), color-mix(in oklab, var(--primary) 40%, var(--surface)))",
        }}
      >
        <div className="glass-strong grid size-28 place-items-center rounded-full">
          <Sparkles className="size-10 text-primary" />
        </div>
      </div>

      {/* Floating cards */}
      <FloatingCard
        className="left-[-2%] top-[10%] animate-float"
        icon={<GraduationCap className="size-4 text-success" />}
        title="Scholarship found"
        body="INSPIRE · ₹80,000"
      />
      <FloatingCard
        className="right-[-4%] top-[28%] animate-float"
        style={{ animationDelay: "1.2s" }}
        icon={<Users className="size-4 text-accent" />}
        title="Mentor connected"
        body="Priya · Data Scientist"
      />
      <FloatingCard
        className="bottom-[6%] left-[8%] animate-float"
        style={{ animationDelay: "2.4s" }}
        icon={<Compass className="size-4 text-primary" />}
        title="Career roadmap"
        body="6 milestones generated"
      />
    </div>
  );
}

function FloatingCard({
  className,
  style,
  icon,
  title,
  body,
}: {
  className?: string;
  style?: React.CSSProperties;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className={`glass-strong shadow-soft absolute flex w-[210px] items-center gap-3 rounded-2xl p-3 ${className ?? ""}`}
      style={style}
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-background/60">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
