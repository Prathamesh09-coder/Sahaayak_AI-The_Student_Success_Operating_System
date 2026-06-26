import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Activity,
  BookOpen,
  Briefcase,
  Heart,
  TrendingUp,
  Users,
  Trophy,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  DollarSign,
  ShieldAlert,
  Clock,
} from "lucide-react";

// @ts-expect-error: react-calendar-heatmap does not publish TypeScript types
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import CountUp from "react-countup";

const SafeCalendarHeatmap = (CalendarHeatmap as any).default || CalendarHeatmap;
const SafeCountUp = (CountUp as any).default || CountUp;

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SuccessAPI } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export const Route = createFileRoute("/_app/success-navigator")({
  head: () => ({ meta: [{ title: "Success Navigator · Sahaayak AI" }] }),
  component: SuccessNavigator,
});

function SuccessNavigator() {
  const queryClient = useQueryClient();
  const { user, student, isLoading: userLoading } = useUser();
  const [trendFilter, setTrendFilter] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");

  // Resolve student ID
  const studentId = student?.id || user?.id || "";

  // 1. Success Index Query
  const {
    data: indexRes,
    isLoading: indexLoading,
    error: indexError,
  } = useQuery({
    queryKey: ["successIndex", studentId],
    queryFn: () => SuccessAPI.getMe(studentId),
    enabled: !!studentId,
  });

  // 2. Success History Query
  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ["successHistory", studentId],
    queryFn: () => SuccessAPI.getHistory(studentId),
    enabled: !!studentId,
  });

  // 3. Success Trends Query
  const { data: trendsRes, isLoading: trendsLoading } = useQuery({
    queryKey: ["successTrends", studentId],
    queryFn: () => SuccessAPI.getTrends(studentId),
    enabled: !!studentId,
  });

  // 4. Recommendations Query
  const { data: recommendationsRes, isLoading: recommendationsLoading } =
    useQuery({
      queryKey: ["successRecommendations", studentId],
      queryFn: () => SuccessAPI.getRecommendations(studentId),
      enabled: !!studentId,
    });

  // 5. Predictions Query
  const { data: predictionsRes, isLoading: predictionsLoading } = useQuery({
    queryKey: ["successPredictions", studentId],
    queryFn: () => SuccessAPI.getPredictions(studentId),
    enabled: !!studentId,
  });

  // 6. Forecast Query
  const { data: forecastRes, isLoading: forecastLoading } = useQuery({
    queryKey: ["successForecast", studentId],
    queryFn: () => SuccessAPI.getForecast(studentId),
    enabled: !!studentId,
  });

  // 7. Explanations Query
  const { data: explanationsRes, isLoading: explanationsLoading } = useQuery({
    queryKey: ["successExplanations", studentId],
    queryFn: () => SuccessAPI.getExplanations(studentId),
    enabled: !!studentId,
  });

  // 8. Engagement Heatmap Query
  const { data: engagementRes, isLoading: engagementLoading } = useQuery({
    queryKey: ["successEngagement", studentId],
    queryFn: () => SuccessAPI.getAnalyticsEngagement(studentId),
    enabled: !!studentId,
  });

  // 9. Interventions Query
  const { data: interventionsRes, isLoading: interventionsLoading } = useQuery({
    queryKey: ["successInterventions", studentId],
    queryFn: () => SuccessAPI.getInterventions(studentId),
    enabled: !!studentId,
  });

  // Set up WebSockets for real-time success invalidations
  useEffect(() => {
    if (!studentId) return;

    const wsUrl = `ws://localhost:8000/api/v1/success/ws/success/${studentId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("[WebSocket] Connected to Success Index updates.");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WebSocket] Success event received:", data);

        if (data.event) {
          // Invalidate cache to trigger instant updates
          queryClient.invalidateQueries({
            queryKey: ["successIndex", studentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["successHistory", studentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["successTrends", studentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["successRecommendations", studentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["successPredictions", studentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["successForecast", studentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["successExplanations", studentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["successEngagement", studentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["successInterventions", studentId],
          });

          if (data.event === "success.index_updated") {
            toast.info(
              `Success index re-calculated: ${data.payload.overall_score}%!`,
            );
          } else if (data.event === "prediction.generated") {
            toast.success("AI predictive risk analysis updated.");
          } else if (data.event === "forecast.updated") {
            toast.success("Future success projections updated.");
          }
        }
      } catch (err) {
        console.error(
          "[WebSocket] Failed to parse success event message:",
          err,
        );
      }
    };

    return () => {
      socket.close();
    };
  }, [studentId, queryClient]);

  // Extract Payloads
  const index = indexRes?.data || {
    overall_score: 75.0,
    academic_score: 80.0,
    career_score: 70.0,
    engagement_score: 75.0,
    financial_score: 85.0,
    social_capital_score: 60.0,
    wellness_score: 75.0,
    level: "Good",
    last_updated: new Date().toISOString(),
  };

  const history = historyRes?.data || [];
  const trends = trendsRes?.data || {
    weekly: { success_trend: [] },
    monthly: { success_trend: [] },
    yearly: { success_trend: [] },
  };
  const recommendations = recommendationsRes?.data || [];
  const predictions = predictionsRes?.data || {
    dropout_risk: 15,
    placement_probability: 75,
    financial_risk: 20,
    burnout_risk: 25,
    scholarship_probability: 80,
  };
  const forecast = forecastRes?.data || {
    "30_days": 80,
    "90_days": 85,
    "180_days": 90,
  };
  const explanations = explanationsRes?.data || [];
  const engagement = engagementRes?.data || [];
  const interventions = interventionsRes?.data || [];

  // Parse LineChart trends data based on filters
  const lineChartData = history.map((h: any) => ({
    name: h.date.substring(5), // MM-DD
    Score: h.score,
  }));

  // Parse AreaChart forecast data
  const forecastChartData = [
    { name: "Today", Projection: index.overall_score },
    { name: "+30 Days", Projection: forecast["30_days"] },
    { name: "+90 Days", Projection: forecast["90_days"] },
    { name: "+180 Days", Projection: forecast["180_days"] },
  ];

  // Loading States Shimmer
  if (userLoading || indexLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="h-28 bg-card/50 rounded-3xl w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 bg-card/50 rounded-3xl lg:col-span-1" />
          <div className="h-96 bg-card/50 rounded-3xl lg:col-span-2" />
        </div>
        <div className="h-60 bg-card/50 rounded-3xl w-full" />
      </div>
    );
  }

  // Error States
  if (indexError) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-center p-8 glass-strong rounded-3xl border border-border/50 max-w-md shadow-2xl">
          <div className="size-16 bg-destructive/10 text-destructive rounded-2xl grid place-items-center mx-auto mb-4 shadow-glow">
            <AlertTriangle className="size-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            Unable to load Success Navigator
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            There was a problem connecting to the student intelligence database.
          </p>
          <Button
            onClick={() => queryClient.invalidateQueries()}
            className="rounded-full shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            <RotateCcw className="size-4 mr-2" /> Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  // Format date helper
  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Premium Header */}
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8 border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-emerald-500/5 pointer-events-none" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-glow">
              <Activity className="size-8" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-primary">
                Student Intelligence Center
              </p>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl mt-0.5">
                Success Navigator
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your continuous educational health report and predictive success
                analytics.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 bg-background/40 backdrop-blur-md border border-border/40 rounded-2xl p-3">
            <span className="text-xs text-muted-foreground block flex items-center gap-1">
              <Clock className="size-3" /> Last Synced
            </span>
            <span className="text-xs font-bold text-foreground">
              {formatDate(index.last_updated)}
            </span>
          </div>
        </div>
      </header>

      {/* Critical Intervention Alerts Panel (Active warnings) */}
      {interventions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
            <ShieldAlert className="size-4 animate-bounce" /> Active
            Intervention Actions Required
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {interventions.map((item: any, i: number) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item.id}
                className="p-4 rounded-2xl border bg-destructive/5 border-destructive/20 shadow-glow flex gap-3"
              >
                <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full uppercase">
                      {item.type}
                    </span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">
                      Severity: {item.severity}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground mt-2">
                    {item.reason}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Action: {item.recommended_action}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Main Success Index Card and Component Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Success Index Card (Gauge) */}
        <Card
          title="Success Index Score"
          className="lg:col-span-1 flex flex-col items-center justify-center text-center"
        >
          <div className="w-full max-w-[240px] mt-2 relative">
            <svg viewBox="0 0 100 50" className="w-full h-auto drop-shadow-md">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 * (1 - index.overall_score / 100)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
          <div className="text-5xl font-black text-primary mt-2 flex items-baseline justify-center">
            <SafeCountUp
              end={index.overall_score}
              decimals={1}
              duration={1.5}
            />
            <span className="text-2xl font-bold ml-0.5">%</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="font-extrabold text-lg text-emerald-400">
              {index.level} Standing
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-[240px] mx-auto">
            Overall educational health computed dynamically across six
            intelligence metrics.
          </p>
        </Card>

        {/* 6 Component Breakdown Cards */}
        <Card title="Component Breakdown" className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-full items-center">
            <ComponentScoreCard
              icon={<BookOpen className="size-5" />}
              label="Academic Readiness"
              score={index.academic_score}
              weight="20%"
              trend="+4.2%"
              status="Improving"
              color="text-blue-400"
            />
            <ComponentScoreCard
              icon={<Briefcase className="size-5" />}
              label="Career Preparedness"
              score={index.career_score}
              weight="25%"
              trend="+8.5%"
              status="Improving"
              color="text-purple-400"
            />
            <ComponentScoreCard
              icon={<TrendingUp className="size-5" />}
              label="Engagement Index"
              score={index.engagement_score}
              weight="15%"
              trend="+1.2%"
              status="Steady"
              color="text-emerald-400"
            />
            <ComponentScoreCard
              icon={<DollarSign className="size-5" />}
              label="Financial Stability"
              score={index.financial_score}
              weight="15%"
              trend="0%"
              status="Steady"
              color="text-amber-400"
            />
            <ComponentScoreCard
              icon={<Users className="size-5" />}
              label="Social Capital"
              score={index.social_capital_score}
              weight="15%"
              trend="+6.1%"
              status="Improving"
              color="text-pink-400"
            />
            <ComponentScoreCard
              icon={<Heart className="size-5" />}
              label="Mental Wellness"
              score={index.wellness_score}
              weight="10%"
              trend="-2.1%"
              status="Declining"
              color="text-red-400"
            />
          </div>
        </Card>
      </div>

      {/* Historical Trend Analytics and Engagement Heatmap */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Chart */}
        <Card
          title="Success Index Progression"
          className="lg:col-span-2 min-h-[360px]"
          headerAction={
            <div className="flex bg-background/50 rounded-full p-1 border border-border">
              {(["weekly", "monthly", "yearly"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTrendFilter(filter)}
                  className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-bold transition-all ${
                    trendFilter === filter
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          }
        >
          <div className="w-full h-64 mt-4">
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    style={{ fontSize: "10px" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    domain={[40, 100]}
                    style={{ fontSize: "10px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0b0f19",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: "#6366f1", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">
                No historical records found.
              </div>
            )}
          </div>
        </Card>

        {/* Calendar Heatmap */}
        <Card
          title="Engagement Heatmap"
          className="lg:col-span-1 min-h-[360px]"
        >
          <div className="mt-4 flex flex-col justify-between h-full pb-4">
            <span className="text-xs text-muted-foreground mb-4 block">
              Continuous student action log intensity mapping (logins, chats,
              roadmap completions).
            </span>
            <div className="calendar-heatmap-container pr-2">
              <SafeCalendarHeatmap
                startDate={
                  new Date(new Date().setDate(new Date().getDate() - 60))
                }
                endDate={new Date()}
                values={engagement}
                classForValue={(value: any) => {
                  if (!value || value.count === 0) return "color-empty";
                  return `color-github-${Math.min(4, Math.ceil(value.count / 2))}`;
                }}
                tooltipDataAttrs={(value: any) => {
                  return {
                    "data-tip": `${value.date}: ${value.count || 0} activities`,
                  };
                }}
              />
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-4 justify-end">
              <span>Less</span>
              <span className="size-2.5 bg-muted rounded-sm" />
              <span className="size-2.5 bg-primary/20 rounded-sm" />
              <span className="size-2.5 bg-primary/40 rounded-sm" />
              <span className="size-2.5 bg-primary/70 rounded-sm" />
              <span className="size-2.5 bg-primary rounded-sm" />
              <span>More</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Predictive Intelligence and Success Forecast Projections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 5 Risk Indicators */}
        <Card title="Predictive Intelligence Engine" className="lg:col-span-1">
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
              AI Future Readiness Predictions
            </h4>

            <PredictiveProgressCard
              title="Placement Probability"
              value={predictions.placement_probability}
              isSuccessChance={true}
              action="Mock Interviews"
            />
            <PredictiveProgressCard
              title="Scholarship Probability"
              value={predictions.scholarship_probability}
              isSuccessChance={true}
              action="Submit applications"
            />
            <PredictiveProgressCard
              title="Dropout Risk"
              value={predictions.dropout_risk}
              isSuccessChance={false}
              action="Mentor review"
            />
            <PredictiveProgressCard
              title="Burnout Risk"
              value={predictions.burnout_risk}
              isSuccessChance={false}
              action="Study breaks"
            />
            <PredictiveProgressCard
              title="Financial Risk"
              value={predictions.financial_risk}
              isSuccessChance={false}
              action="Apply waivers"
            />
          </div>
        </Card>

        {/* Success Forecast Projections */}
        <Card title="Future Success Forecast" className="lg:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                Success Index Area Projections
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calculated based on your progress slope velocity.
              </p>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-glow">
              Positive progression trajectory
            </div>
          </div>

          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={forecastChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorProjection"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  style={{ fontSize: "10px" }}
                />
                <YAxis
                  stroke="#64748b"
                  domain={[40, 100]}
                  style={{ fontSize: "10px" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0b0f19",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="Projection"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProjection)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Explainability and AI Recommendation Panels */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Explainability: Why did my score change? */}
        <Card
          title="Why Did My Score Change? (Explainability)"
          icon={<AlertTriangle className="size-4 text-primary" />}
        >
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {explanations.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 bg-background/30 rounded-2xl border border-border/40 hover:border-border transition-all"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-foreground">
                    {item.factor}
                  </span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                      item.impact === "High"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    }`}
                  >
                    {item.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  {item.reason}
                </p>
                <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-primary">
                  <Zap className="size-3" />
                  <span>Action: {item.action}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Recommendations Panel */}
        <Card
          title="AI Success Optimization Plan"
          icon={<Sparkles className="size-4 text-primary" />}
        >
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-background/30 border border-border/40 hover:border-border transition-all gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        rec.priority === "HIGH"
                          ? "bg-red-500/15 text-red-400 border-red-500/20 shadow-glow"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm mt-2 text-foreground truncate">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">
                    {rec.reason}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-8 rounded-full text-xs shadow-glow hover:scale-105 active:scale-95 transition-all"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Action <ChevronRight className="size-3.5 ml-0.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Internal Heatmap styling */}
      <style>{`
        .react-calendar-heatmap .color-empty { fill: rgba(30, 41, 59, 0.4); }
        .react-calendar-heatmap .color-github-1 { fill: rgba(99, 102, 241, 0.2); }
        .react-calendar-heatmap .color-github-2 { fill: rgba(99, 102, 241, 0.4); }
        .react-calendar-heatmap .color-github-3 { fill: rgba(99, 102, 241, 0.7); }
        .react-calendar-heatmap .color-github-4 { fill: rgba(99, 102, 241, 1); }
        .react-calendar-heatmap rect { rx: 2px; ry: 2px; }
      `}</style>
    </div>
  );
}

