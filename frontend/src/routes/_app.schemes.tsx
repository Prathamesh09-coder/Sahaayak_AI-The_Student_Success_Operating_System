import { createFileRoute } from "@tanstack/react-router";
import {
  Landmark,
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Building,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/schemes")({
  head: () => ({ meta: [{ title: "Govt. Schemes · Sahaayak AI" }] }),
  component: Schemes,
});

const SCHEMES = [
  {
    id: 1,
    title: "Post Matric Scholarship for SC Students",
    dept: "Ministry of Social Justice",
    eligible: true,
    type: "Central",
    amount: "Full Tuition + Maintenance",
    deadline: "Dec 31, 2026",
  },
  {
    id: 2,
    title: "Central Sector Scheme of Scholarships",
    dept: "Dept of Higher Education",
    eligible: true,
    type: "Central",
    amount: "₹10,000/year",
    deadline: "Oct 31, 2026",
  },
  {
    id: 3,
    title: "Chief Minister's Higher Education Scholarship",
    dept: "State Government",
    eligible: false,
    type: "State",
    amount: "Variable",
    deadline: "Rolling",
  },
];

function Schemes() {
  return (
    <div className="space-y-4">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8 shrink-0">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Landmark className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Government Schemes
              </h1>
              <p className="text-sm text-muted-foreground">
                Discover state and central financial aid programs.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 rounded-full h-11 bg-background/50 border-border/50"
              placeholder="Search schemes..."
            />
          </div>
          <Button
            variant="outline"
            className="h-11 rounded-full bg-background/50 border-border/50 px-6"
          >
            <Filter className="size-4 mr-2" /> Filters
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SCHEMES.map((s) => (
          <div
            key={s.id}
            className="glass shadow-soft flex flex-col rounded-3xl p-5 hover:border-primary/30 transition-colors opacity-100"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Building className="size-3" /> {s.dept}
              </div>
              {s.eligible ? (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="size-3" /> Eligible
                </div>
              ) : (
                <div className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Not Eligible
                </div>
              )}
            </div>

            <h3 className="font-semibold text-lg mb-2 leading-tight">
              {s.title}
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[10px] bg-background/60 border border-border/50 px-2 py-1 rounded-md text-muted-foreground">
                {s.type} Scheme
              </span>
            </div>

            <div className="mt-auto space-y-2 pt-4 border-t border-border/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Amount
                </span>
                <span className="font-semibold text-right max-w-[150px] truncate">
                  {s.amount}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Deadline
                </span>
                <span className="font-medium text-warning">{s.deadline}</span>
              </div>
            </div>

            <Button
              className={`w-full mt-4 rounded-full shadow-none transition-all group ${s.eligible ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground" : "opacity-50 cursor-not-allowed"}`}
              disabled={!s.eligible}
            >
              View Details{" "}
              <ArrowUpRight className="size-4 ml-1 opacity-50 group-hover:opacity-100" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
