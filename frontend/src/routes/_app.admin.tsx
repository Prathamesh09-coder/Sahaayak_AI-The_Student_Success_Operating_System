import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldAlert,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin Portal · Sahaayak AI" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [featureFlags, setFeatureFlags] = useState<any[]>([
    { name: "VOICE_ASSISTANT", enabled: true, allowed: "STUDENT" },
    { name: "PARENT_MODE", enabled: true, allowed: "PARENT,ADMIN" },
    { name: "PREDICTIVE_ENGINE", enabled: true, allowed: "ADMIN,MENTOR" },
    { name: "COMMUNITY_FORUM", enabled: false, allowed: "STUDENT" },
  ]);

  useEffect(() => {
    // Mock fetch from /api/v1/admin/metrics
    setMetrics({
      total_students: 1250,
      total_mentors: 45,
      active_sessions: 12,
      success_index_avg: 76.5,
      interventions_triggered: 34,
    });
  }, []);

  const toggleFlag = (idx: number) => {
    const newFlags = [...featureFlags];
    newFlags[idx].enabled = !newFlags[idx].enabled;
    setFeatureFlags(newFlags);
  };

  if (!metrics) return <div>Loading Admin Portal...</div>;

  return (
    <div className="space-y-6">
      <header className="glass-strong shadow-soft overflow-hidden rounded-3xl p-6 md:p-8 border border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-destructive text-destructive-foreground">
            <ShieldAlert className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-destructive">
              Platform Administration
            </h1>
            <p className="text-sm text-destructive/80 font-medium">
              Production Control Center - Restricted Access
            </p>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Students"
          value={metrics.total_students}
          icon={<Users />}
        />
        <MetricCard
          title="Total Mentors"
          value={metrics.total_mentors}
          icon={<CheckCircle />}
        />
        <MetricCard
          title="Active Sessions"
          value={metrics.active_sessions}
          icon={<TrendingUp />}
        />
        <MetricCard
          title="Avg Success Score"
          value={metrics.success_index_avg}
          icon={<TrendingUp />}
        />
        <MetricCard
          title="Interventions"
          value={metrics.interventions_triggered}
          icon={<AlertTriangle className="text-warning" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feature Flags */}
        <div className="glass rounded-3xl p-6 shadow-soft">
          <h2 className="font-bold text-xl mb-4 border-b border-border/50 pb-2">
            Feature Flags
          </h2>
          <div className="space-y-3">
            {featureFlags.map((flag, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-2xl"
              >
                <div>
                  <p className="font-bold">{flag.name}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
                    Allowed: {flag.allowed}
                  </p>
                </div>
                <button
                  onClick={() => toggleFlag(idx)}
                  className={`p-2 rounded-xl transition-colors ${flag.enabled ? "text-success bg-success/10" : "text-muted-foreground bg-muted/20"}`}
                >
                  {flag.enabled ? (
                    <ToggleRight className="size-8" />
                  ) : (
                    <ToggleLeft className="size-8" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Management & Auditing */}
        <div className="glass rounded-3xl p-6 shadow-soft flex flex-col gap-4">
          <h2 className="font-bold text-xl border-b border-border/50 pb-2">
            User Management
          </h2>

          <div className="flex-1 bg-background border border-border/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Users className="size-10 text-muted-foreground mb-2" />
            <p className="font-bold">Pending Mentor Approvals (0)</p>
            <p className="text-sm text-muted-foreground">
              All mentors have been verified.
            </p>
          </div>

          <div className="flex-1 bg-background border border-border/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <ShieldAlert className="size-10 text-muted-foreground mb-2" />
            <p className="font-bold">Audit Logs</p>
            <p className="text-sm text-muted-foreground">
              View system-wide security actions.
            </p>
            <button className="mt-3 px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl text-sm">
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: any) {
  return (
    <div className="glass rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
      <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center mb-2">
        {icon}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <span className="text-xs text-muted-foreground font-semibold mt-1">
        {title}
      </span>
    </div>
  );
}
