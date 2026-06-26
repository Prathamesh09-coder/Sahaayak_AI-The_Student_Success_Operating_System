import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  User,
  Lock,
  Globe,
  Smartphone,
  Users,
  Accessibility,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { AccessibilityAPI, ParentAPI } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Sahaayak AI" }] }),
  component: Settings,
});

import { useUser } from "@/hooks/useUser";

function Settings() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "profile" | "parent" | "accessibility" | "privacy"
  >("accessibility");
  const [studentId, setStudentId] = useState<string>("");

  // Accessibility states
  const [accPrefs, setAccPrefs] = useState({
    theme: "DARK",
    contrast: "HIGH",
    text_size: "LARGE",
    reduced_motion: true,
    screen_reader_friendly: true,
  });
  const [loadingAcc, setLoadingAcc] = useState(false);
  const [savingAcc, setSavingAcc] = useState(false);

  // Parent states
  const [parentPrefs, setParentPrefs] = useState({
    parent_name: "",
    preferred_language: "hi",
    digital_literacy_level: "LOW",
  });
  const [parentModeEnabled, setParentModeEnabled] = useState(false);
  const [loadingParent, setLoadingParent] = useState(false);
  const [savingParent, setSavingParent] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setStudentId(user.id);
    } else {
      setStudentId("student_123");
    }
  }, [user]);

  // Fetch Accessibility Preferences
  useEffect(() => {
    if (!studentId) return;
    const fetchAcc = async () => {
      setLoadingAcc(true);
      try {
        const response = await AccessibilityAPI.getPreferences(studentId);
        if (response.success && response.data) {
          setAccPrefs(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch accessibility preferences", err);
      } finally {
        setLoadingAcc(false);
      }
    };
    fetchAcc();
  }, [studentId]);

  // Fetch Parent Profile
  useEffect(() => {
    if (!studentId) return;
    const fetchParent = async () => {
      setLoadingParent(true);
      try {
        const response = await ParentAPI.getProfile(studentId);
        if (response.success && response.data) {
          setParentPrefs(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch parent profile", err);
      } finally {
        setLoadingParent(false);
      }
    };
    fetchParent();
  }, [studentId]);

  const saveAccessibility = async () => {
    setSavingAcc(true);
    try {
      const response = await AccessibilityAPI.updatePreferences(
        studentId,
        accPrefs,
      );
      if (response.success) {
        toast.success("Accessibility preferences updated successfully!");

        // Dynamically apply contrast and text size options locally
        if (typeof document !== "undefined") {
          if (accPrefs.contrast === "HIGH") {
            document.documentElement.classList.add("high-contrast");
          } else {
            document.documentElement.classList.remove("high-contrast");
          }

          if (accPrefs.text_size === "LARGE") {
            document.documentElement.style.fontSize = "18px";
          } else {
            document.documentElement.style.fontSize = "16px";
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save accessibility preferences.");
    } finally {
      setSavingAcc(false);
    }
  };

  const saveParentProfile = async () => {
    setSavingParent(true);
    try {
      const response = await ParentAPI.updateProfile(studentId, parentPrefs);
      if (response.success) {
        toast.success("Parent profile configuration updated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save parent profile.");
    } finally {
      setSavingParent(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8 shrink-0">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <SettingsIcon className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          <NavButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<User />}
            label="Profile"
          />
          <NavButton
            active={activeTab === "parent"}
            onClick={() => setActiveTab("parent")}
            icon={<Users />}
            label="Parent Mode"
            highlight
          />
          <NavButton
            active={activeTab === "accessibility"}
            onClick={() => setActiveTab("accessibility")}
            icon={<Accessibility />}
            label="Accessibility"
          />
          <NavButton
            active={activeTab === "privacy"}
            onClick={() => setActiveTab("privacy")}
            icon={<Shield />}
            label="Privacy & Security"
          />
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-4">
          {activeTab === "profile" && (
            <Card
              title="Student Profile"
              icon={<User className="size-4 text-primary" />}
            >
              <div className="space-y-6">
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
                  <h4 className="font-semibold mb-2">
                    Dedicated Profile Workspace
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Sahaayak AI now features a dedicated Profile workspace.
                    Here, you can view your real-time completeness score, follow
                    a guided checklist, and edit your academic and career
                    baseline details.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-background/25 border border-border/30 rounded-2xl">
                  <div>
                    <div className="text-sm font-semibold">
                      Manage Profile Details
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Update your name, age, CGPA, dream career, skills, and
                      household income.
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow shrink-0"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Open Profile <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "parent" && (
            <Card
              title="Parent Mode Configuration"
              icon={<Users className="size-4 text-primary" />}
            >
              <div className="space-y-6">
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
                  <h4 className="font-semibold mb-2">What is Parent Mode?</h4>
                  <p className="text-sm text-muted-foreground">
                    Parent Mode simplifies the dashboard to display high-level
                    academic progress and financial updates in your native
                    language.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">
                      Enable Parent Mode UI
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle to switch the current view to Parent Mode.
                    </p>
                  </div>
                  <button
                    onClick={() => setParentModeEnabled(!parentModeEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      parentModeEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`size-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        parentModeEnabled ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {loadingParent ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <Label className="font-semibold">
                      Parent Credentials & Preferences
                    </Label>

                    <div className="space-y-2">
                      <Label className="text-xs">Parent Name</Label>
                      <input
                        type="text"
                        className="w-full bg-background/50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        value={parentPrefs.parent_name}
                        onChange={(e) =>
                          setParentPrefs({
                            ...parentPrefs,
                            parent_name: e.target.value,
                          })
                        }
                        placeholder="Enter Parent Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Preferred Language</Label>
                        <select
                          className="w-full bg-background/50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                          value={parentPrefs.preferred_language}
                          onChange={(e) =>
                            setParentPrefs({
                              ...parentPrefs,
                              preferred_language: e.target.value,
                            })
                          }
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi (हिन्दी)</option>
                          <option value="mr">Marathi (मराठी)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">
                          Digital Literacy Level
                        </Label>
                        <select
                          className="w-full bg-background/50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                          value={parentPrefs.digital_literacy_level}
                          onChange={(e) =>
                            setParentPrefs({
                              ...parentPrefs,
                              digital_literacy_level: e.target.value,
                            })
                          }
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      onClick={saveParentProfile}
                      disabled={savingParent}
                      className="w-full rounded-xl mt-2"
                    >
                      {savingParent ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : null}
                      Save Parent Configuration
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "accessibility" && (
            <Card
              title="Accessibility Preferences"
              icon={<Accessibility className="size-4 text-primary" />}
            >
              <div className="space-y-6">
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4">
                  <h4 className="font-semibold mb-2">Accessibility Features</h4>
                  <p className="text-sm text-muted-foreground">
                    Adjust UI parameters like text size, contrast, and themes to
                    fit your workflow.
                  </p>
                </div>

                {loadingAcc ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">
                          Contrast Level
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Select system contrast enhancement
                        </p>
                      </div>
                      <select
                        className="bg-background border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        value={accPrefs.contrast}
                        onChange={(e) =>
                          setAccPrefs({ ...accPrefs, contrast: e.target.value })
                        }
                      >
                        <option value="STANDARD">Standard Contrast</option>
                        <option value="HIGH">High Contrast</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/30 pt-4">
                      <div>
                        <Label className="text-sm font-semibold">
                          Text Size
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Adjust display font scale
                        </p>
                      </div>
                      <select
                        className="bg-background border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        value={accPrefs.text_size}
                        onChange={(e) =>
                          setAccPrefs({
                            ...accPrefs,
                            text_size: e.target.value,
                          })
                        }
                      >
                        <option value="STANDARD">Standard (16px)</option>
                        <option value="LARGE">Large (18px)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/30 pt-4">
                      <div>
                        <Label className="text-sm font-semibold">
                          Reduced Motion
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Minimize animations and transitions
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setAccPrefs({
                            ...accPrefs,
                            reduced_motion: !accPrefs.reduced_motion,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          accPrefs.reduced_motion ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <div
                          className={`size-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            accPrefs.reduced_motion
                              ? "translate-x-6"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/30 pt-4">
                      <div>
                        <Label className="text-sm font-semibold">
                          Screen Reader Optimization
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enable semantic-first structure tags
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setAccPrefs({
                            ...accPrefs,
                            screen_reader_friendly:
                              !accPrefs.screen_reader_friendly,
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          accPrefs.screen_reader_friendly
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      >
                        <div
                          className={`size-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            accPrefs.screen_reader_friendly
                              ? "translate-x-6"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/30 pt-4">
                      <div>
                        <Label className="text-sm font-semibold">
                          Theme Mode
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Switch color scheme
                        </p>
                      </div>
                      <select
                        className="bg-background border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        value={accPrefs.theme}
                        onChange={(e) =>
                          setAccPrefs({ ...accPrefs, theme: e.target.value })
                        }
                      >
                        <option value="LIGHT">Light Theme</option>
                        <option value="DARK">Dark Theme</option>
                      </select>
                    </div>

                    <Button
                      onClick={saveAccessibility}
                      disabled={savingAcc}
                      className="w-full rounded-xl mt-4"
                    >
                      {savingAcc ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : null}
                      Save Accessibility Preferences
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "privacy" && (
            <Card
              title="Account Security"
              icon={<Lock className="size-4 text-muted-foreground" />}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">
                      Two-Factor Authentication
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Add an extra layer of security
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Setup
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-destructive">
                      Delete Account
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Permanently remove your data
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-full"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}

function NavButton({
  icon,
  label,
  active,
  highlight,
  onClick,
}: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-glow"
          : highlight
            ? "bg-accent/10 text-accent hover:bg-accent/20"
            : "hover:bg-background/40 text-muted-foreground hover:text-foreground"
      }`}
      style={active ? { background: "var(--gradient-primary)" } : {}}
    >
      <div className="size-4 [&>svg]:size-full">{icon}</div>
      {label}
    </button>
  );
}

function Card({
  title,
  children,
  className,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <section
      className={`glass shadow-soft flex flex-col rounded-3xl p-5 md:p-6 ${className ?? ""}`}
    >
      <header className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}