function ComponentScoreCard({
  icon,
  label,
  score,
  weight,
  trend,
  status,
  color,
}: any) {
  return (
    <div className="bg-background/20 rounded-2xl p-4 border border-border/40 hover:border-border transition-all flex flex-col items-center text-center">
      <div
        className={`size-10 rounded-full bg-primary/10 ${color} grid place-items-center mb-2 shadow-glow`}
      >
        {icon}
      </div>
      <span className="text-xs font-bold text-foreground mb-1 leading-snug min-h-[32px] flex items-center justify-center">
        {label}
      </span>
      <div className="text-2xl font-black text-foreground mt-1">
        {typeof score === "number" ? Math.round(score * 10) / 10 : score}%
      </div>
      <div className="flex items-center gap-1 mt-2 text-[9px] font-semibold text-muted-foreground uppercase">
        <span className="text-emerald-400">{trend}</span>
        <span className="size-1 w-1 rounded-full bg-muted-foreground" />
        <span>{status}</span>
      </div>
      <span className="text-[8px] text-muted-foreground uppercase font-black mt-2 tracking-wider">
        Weight: {weight}
      </span>
    </div>
  );
}

function PredictiveProgressCard({
  title,
  value,
  isSuccessChance,
  action,
}: {
  title: string;
  value: number;
  isSuccessChance: boolean;
  action: string;
}) {
  // Set logical coloring based on threshold and whether it's a risk or a success chance
  let color = "text-emerald-400";
  let barBg = "bg-emerald-500";

  if (isSuccessChance) {
    // 0-30: Red, 31-60: Yellow, 61-100: Green
    if (value < 30) {
      color = "text-red-400";
      barBg = "bg-red-500";
    } else if (value < 60) {
      color = "text-yellow-400";
      barBg = "bg-yellow-500";
    }
  } else {
    // 0-30: Green, 31-60: Yellow, 61-100: Red
    if (value > 60) {
      color = "text-red-400";
      barBg = "bg-red-500";
    } else if (value > 30) {
      color = "text-yellow-400";
      barBg = "bg-yellow-500";
    }
  }

  return (
    <div className="p-3 bg-background/30 rounded-2xl border border-border/40 hover:border-border transition-all">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-semibold text-xs text-foreground">{title}</span>
        <span className={`text-xs font-black ${color}`}>
          {typeof value === "number" ? Math.round(value * 10) / 10 : value}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barBg}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[9px] text-muted-foreground">
        <Zap className="size-3 shrink-0" />
        <span className="truncate">AI Action: {action}</span>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  className,
  icon,
  headerAction,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  return (
    <section
      className={`glass shadow-soft flex flex-col rounded-3xl p-5 md:p-6 border border-border/30 relative overflow-hidden ${className ?? ""}`}
    >
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon || <Layers className="size-4 text-primary" />}
          <h3 className="text-sm font-bold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        {headerAction}
      </header>
      <div className="flex-1 flex flex-col">{children}</div>
    </section>
  );
}
