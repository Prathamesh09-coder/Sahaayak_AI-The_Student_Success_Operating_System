import {
  Bell,
  Globe,
  Mic,
  Plus,
  Search,
  Sparkles,
  Upload,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
  X,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Link, useNavigate } from "@tanstack/react-router";
import { useUser } from "@/hooks/useUser";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { user, student } = useUser();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initials from user name
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ⌘K shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setProfileOpen(false);
    navigate({ to: "/sign-in" });
  }, [navigate]);

  return (
    <header className="sticky top-3 z-20 mx-3 mt-3 lg:mt-3">
      <div className="glass-strong shadow-soft flex h-14 items-center gap-2 rounded-2xl px-3">
        {/* ── Search ── */}
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-background/40 px-3 py-2",
            searchOpen && "ring-1 ring-primary/40",
          )}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships, mentors, careers, schemes…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Global search"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => {
              if (!searchQuery) setSearchOpen(false);
            }}
          />
          {searchOpen && searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(false);
              }}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className="hidden rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
              ⌘K
            </kbd>
          )}
        </div>

        {/* ── Quick action buttons (desktop) ── */}
        <div className="hidden items-center gap-1 md:flex">
          <Link to="/ai-mentor">
            <Button
              size="sm"
              className="rounded-full text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="size-4" />
              Ask AI
            </Button>
          </Link>
          <Link to="/resume">
            <Button size="sm" variant="ghost" className="rounded-full">
              <Upload className="size-4" />
              Resume
            </Button>
          </Link>
          <Link to="/voice">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              aria-label="Voice mode"
            >
              <Mic className="size-4" />
            </Button>
          </Link>
          <Link to="/digital-twin">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              aria-label="Digital Twin"
            >
              <BrainCircuit className="size-4" />
            </Button>
          </Link>
        </div>

        <div className="mx-1 hidden h-6 w-px bg-border md:block" />

        {/* ── Language toggle ── */}
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          aria-label="Language"
          title={student?.preferred_language || "Language"}
        >
          <Globe className="size-4" />
        </Button>

        {/* ── Theme ── */}
        <ThemeToggle />

        {/* ── Notifications ── */}
        <Link to="/notifications">
          <Button
            size="icon"
            variant="ghost"
            className="relative rounded-full"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary animate-pulse-glow" />
          </Button>
        </Link>

        {/* ── Profile dropdown ── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="ml-1 flex items-center gap-1.5"
            aria-label="Profile menu"
            aria-expanded={profileOpen}
          >
            <span
              className="grid size-9 place-items-center rounded-full text-sm font-semibold text-primary-foreground shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              {initials}
            </span>
            <ChevronDown
              className={cn(
                "hidden size-3.5 text-muted-foreground transition-transform md:block",
                profileOpen && "rotate-180",
              )}
            />
          </button>

          {profileOpen && (
            <div className="glass-strong shadow-soft absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-border/60 p-1.5 animate-in fade-in slide-in-from-top-2">
              {/* User info header */}
              <div className="rounded-xl bg-background/40 px-3 py-3">
                <div className="truncate text-sm font-semibold">
                  {user?.full_name || "Student"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {user?.email || ""}
                </div>
                {student?.college && (
                  <div className="mt-1 truncate text-[11px] text-muted-foreground">
                    {student.college}
                    {student.year ? ` · Year ${student.year}` : ""}
                  </div>
                )}
                {(student?.profile_completeness ?? 0) < 100 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Profile completeness</span>
                      <span>
                        {Math.round(student?.profile_completeness ?? 0)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${student?.profile_completeness ?? 0}%`,
                          background: "var(--gradient-primary)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Menu items */}
              <div className="mt-1 space-y-0.5">
                <DropdownItem
                  icon={<UserIcon className="size-4" />}
                  label="My Profile"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate({ to: "/profile" });
                  }}
                />
                <DropdownItem
                  icon={<BrainCircuit className="size-4" />}
                  label="Digital Twin"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate({ to: "/digital-twin" });
                  }}
                />
                <DropdownItem
                  icon={<Upload className="size-4" />}
                  label="Resume Analyzer"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate({ to: "/resume" });
                  }}
                />
                <DropdownItem
                  icon={<Settings className="size-4" />}
                  label="Settings"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate({ to: "/settings" });
                  }}
                />
                <div className="my-1 h-px bg-border/60" />
                <DropdownItem
                  icon={<LogOut className="size-4" />}
                  label="Sign out"
                  onClick={handleLogout}
                  destructive
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-accent/40",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
