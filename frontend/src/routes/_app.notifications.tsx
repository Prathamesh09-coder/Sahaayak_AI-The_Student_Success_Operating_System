import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  MessageSquare,
  Check,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Sahaayak AI" }] }),
  component: Notifications,
});

const NOTIFICATIONS = [
  {
    id: 1,
    type: "risk",
    icon: <ShieldAlert className="size-4" />,
    title: "Low Attendance Alert",
    desc: "You have missed 3 classes in Math II.",
    time: "2 hours ago",
    unread: true,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    id: 2,
    type: "scholarship",
    icon: <GraduationCap className="size-4" />,
    title: "Scholarship Deadline",
    desc: "INSPIRE Scholarship application closes in 3 days.",
    time: "5 hours ago",
    unread: true,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    id: 3,
    type: "ai",
    icon: <Sparkles className="size-4" />,
    title: "New AI Recommendation",
    desc: "I found a new internship matching your Digital Twin profile.",
    time: "Yesterday",
    unread: false,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: 4,
    type: "mentor",
    icon: <MessageSquare className="size-4" />,
    title: "Message from Priya Menon",
    desc: "Yes, we can schedule a mock interview this weekend.",
    time: "Yesterday",
    unread: false,
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

function Notifications() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8 shrink-0">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Bell className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground">
                Stay updated on your journey.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-background/50 border-border/50"
            >
              <Filter className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full bg-background/50 border-border/50"
            >
              <Check className="size-4 mr-2" /> Mark all read
            </Button>
          </div>
        </div>
      </header>

      <div className="glass shadow-soft rounded-3xl p-2">
        <div className="divide-y divide-border/50">
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={`flex gap-4 p-4 hover:bg-background/40 transition-colors rounded-2xl ${n.unread ? "bg-background/20" : ""}`}
            >
              <div
                className={`grid size-10 shrink-0 place-items-center rounded-full ${n.bg} ${n.color}`}
              >
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4
                    className={`text-sm ${n.unread ? "font-bold" : "font-semibold"}`}
                  >
                    {n.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {n.time}
                  </span>
                </div>
                <p
                  className={`text-sm ${n.unread ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {n.desc}
                </p>
              </div>
              {n.unread && (
                <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
