import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BrainCircuit,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Compass,
  Clock,
  Zap,
  Target,
  ArrowUpRight,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useEffect, useState, useCallback, useMemo } from "react";
import { TwinAPI } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Twin · Sahaayak AI" }] }),
  component: DigitalTwin,
});

// ─── Types ───────────────────────────────────────────────────────────────────

interface TwinData {
  academic_score: number;
  career_readiness: number;
  financial_stability: number;
  confidence_score: number;
  engagement_score: number;
  risk_score: number;
  success_score: number;
  ai_insights: string[];
  last_updated: string;
}

interface HistoryPoint {
  academic_score: number;
  career_readiness: number;
  success_score: number;
  confidence_score: number;
  risk_score: number;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function scoreColor(score: number): string {
  if (score >= 75) return "var(--success, #22c55e)";
  if (score >= 50) return "var(--primary)";
  if (score >= 30) return "orange";
  return "var(--destructive, #ef4444)";
}

function riskLabel(score: number): { text: string; color: string } {
  if (score <= 25)
    return { text: "Low Risk", color: "var(--success, #22c55e)" };
  if (score <= 50) return { text: "Moderate", color: "orange" };
  return { text: "High Risk", color: "var(--destructive, #ef4444)" };
}

// ─── Main Component ──────────────────────────────────────────────────────────

function DigitalTwin() {
  const { user, student } = useUser();
  const [twin, setTwin] = useState<TwinData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.full_name?.split(" ")[0] || "Student";

  const fetchTwin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [twinRes, historyRes] = await Promise.allSettled([
        TwinAPI.getMe(),
        TwinAPI.getHistory(),
      ]);

      if (twinRes.status === "fulfilled" && twinRes.value.data) {
        setTwin(twinRes.value.data);
      } else {
        setTwin(null);
      }

      if (historyRes.status === "fulfilled" && historyRes.value.data) {
        setHistory(historyRes.value.data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load Digital Twin");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    setError(null);
    try {
      const res = await TwinAPI.recalculate();
      if (res.data) {
        setTwin(res.data);
        toast.success("Digital Twin recalculated successfully!");
        // Refresh history after recalculation
        TwinAPI.getHistory()
          .then((h) => h.data && setHistory(h.data))
          .catch(() => {});
      }
    } catch (err: any) {
      setError(err?.message || "Recalculation failed.");
      toast.error("Recalculation failed. Please try again.");
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    fetchTwin();
  }, [fetchTwin]);

  // ─── Loading ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm">Initializing your Digital Twin...</p>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────────────────────

  if (error && !twin) {
    return (
      <div className="glass-strong shadow-soft flex flex-col items-center gap-4 rounded-3xl p-10 text-center">
        <AlertTriangle className="size-10 text-destructive" />
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={fetchTwin}
          className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <RefreshCw className="size-4" /> Try Again
        </button>
      </div>
    );
  }

  // ─── Empty (onboarding not complete) ─────────────────────────────

  if (!twin) {
    return (
      <div className="glass-strong shadow-soft flex flex-col items-center gap-6 rounded-3xl p-10 text-center">
        <div className="grid size-20 place-items-center rounded-3xl bg-primary/10">
          <BrainCircuit className="size-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">
            {firstName}, your Digital Twin is not ready yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete your onboarding to generate your personalized AI model.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/onboarding"
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            Complete Onboarding
          </Link>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {recalculating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate Now
          </button>
        </div>
      </div>
    );
  }

  // ─── Twin Loaded ─────────────────────────────────────────────────

  const radarData = [
    { subject: "Academic", A: twin.academic_score },
    { subject: "Financial", A: twin.financial_stability },
    { subject: "Career", A: twin.career_readiness },
    { subject: "Confidence", A: twin.confidence_score },
    { subject: "Engagement", A: twin.engagement_score },
  ];

  const risk = riskLabel(twin.risk_score);

  // Chart data from history (or just current snapshot)
  const trendData =
    history.length > 0
      ? history.map((h, i) => ({
          label: h.created_at
            ? new Date(h.created_at).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
              })
            : `#${i + 1}`,
          success: Math.round(h.success_score),
          academic: Math.round(h.academic_score),
          career: Math.round(h.career_readiness),
        }))
      : [
          {
            label: "Now",
            success: Math.round(twin.success_score),
            academic: Math.round(twin.academic_score),
            career: Math.round(twin.career_readiness),
          },
        ];

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div
          aria-hidden
          className="absolute -right-10 -top-10 size-64 rounded-full blur-3xl"
          style={{ background: "var(--gradient-primary)", opacity: 0.15 }}
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <BrainCircuit className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {firstName}'s Digital Twin
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  Real-time analysis of your academic and career trajectory
                </span>
                {twin.last_updated && (
                  <span className="flex items-center gap-1 text-xs">
                    <Clock className="size-3" />
                    Updated {timeAgo(twin.last_updated)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            id="recalculate-twin-btn"
            className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
          >
            {recalculating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {recalculating ? "Recalculating..." : "Recalculate"}
          </button>
        </div>

        {/* KPI strip */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <KpiPill
            icon={<Zap className="size-4" />}
            label="Success Score"
            value={Math.round(twin.success_score)}
            suffix="%"
            color={scoreColor(twin.success_score)}
          />
          <KpiPill
            icon={<TrendingUp className="size-4" />}
            label="Academic"
            value={Math.round(twin.academic_score)}
            suffix="/100"
            color={scoreColor(twin.academic_score)}
          />
          <KpiPill
            icon={<Compass className="size-4" />}
            label="Career"
            value={Math.round(twin.career_readiness)}
            suffix="/100"
            color={scoreColor(twin.career_readiness)}
          />
          <KpiPill
            icon={<HeartPulse className="size-4" />}
            label="Confidence"
            value={Math.round(twin.confidence_score)}
            suffix="%"
            color={scoreColor(twin.confidence_score)}
          />
          <KpiPill
            icon={<Target className="size-4" />}
            label="Risk"
            value={Math.round(twin.risk_score)}
            suffix="%"
            color={risk.color}
            tag={risk.text}
          />
        </div>
      </header>

      {/* ── Row 1: Radar + Trend Chart ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Readiness Map"
          icon={<Compass className="size-4 text-primary" />}
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Student"
                  dataKey="A"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Score Trends"
          icon={<TrendingUp className="size-4 text-primary" />}
          subtitle={
            history.length > 1
              ? `${history.length} snapshots recorded`
              : "Recalculate again to build trend data"
          }
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, bottom: 0, left: -16 }}
              >
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="success"
                  name="Success"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fill="url(#trendFill)"
                />
                <Area
                  type="monotone"
                  dataKey="academic"
                  name="Academic"
                  stroke="oklch(0.65 0.18 160)"
                  strokeWidth={1.5}
                  fill="none"
                  strokeDasharray="5 3"
                />
                <Area
                  type="monotone"
                  dataKey="career"
                  name="Career"
                  stroke="oklch(0.65 0.18 40)"
                  strokeWidth={1.5}
                  fill="none"
                  strokeDasharray="5 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── Row 2: Confidence Gauge + Financial + Success/Risk ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Confidence Meter"
          icon={<HeartPulse className="size-4 text-primary" />}
        >
          <div className="relative flex h-[200px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                startAngle={180}
                endAngle={0}
                data={[{ value: twin.confidence_score }]}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="var(--primary)"
                  background={{ fill: "var(--muted)" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-4xl font-bold">
                {Math.round(twin.confidence_score)}
              </span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Based on your self-assessment: confidence, motivation &
            communication
          </p>
        </Card>

        <Card
          title="Financial Stability"
          icon={
            <ShieldCheck
              className="size-4"
              style={{ color: scoreColor(twin.financial_stability) }}
            />
          }
        >
          <div className="flex h-[200px] flex-col justify-center gap-5">
            <div>
              <div className="mb-2 flex items-end justify-between">
                <span className="text-sm font-medium">Score</span>
                <span
                  className="text-xl font-bold"
                  style={{ color: scoreColor(twin.financial_stability) }}
                >
                  {Math.round(twin.financial_stability)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${twin.financial_stability}%`,
                    background: scoreColor(twin.financial_stability),
                  }}
                />
              </div>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                Based on your family income profile
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                Scholarship eligibility factored in
              </li>
              {student?.college && (
                <li className="flex items-center gap-2">
                  <Sparkles className="size-3 text-primary" />
                  Studying at {student.college}
                </li>
              )}
            </ul>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {twin.financial_stability <= 50 ? (
              <Link to="/schemes" className="text-primary hover:underline">
                Explore government schemes →
              </Link>
            ) : (
              "Your financial standing is stable."
            )}
          </p>
        </Card>

        <Card title="Success & Risk">
          <div className="flex h-[200px] flex-col justify-center space-y-1">
            <ScoreBar
              name="Success Index"
              description="Weighted score across all dimensions"
              value={twin.success_score}
              color={scoreColor(twin.success_score)}
            />
            <ScoreBar
              name="Risk Score"
              description="Dropout / struggle probability"
              value={twin.risk_score}
              color={risk.color}
              tag={risk.text}
            />
            <ScoreBar
              name="Engagement"
              description="Platform activity level"
              value={twin.engagement_score}
              color={scoreColor(twin.engagement_score)}
            />
          </div>
        </Card>
      </div>

      {/* ── Row 3: AI Insights + Quick Actions ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="AI Insights"
          icon={<Sparkles className="size-4 text-primary" />}
          className="lg:col-span-2"
          subtitle={`${twin.ai_insights?.length || 0} personalized recommendations`}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {twin.ai_insights && twin.ai_insights.length > 0 ? (
              twin.ai_insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-background/50 p-4 text-sm leading-relaxed transition-colors hover:bg-background/70"
                >
                  {insight}
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <Sparkles className="size-6 text-primary/40" />
                Recalculate to generate personalized insights.
              </div>
            )}
          </div>
        </Card>

        <Card
          title="Quick Actions"
          icon={<Zap className="size-4 text-primary" />}
        >
          <div className="space-y-2">
            <ActionLink
              to="/ai-mentor"
              label="Ask AI Mentor"
              icon={<Sparkles className="size-4" />}
            />
            <ActionLink
              to="/career-gps"
              label="Open Career GPS"
              icon={<Compass className="size-4" />}
            />
            <ActionLink
              to="/scholarships"
              label="Browse Scholarships"
              icon={<ShieldCheck className="size-4" />}
            />
            <ActionLink
              to="/mentors"
              label="Find a Mentor"
              icon={<HeartPulse className="size-4" />}
            />
            <ActionLink
              to="/settings"
              label="Update Profile"
              icon={<Target className="size-4" />}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({
  title,
  children,
  className,
  icon,
  subtitle,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <section
      className={`glass shadow-soft flex flex-col rounded-3xl p-5 md:p-6 ${className ?? ""}`}
    >
      <header className="mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
        )}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function KpiPill({
  icon,
  label,
  value,
  suffix,
  color,
  tag,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  color: string;
  tag?: string;
}) {
  return (
    <div className="rounded-2xl bg-background/40 p-3.5">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span className="grid size-6 place-items-center rounded-md bg-primary/15 text-primary">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xl font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{suffix}</span>
        {tag && (
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              color,
              background: `color-mix(in oklab, ${color} 15%, transparent)`,
            }}
          >
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreBar({
  name,
  description,
  value,
  color,
  tag,
}: {
  name: string;
  description: string;
  value: number;
  color: string;
  tag?: string;
}) {
  return (
    <div className="rounded-2xl bg-background/40 p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-[11px] text-muted-foreground">{description}</div>
        </div>
        <div className="flex items-center gap-2">
          {tag && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                color,
                background: `color-mix(in oklab, ${color} 15%, transparent)`,
              }}
            >
              {tag}
            </span>
          )}
          <div className="text-sm font-bold" style={{ color }}>
            {Math.round(value)}%
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ActionLink({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl bg-background/40 p-3 text-sm font-medium transition-colors hover:bg-accent/40"
    >
      <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
