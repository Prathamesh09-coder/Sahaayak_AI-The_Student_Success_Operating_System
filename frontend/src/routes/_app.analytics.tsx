import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
// @ts-expect-error: react-calendar-heatmap does not publish TypeScript types
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Sahaayak AI" }] }),
  component: AnalyticsDashboard,
});

function AnalyticsDashboard() {
  const [trends, setTrends] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);

  useEffect(() => {
    // Mock fetch from /api/v1/analytics/trends
    setTrends([
      { name: "Week 1", success: 65, roadmap: 10 },
      { name: "Week 2", success: 68, roadmap: 15 },
      { name: "Week 3", success: 70, roadmap: 20 },
      { name: "Week 4", success: 72, roadmap: 25 },
    ]);

    // Mock heatmap
    const today = new Date();
    setHeatmap([
      { date: "2026-06-01", count: 2 },
      { date: "2026-06-02", count: 5 },
      { date: "2026-06-04", count: 8 },
      { date: today.toISOString().split("T")[0], count: 3 },
    ]);
  }, []);

  if (!trends) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <header className="glass-strong shadow-soft overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Activity className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Longitudinal Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your educational velocity over time.
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6 shadow-soft">
          <h2 className="font-semibold text-lg mb-6">
            Success Score Trend (Weekly)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="success"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSuccess)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-soft">
          <h2 className="font-semibold text-lg mb-6">
            Roadmap Completion Trend
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="roadmap"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-soft overflow-x-auto">
        <h2 className="font-semibold text-lg mb-6">Activity Heatmap</h2>
        <div className="min-w-[700px] text-xs">
          <CalendarHeatmap
            startDate={new Date("2026-01-01")}
            endDate={new Date("2026-12-31")}
            values={heatmap}
            classForValue={(value: any) => {
              if (!value || value.count === 0) return "fill-muted/30";
              if (value.count < 3) return "fill-primary/40";
              if (value.count < 6) return "fill-primary/70";
              return "fill-primary";
            }}
          />
        </div>
      </div>
    </div>
  );
}
