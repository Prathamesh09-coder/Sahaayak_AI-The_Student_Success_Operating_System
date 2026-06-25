import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NAV } from "@/lib/nav";
import { BrandLogo } from "./brand";
import { cn } from "@/lib/utils";

const GROUPS: Array<{
  key: NonNullable<(typeof NAV)[number]["group"]>;
  label: string;
}> = [
  { key: "Core", label: "Core" },
  { key: "Discover", label: "Discover" },
  { key: "Growth", label: "Growth" },
  { key: "You", label: "You" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "sticky top-3 z-30 hidden h-[calc(100dvh-1.5rem)] shrink-0 lg:flex",
        "ml-3 flex-col",
        collapsed ? "w-[76px]" : "w-[260px]",
        "transition-[width] duration-300",
      )}
    >
      <div className="glass shadow-soft flex h-full flex-col overflow-hidden rounded-3xl p-3">
        <div
          className={cn(
            "flex items-center gap-2 px-2 pb-3 pt-1",
            collapsed && "justify-center",
          )}
        >
          <BrandLogo collapsed={collapsed} />
        </div>

        <nav className="flex-1 overflow-y-auto pr-1">
          {GROUPS.map((g) => {
            const items = NAV.filter((n) => n.group === g.key);
            return (
              <div key={g.key} className="mt-3 first:mt-0">
                {!collapsed && (
                  <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                    {g.label}
                  </div>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = pathname === item.to;
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          aria-label={item.label}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                            collapsed && "justify-center px-0",
                          )}
                          style={
                            active
                              ? {
                                  background:
                                    "color-mix(in oklab, var(--primary) 18%, transparent)",
                                }
                              : undefined
                          }
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full"
                              style={{ background: "var(--gradient-primary)" }}
                            />
                          )}
                          <Icon
                            className={cn(
                              "size-[18px] shrink-0",
                              active ? "text-primary" : "text-current",
                            )}
                          />
                          {!collapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/40 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/* Mobile bottom-nav with 5 key shortcuts */
export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = NAV.filter((n) =>
    [
      "/dashboard",
      "/digital-twin",
      "/ai-mentor",
      "/career-gps",
      "/scholarships",
    ].includes(n.to),
  );
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
      <div className="glass-strong shadow-soft mx-auto flex max-w-md items-center justify-between rounded-2xl px-2 py-1.5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
              aria-label={it.label}
            >
              <Icon className="size-5" />
              <span className="truncate">{it.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
