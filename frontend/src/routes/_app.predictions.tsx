import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BrainCircuit,
  LineChart as LineChartIcon,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/predictions")({
  head: () => ({ meta: [{ title: "Predictive Insights · Sahaayak AI" }] }),
  component: PredictionsDashboard,
});

function PredictionsDashboard() {
  const [predictions, setPredictions] = useState<any>(null);

  useEffect(() => {
    // Mock fetches for /api/v1/predictions/me and /api/v1/predictions/forecast
    setPredictions({
      risks: [
        {
          type: "Career Risk",
          risk_level: "MEDIUM",
          prediction: "May face difficulties in upcoming placement season.",
          explanation:
            "Career readiness dropped because roadmap completion decreased by 12%.",
          recommended_action: "Complete two roadmap milestones this week.",
        },
      ],
      placement_probability: 81,
      forecast: [
        { name: "Today", score: 72 },
        { name: "30 Days", score: 74 },
        { name: "90 Days", score: 78 },
        { name: "180 Days", score: 84 },
      ],
    });
  }, []);

  if (!predictions) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <header className="glass-strong shadow-soft overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-primary/10 via-background to-transparent">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <BrainCircuit className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Predictive Intelligence Engine
            </h1>
            <p className="text-sm text-muted-foreground">
              Forecasting your success through explainable AI.
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Placement Probability */}
        <div className="glass rounded-3xl p-6 lg:col-span-1 shadow-soft flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-2xl bg-success/10 text-success grid place-items-center mb-4">
            <Target className="size-8" />
          </div>
          <h2 className="font-semibold text-lg mb-2">Placement Probability</h2>
          <div className="text-6xl font-extrabold text-foreground mb-4">
            {predictions.placement_probability}%
          </div>
          <div className="text-sm bg-primary/5 p-3 rounded-xl border border-primary/10 text-primary/80">
            <span className="font-bold block mb-1">
              Explainability Insight:
            </span>
            High probability primarily due to Mentor Session attendance and
            Project completion.
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="glass rounded-3xl p-6 lg:col-span-2 shadow-soft">
          <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <LineChartIcon className="size-5 text-primary" /> Success Score
            Forecast (180 Days)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions.forecast}>
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
                  domain={["dataMin - 10", "dataMax + 10"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risks */}
      <h2 className="font-bold text-xl pt-4">
        Identified Risks & Recommendations
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {predictions.risks.map((risk: any, idx: number) => (
          <div
            key={idx}
            className="glass rounded-3xl p-6 border-l-4 border-l-warning shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-warning font-bold">
                <AlertTriangle className="size-5" /> {risk.type}
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-warning/20 text-warning">
                {risk.risk_level} RISK
              </span>
            </div>
            <p className="text-sm font-medium mb-3">{risk.prediction}</p>

            <div className="space-y-3 pt-3 border-t border-border/50">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                  Why?
                </p>
                <p className="text-xs text-foreground/80">{risk.explanation}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                  Action
                </p>
                <p className="text-sm font-semibold text-primary">
                  {risk.recommended_action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
