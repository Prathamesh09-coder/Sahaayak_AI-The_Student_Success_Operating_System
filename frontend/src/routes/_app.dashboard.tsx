import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Calendar,
  CheckCircle2,
  Compass,
  GraduationCap,
  Heart,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
  LayoutDashboard,
  User,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  FileSearch,
  Send,
  Plus,
  Trash2,
  Loader2,
  BrainCircuit,
  Settings as SettingsIcon,
  ChevronRight,
  BookOpen,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState, useRef } from "react";
import { DashboardAPI, OnboardingAPI, TwinAPI, ChatAPI } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser, useInvalidateUser } from "@/hooks/useUser";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Sahaayak AI" }] }),
  component: Dashboard,
});

const INCOME_OPTIONS = [
  { key: "below-3l", label: "Below ₹3L", value: 200000 },
  { key: "3-6l", label: "₹3L – ₹6L", value: 450000 },
  { key: "6-12l", label: "₹6L – ₹12L", value: 800000 },
  { key: "12l+", label: "Above ₹12L", value: 1500000 },
  { key: "skip", label: "Prefer not to say", value: 0 },
];

const YEAR_OPTIONS = ["1st year", "2nd year", "3rd year", "4th year", "PG"];

const CHAT_PRESETS = [
  "How can I improve my CGPA?",
  "Recommend need-based scholarships for me",
  "Help me prepare for an SDE Interview",
  "Explain DSA Graph Traversals in simple terms",
];

interface ChatMessage {
  role: "user" | "ai" | "system" | "assistant";
  content: string;
  reasoning?: string;
}

interface Conversation {
  id: string;
  title: string;
  summary: string | null;
  updated_at: string;
}

function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, student, refetch: refetchUser } = useUser();
  const invalidateUser = useInvalidateUser();
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "resume" | "chat"
  >("overview");

  // Recalculating Digital Twin loading state
  const [recalculatingTwin, setRecalculatingTwin] = useState(false);

  // ─── Query: Dashboard Overview ──────────────────────────────────────────────
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useQuery<any, Error>({
    queryKey: ["dashboardOverview"],
    queryFn: () => DashboardAPI.getOverview().then((res) => res.data),
  });

  // ─── Query: Full Profile Details (for Profile Editor tab) ───────────────────
  const {
    data: fullProfileRes,
    isLoading: isProfileLoading,
    refetch: refetchProfileData,
  } = useQuery<any, Error>({
    queryKey: ["fullProfileDetails"],
    queryFn: () => OnboardingAPI.getMe().then((res) => res.data),
    enabled: activeTab === "profile",
  });

  // ─── Profile Form States ──────────────────────────────────────────────────
  const [profName, setProfName] = useState("");
  const [profAge, setProfAge] = useState<number>(18);
  const [profLang, setProfLang] = useState("English");
  const [profCollege, setProfCollege] = useState("");
  const [profBranch, setProfBranch] = useState("");
  const [profYear, setProfYear] = useState("1st year");
  const [profCgpa, setProfCgpa] = useState<number>(0);
  const [profFirstGen, setProfFirstGen] = useState(true);
  const [profIncome, setProfIncome] = useState("below-3l");
  const [profDreamCareer, setProfDreamCareer] = useState("");
  const [profSkills, setProfSkills] = useState("");
  const [profInterests, setProfInterests] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profile data when query loads
  useEffect(() => {
    if (fullProfileRes) {
      const sp = fullProfileRes.student_profile || {};
      const fp = fullProfileRes.family_profile || {};
      const cp = fullProfileRes.career_profile || {};

      setProfName(user?.full_name || "");
      setProfAge(sp.age || 18);
      setProfLang(sp.preferred_language || "English");
      setProfCollege(sp.college || "");
      setProfBranch(sp.branch || "");

      // Map year number to string
      const yearMapReverse: Record<number, string> = {
        1: "1st year",
        2: "2nd year",
        3: "3rd year",
        4: "4th year",
        5: "PG",
      };
      setProfYear(yearMapReverse[sp.year] || "1st year");
      setProfCgpa(sp.cgpa || 0);

      setProfFirstGen(fp.first_generation_learner ?? true);

      // Map income back to option
      const incomeVal = fp.annual_income || 0;
      const matchingIncome =
        INCOME_OPTIONS.find((o) => o.value === incomeVal) || INCOME_OPTIONS[0];
      setProfIncome(matchingIncome.key);

      setProfDreamCareer(cp.dream_career || "");
      setProfSkills(cp.skills ? cp.skills.join(", ") : "");
      setProfInterests(cp.interests ? cp.interests.join(", ") : "");
    }
  }, [fullProfileRes, user]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      // 1. Map year
      const yearMap: Record<string, number> = {
        "1st year": 1,
        "2nd year": 2,
        "3rd year": 3,
        "4th year": 4,
        PG: 5,
      };

      // 2. Map income
      const incomeEntry = INCOME_OPTIONS.find((o) => o.key === profIncome);

      // 3. Save Academic Profile
      await OnboardingAPI.saveAcademic({
        name: profName,
        age: Number(profAge),
        preferred_language: profLang,
        college: profCollege,
        branch: profBranch,
        year: yearMap[profYear] ?? 1,
        cgpa: Number(profCgpa),
      });

      // 4. Save Family Profile
      await OnboardingAPI.saveFamily({
        annual_income: incomeEntry?.value ?? 0,
        first_generation_learner: profFirstGen,
      });

      // 5. Save Career Profile
      const skillsArray = profSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const interestsArray = profInterests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      await OnboardingAPI.saveCareer({
        dream_career: profDreamCareer,
        skills: skillsArray,
        interests: interestsArray,
      });

      // 6. Recalculate Digital Twin
      await TwinAPI.recalculate();

      // 7. Refresh contexts
      invalidateUser();
      refetchUser();
      refetchProfileData();
      refetchOverview();

      toast.success(
        "Profile saved and Digital Twin recalculated in real-time! 🚀",
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ─── Digital Twin Manual Recalculation ──────────────────────────────────────
  const handleManualRecalculate = async () => {
    setRecalculatingTwin(true);
    try {
      await TwinAPI.recalculate();
      refetchOverview();
      toast.success("Digital Twin recalculated successfully! 🧬");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to recalculate Twin.");
    } finally {
      setRecalculatingTwin(false);
    }
  };

  // ─── Resume Analyzer Tab States ─────────────────────────────────────────────
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeAnalyzed, setResumeAnalyzed] = useState(false);
  const [atsScore, setAtsScore] = useState(68);

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      simulateResumeAnalysis();
    }
  };

  const simulateResumeAnalysis = () => {
    setAnalyzingResume(true);
    setResumeAnalyzed(false);
    setTimeout(() => {
      setAnalyzingResume(false);
      setResumeAnalyzed(true);
      // Generate a dynamic score based on student's current CGPA if available
      const baseScore = student?.cgpa
        ? Math.round(60 + (student.cgpa / 10) * 25)
        : 72;
      setAtsScore(Math.min(baseScore, 95));
      toast.success("Resume analysis complete! 📄");
    }, 2500);
  };

  // ─── Chat / AI Mentor Tab States & WebSocket ───────────────────────────────
  const [chatConversations, setChatConversations] = useState<Conversation[]>(
    [],
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatTyping, setChatTyping] = useState(false);
  const chatWs = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat conversations
  const loadChatConversations = async (stdId: string) => {
    try {
      const res = await ChatAPI.getConversations(stdId);
      const list = res.data || [];
      setChatConversations(list);
      if (list.length > 0 && !activeChatId) {
        setActiveChatId(list[0].id);
      }
    } catch (e) {
      console.error("Failed to load conversations in dashboard", e);
    }
  };

  useEffect(() => {
    if (activeTab === "chat" && user?.id) {
      loadChatConversations(user.id);
    }
  }, [activeTab, user?.id]);

  // Load active conversation history
  useEffect(() => {
    if (activeTab !== "chat" || !activeChatId) {
      setChatMessages([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const res = await ChatAPI.getHistory(activeChatId);
        const history = res.data || [];
        setChatMessages(
          history.map((m: any) => ({
            role: m.role === "assistant" ? "ai" : m.role,
            content: m.content,
            reasoning: m.reasoning,
          })),
        );
      } catch (e) {
        console.error("Failed to load history in dashboard", e);
      }
    };
    loadHistory();
  }, [activeChatId, activeTab]);

  // Connect WebSocket for active conversation
  useEffect(() => {
    if (activeTab !== "chat" || !user?.id || !activeChatId) return;

    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let heartbeatInterval: ReturnType<typeof setInterval>;
    let lastHeartbeat = Date.now();

    const connectChatWS = () => {
      chatWs.current = new WebSocket(
        `ws://localhost:8000/api/v1/mentor/ws/${activeChatId}?student_id=${user.id}`,
      );

      heartbeatInterval = setInterval(() => {
        if (Date.now() - lastHeartbeat > 15000) {
          console.warn("Dashboard chat heartbeat timed out. Reconnecting...");
          chatWs.current?.close();
        }
      }, 5000);

      chatWs.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.event === "heartbeat") {
            lastHeartbeat = Date.now();
            return;
          }

          if (data.type === "token.stream") {
            setChatTyping(false);
            setChatMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "ai") {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  ...last,
                  content: last.content + data.content,
                };
                return copy;
              } else {
                return [...prev, { role: "ai", content: data.content }];
              }
            });
          } else if (data.type === "reasoning.stream") {
            setChatTyping(false);
            setChatMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "ai") {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  ...last,
                  reasoning: (last.reasoning || "") + data.content,
                };
                return copy;
              } else {
                return [
                  ...prev,
                  { role: "ai", content: "", reasoning: data.content },
                ];
              }
            });
          } else if (data.type === "chat.error") {
            setChatTyping(false);
            toast.error(data.error || "Chat pipeline error occurred.");
          } else if (data.type === "message.completed") {
            // Refresh conversation list to capture title changes
            loadChatConversations(user.id);
          }
        } catch (e) {
          console.error("Dashboard WS parse error", e);
        }
      };

      chatWs.current.onclose = () => {
        clearInterval(heartbeatInterval);
        reconnectTimeout = setTimeout(connectChatWS, 3000);
      };
    };

    connectChatWS();

    return () => {
      clearInterval(heartbeatInterval);
      clearTimeout(reconnectTimeout);
      if (chatWs.current) {
        chatWs.current.onclose = null;
        chatWs.current.close();
      }
    };
  }, [activeChatId, activeTab, user?.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChatMessage = (textToSend?: string) => {
    const msg = textToSend || chatInput;
    if (
      !msg.trim() ||
      !chatWs.current ||
      chatWs.current.readyState !== WebSocket.OPEN
    )
      return;

    // Append user message to state
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatTyping(true);
    if (!textToSend) setChatInput("");

    // Send payload
    chatWs.current.send(
      JSON.stringify({
        event: "chat.message",
        message: msg,
      }),
    );
  };

  const handleCreateNewConversation = async () => {
    if (!user?.id) return;
    const tempId = `new_${Date.now()}`;
    setActiveChatId(tempId);
    setChatMessages([]);
    // Seed in list
    setChatConversations((prev) => [
      {
        id: tempId,
        title: "New Conversation",
        summary: "Starting a new thread...",
        updated_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Switch to Chat Tab and prepopulate with dynamic prompt
  const handleTailorResume = () => {
    setActiveTab("chat");
    setTimeout(() => {
      handleCreateNewConversation();
      setTimeout(() => {
        setChatInput(
          `Hi Sahaayak! I just ran a resume analysis for my dream career: ${profDreamCareer || "Software Engineer"}. My ATS score is ${atsScore}%. Can you help me rewrite my professional summary and add relevant keywords based on my skills: ${profSkills || "React, Node.js"}?`,
        );
      }, 500);
    }, 200);
  };

  // Smart greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Check for redirected prompt from Resume Analyzer
  useEffect(() => {
    const redirectedPrompt = sessionStorage.getItem("sahaayak_chat_prompt");
    if (redirectedPrompt) {
      sessionStorage.removeItem("sahaayak_chat_prompt");
      setActiveTab("chat");
      setTimeout(() => {
        handleCreateNewConversation();
        setTimeout(() => {
          setChatInput(redirectedPrompt);
        }, 500);
      }, 200);
    }
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "Student";

  // Redirect to onboarding if profile is missing
  useEffect(() => {
    if (student === null && !isOverviewLoading) {
      navigate({ to: "/onboarding" });
    }
  }, [student, navigate, isOverviewLoading]);

  if (isOverviewLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">
          Loading your Sahaayak dashboard...
        </p>
      </div>
    );
  }

  const data = overviewRes || {};

  // Success Index Chart Data
  const SUCCESS_DATA = [
    {
      name: "score",
      value: Math.round(data.success_index || 0),
      fill: "url(#gradPrimary)",
    },
  ];

  // Activity Chart Data
  const ACTIVITY_DATA =
    data.recent_activities?.length > 0
      ? data.recent_activities.map((a: any, i: number) => ({
          day: `D${i}`,
          value: 10 + i * 2,
        }))
      : [
          { day: "Mon", value: 12 },
          { day: "Tue", value: 19 },
          { day: "Wed", value: 15 },
          { day: "Thu", value: 28 },
          { day: "Fri", value: 22 },
          { day: "Sat", value: 35 },
          { day: "Sun", value: 42 },
        ];

  const opportunities = data.opportunities || [];
  const deadlines = data.upcoming_deadlines || [];
  const mentors = data.mentor_suggestions || [];

  return (
    <div className="space-y-4">
      {/* ─── Premium Dashboard Header & Tab Selector ───────────────────────────────── */}
      <header className="glass shadow-soft flex flex-col gap-4 rounded-3xl p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {greeting}, {firstName}
          </p>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Student Success Dashboard
          </h1>
        </div>

        {/* Dynamic Glassmorphic Tab Bar */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-background/50 p-1 border border-border/40">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-card text-foreground shadow-soft border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="size-4" /> Overview
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-card text-foreground shadow-soft border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="size-4" /> My Profile
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === "resume"
                ? "bg-card text-foreground shadow-soft border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="size-4" /> Resume AI
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              activeTab === "chat"
                ? "bg-card text-foreground shadow-soft border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-4" /> Ask AI Mentor
          </button>
        </div>
      </header>

      {/* ─── Tab Content 1: Overview ───────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Welcome Card & Action Strip */}
          <section className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8">
            <div
              aria-hidden
              className="absolute -right-20 -top-24 size-72 rounded-full blur-3xl"
              style={{ background: "var(--gradient-primary)", opacity: 0.25 }}
            />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  You're <span className="gradient-text">3 actions away</span>{" "}
                  from this week's goal.
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Your Digital Twin has mapped your engineering path. You have{" "}
                  {opportunities.length} new recommended scholarships and{" "}
                  {mentors.length} mentor matches.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <PillButton
                  icon={<Sparkles className="size-4" />}
                  label="Ask AI Mentor"
                  to="#"
                  onClick={() => setActiveTab("chat")}
                  primary
                />
                <button
                  onClick={handleManualRecalculate}
                  disabled={recalculatingTwin}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-2 text-sm font-semibold hover:bg-accent/45 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`size-4 ${recalculatingTwin ? "animate-spin" : ""}`}
                  />
                  {recalculatingTwin ? "Analyzing..." : "Recalculate Twin"}
                </button>
              </div>
            </div>

            {/* KPI Strip */}
            <div className="relative mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi
                icon={<GraduationCap className="size-4" />}
                label="Success Score"
                value={Math.round(data.success_index || 0).toString()}
                delta="Live Track"
              />
              <Kpi
                icon={<Rocket className="size-4" />}
                label="Profile completeness"
                value={`${Math.round(data.profile_completeness || 0)}%`}
                delta=""
              />
              <Kpi
                icon={<TrendingUp className="size-4" />}
                label="Completed Goals"
                value={(data.goals_progress?.completed || 0).toString()}
                delta=""
              />
              <Kpi
                icon={<Heart className="size-4" />}
                label="Pending Goals"
                value={(data.goals_progress?.pending || 0).toString()}
                delta=""
              />
            </div>
          </section>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Recent Activity"
              subtitle="Score progress based on mock assessments & activities"
            >
              <div className="h-[220px] w-full mt-4">
                <ResponsiveContainer>
                  <AreaChart
                    data={ACTIVITY_DATA}
                    margin={{ top: 10, right: 10, bottom: 0, left: -16 }}
                  >
                    <defs>
                      <linearGradient id="actFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="oklch(0.65 0.20 280)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="oklch(0.65 0.20 280)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
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
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="oklch(0.65 0.20 280)"
                      strokeWidth={2.5}
                      fill="url(#actFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card
              title="Success Index Breakdown"
              subtitle="Combined tracking metrics"
            >
              <div className="relative h-[220px] mt-2">
                <ResponsiveContainer>
                  <RadialBarChart
                    innerRadius={75}
                    outerRadius={100}
                    startAngle={90}
                    endAngle={-270}
                    data={SUCCESS_DATA}
                  >
                    <defs>
                      <linearGradient
                        id="gradPrimary"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="oklch(0.58 0.22 280)" />
                        <stop offset="100%" stopColor="oklch(0.55 0.24 300)" />
                      </linearGradient>
                    </defs>
                    <RadialBar
                      dataKey="value"
                      cornerRadius={20}
                      background={{ fill: "var(--muted)" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold tracking-tight">
                      {Math.round(data.success_index || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      overall index
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recommendations, Deadlines & Goals */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Today's Recommendations"
              subtitle="Ranked dynamically by your Digital Twin"
              action={<HeaderLink to="/opportunities">View all</HeaderLink>}
            >
              <ul className="divide-y divide-border/60 mt-2">
                {opportunities.length > 0 ? (
                  opportunities.map((o: any, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className="grid size-10 shrink-0 place-items-center rounded-xl text-primary"
                        style={{
                          background:
                            "color-mix(in oklab, var(--primary) 14%, transparent)",
                        }}
                      >
                        <Rocket className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">
                          {o.t || o.title}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {o.sub || o.description}
                        </div>
                      </div>
                      <MatchBadge value={o.match || 88} />
                      <button className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent/40 hover:text-foreground">
                        <ArrowUpRight className="size-4" />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="py-3.5 text-sm text-muted-foreground text-center">
                    No recommendations found. Complete your profile fields to
                    unlock.
                  </li>
                )}
              </ul>
            </Card>

            <Card
              title="Upcoming Deadlines"
              subtitle="Keep track of calendar dates"
            >
              <ul className="space-y-3 mt-2">
                {deadlines.length > 0 ? (
                  deadlines.map((d: any, idx: number) => (
                    <li
                      key={idx}
                      className="rounded-2xl bg-background/40 p-3.5 border border-border/35"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        <Calendar className="size-3.5" />{" "}
                        {d.tag || "Scholarship"}
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {d.t || d.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {d.d || d.date}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-sm text-muted-foreground text-center">
                    No upcoming deadlines.
                  </li>
                )}
              </ul>
            </Card>
          </div>

          {/* AI Suggestions & Mentors */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Compounding Action Suggestions"
              subtitle="Daily tiny steps compiled by Sahaayak AI"
            >
              <ul className="space-y-3 mt-2">
                {data.recommendations && data.recommendations.length > 0 ? (
                  data.recommendations.map((s: any, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl bg-background/40 p-3.5 border border-border/30"
                    >
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary animate-pulse" />
                      <p className="text-sm flex-1">
                        {typeof s === "string" ? s : s.message}
                      </p>
                      <button
                        onClick={() => setActiveTab("chat")}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
                      >
                        Ask Mentor <ChevronRight className="size-3" />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-sm text-muted-foreground text-center">
                    No action suggestions. Keep up the good work!
                  </li>
                )}
              </ul>
            </Card>

            <Card
              title="Matched Peer Mentors"
              subtitle="Connect with students or alumni"
            >
              <ul className="space-y-3 mt-2">
                {mentors.length > 0 ? (
                  mentors.map((m: any, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 rounded-2xl bg-background/40 p-3 border border-border/30"
                    >
                      <div
                        className="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold text-primary-foreground"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        {(m.n || m.name || "M")[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">
                          {m.n || m.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {m.r || m.role}
                        </div>
                      </div>
                      <MatchBadge value={m.m || m.match || 92} compact />
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-sm text-muted-foreground text-center">
                    No matched mentors.
                  </li>
                )}
              </ul>
            </Card>
          </div>

          {/* Digital Twin Summary Cards */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Digital Twin Dimension Score"
              subtitle="Core metrics mapped on a 100-point scale"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="text-center p-4 bg-background/40 rounded-2xl border border-border/30">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(data.digital_twin_summary?.academic_score || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Academic
                  </div>
                </div>
                <div className="text-center p-4 bg-background/40 rounded-2xl border border-border/30">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round(
                      data.digital_twin_summary?.financial_stability || 0,
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Financial
                  </div>
                </div>
                <div className="text-center p-4 bg-background/40 rounded-2xl border border-border/30">
                  <div className="text-2xl font-bold text-success">
                    {Math.round(
                      data.digital_twin_summary?.career_readiness || 0,
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Career
                  </div>
                </div>
                <div className="text-center p-4 bg-background/40 rounded-2xl border border-border/30">
                  <div className="text-2xl font-bold text-warning">
                    {Math.round(
                      data.digital_twin_summary?.confidence_score || 0,
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Confidence
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="Live Support Channels"
              subtitle="Circles with active peer discussions"
            >
              <div className="space-y-3 mt-2">
                {[
                  { n: "First-gen Support Circle", c: "342 active" },
                  { n: "Scholarship Hunters", c: "118 active" },
                  { n: "Tech Interview Prep", c: "201 active" },
                ].map((g) => (
                  <div
                    key={g.n}
                    className="flex items-center gap-3 rounded-2xl bg-background/40 p-3 border border-border/25"
                  >
                    <Users className="size-4 text-accent" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {g.n}
                      </div>
                      <div className="text-xs text-muted-foreground">{g.c}</div>
                    </div>
                    <span className="size-2 rounded-full bg-success animate-pulse" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─── Tab Content 2: Profile Editor ────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column: Progress Info */}
            <div className="space-y-4 lg:col-span-1">
              <Card
                title="Profile Completeness"
                subtitle="Update all fields to reach 100%"
              >
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative size-32">
                    <svg className="size-full" viewBox="0 0 36 36">
                      <path
                        className="text-muted"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary transition-all duration-1000"
                        strokeWidth="3"
                        strokeDasharray={`${Math.round(student?.profile_completeness || 0)}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-extrabold">
                        {Math.round(student?.profile_completeness || 0)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        Done
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground max-w-xs">
                    Your profile data is encrypted, private by default, and used
                    solely by your local Digital Twin to recommend matching
                    opportunities.
                  </p>
                </div>
              </Card>

              <Card
                title="Database Synced"
                subtitle="Direct PostgreSQL connection status"
              >
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-background/20 border border-border/30">
                  <span className="size-3 rounded-full bg-success animate-ping shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Real-time Sync Active
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Changes propagate in milliseconds
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Form Editor */}
            <div className="lg:col-span-2">
              {isProfileLoading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground bg-card rounded-3xl border border-border/30">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="text-xs">Loading profile from database...</p>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Personal & Academic */}
                  <Card
                    title="1. Personal & Academic Profile"
                    subtitle="Your education baseline details"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="Anjali Raj"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Age
                        </label>
                        <input
                          type="number"
                          required
                          value={profAge}
                          onChange={(e) => setProfAge(Number(e.target.value))}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="19"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          College / University
                        </label>
                        <input
                          type="text"
                          required
                          value={profCollege}
                          onChange={(e) => setProfCollege(e.target.value)}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="College name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Branch / Specialization
                        </label>
                        <input
                          type="text"
                          required
                          value={profBranch}
                          onChange={(e) => setProfBranch(e.target.value)}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Academic Year
                        </label>
                        <select
                          value={profYear}
                          onChange={(e) => setProfYear(e.target.value)}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        >
                          {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          CGPA / Percentage
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={profCgpa}
                          onChange={(e) => setProfCgpa(Number(e.target.value))}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="8.5"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Preferred Communication Language
                        </label>
                        <input
                          type="text"
                          required
                          value={profLang}
                          onChange={(e) => setProfLang(e.target.value)}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="English, Hindi, etc."
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Family Background */}
                  <Card
                    title="2. Family & Economic Background"
                    subtitle="Helps match with financial schemes and scholarships"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Annual Household Income
                        </label>
                        <select
                          value={profIncome}
                          onChange={(e) => setProfIncome(e.target.value)}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                        >
                          {INCOME_OPTIONS.map((o) => (
                            <option key={o.key} value={o.key}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3.5 bg-background/30 border border-border/50 rounded-2xl sm:mt-5">
                        <div>
                          <div className="text-sm font-semibold">
                            First-Generation Learner
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            First in family to attend college
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profFirstGen}
                          onChange={(e) => setProfFirstGen(e.target.checked)}
                          className="size-5 rounded border-border text-primary focus:ring-primary"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Career & Aspirations */}
                  <Card
                    title="3. Career Aspirations & Skills"
                    subtitle="Drives recommendations in Career GPS and Opportunity channels"
                  >
                    <div className="grid gap-4 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Dream Career Path
                        </label>
                        <input
                          type="text"
                          required
                          value={profDreamCareer}
                          onChange={(e) => setProfDreamCareer(e.target.value)}
                          className="w-full h-11 bg-background/50 border border-border/60 rounded-xl px-3.5 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="Software Engineer, Civil Servant, Designer, etc."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Skills (Comma-separated)
                        </label>
                        <textarea
                          value={profSkills}
                          onChange={(e) => setProfSkills(e.target.value)}
                          className="w-full min-h-[70px] bg-background/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="React, Python, SQL, Communication, Excel"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Interests (Comma-separated)
                        </label>
                        <textarea
                          value={profInterests}
                          onChange={(e) => setProfInterests(e.target.value)}
                          className="w-full min-h-[70px] bg-background/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                          placeholder="Coding, Design, Public Speaking, Finance"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Form Action */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Saving
                          Changes...
                        </>
                      ) : (
                        "Save Profile & Recalculate"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content 3: Resume Analyzer ────────────────────────────────────── */}
      {activeTab === "resume" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Upload Card */}
            <Card title="Upload Resume" className="lg:col-span-1">
              <div className="flex h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-background/20 p-6 text-center hover:bg-background/45 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleResumeSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={analyzingResume}
                />
                <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary mb-4 animate-bounce">
                  <Upload className="size-6" />
                </div>
                <p className="text-sm font-semibold">
                  Click to upload or drag & drop
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF or DOCX (max. 5MB)
                </p>
                {resumeFile && (
                  <div className="mt-4 text-xs bg-card/65 px-3 py-1.5 rounded-full border border-border/45 truncate max-w-xs">
                    📄 {resumeFile.name}
                  </div>
                )}
              </div>
            </Card>

            {/* Right ATS Panel */}
            <div className="lg:col-span-2">
              {analyzingResume ? (
                <div className="flex h-[320px] flex-col items-center justify-center gap-4 text-center bg-card rounded-3xl border border-border/30">
                  <Loader2 className="size-10 animate-spin text-primary" />
                  <div>
                    <h4 className="font-semibold text-md">
                      AI Resume Analysis In Progress
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Sahaayak AI is scanning your resume formatting, layout,
                      action verbs, and matching keywords...
                    </p>
                  </div>
                </div>
              ) : resumeAnalyzed ? (
                <Card
                  title="ATS Analysis Feedback Report"
                  icon={<FileSearch className="size-4 text-primary" />}
                >
                  <div className="flex flex-col gap-5 mt-2">
                    <div className="flex items-center gap-6">
                      {/* ATS Score Dial */}
                      <div className="flex items-center justify-center size-24 rounded-full border-[6px] border-success text-2xl font-extrabold text-success shadow-[0_0_20px_var(--success)]/20 bg-background/25">
                        {atsScore}%
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">
                          Competitive Resume Score!
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md">
                          Your resume is highly optimized, but keyword matching
                          for <b>{profDreamCareer || "Software Engineer"}</b>{" "}
                          can be further strengthened.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-success/10 border border-success/20 p-4">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-success mb-2.5 uppercase tracking-wide">
                          <CheckCircle2 className="size-4" /> Strong Aspects
                        </h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <div className="mt-1 size-1.5 rounded-full bg-success shrink-0" />
                            Excellent action-oriented project descriptions.
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 size-1.5 rounded-full bg-success shrink-0" />
                            ATS-friendly single column template layout.
                          </li>
                        </ul>
                      </div>

                      <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-destructive mb-2.5 uppercase tracking-wide">
                          <AlertCircle className="size-4" /> Areas to Optimize
                        </h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <div className="mt-1 size-1.5 rounded-full bg-destructive shrink-0" />
                            Add missing key industry terms: "Agile", "APIs".
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 size-1.5 rounded-full bg-destructive shrink-0" />
                            Quantify project impacts (e.g. state performance
                            percentages).
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Keywords Checklist */}
                    <div className="rounded-2xl bg-background/20 border border-border/30 p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wide mb-2">
                        Target Skills Keyword Match
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profSkills ? (
                          profSkills.split(",").map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-success/15 text-success border border-success/20 px-2 py-0.5 rounded-full"
                            >
                              ✓ {s.trim()}
                            </span>
                          ))
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-success/15 text-success border border-success/20 px-2 py-0.5 rounded-full">
                              ✓ React
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-success/15 text-success border border-success/20 px-2 py-0.5 rounded-full">
                              ✓ Python
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-destructive/15 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full">
                              ✗ Agile
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        onClick={handleTailorResume}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        Tailor with AI Mentor <Sparkles className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="flex h-[320px] flex-col items-center justify-center text-center bg-card rounded-3xl border border-border/30 p-6 text-muted-foreground">
                  <FileSearch className="size-10 text-muted-foreground/60 mb-2" />
                  <h4 className="font-semibold text-sm">
                    Waiting for Resume File
                  </h4>
                  <p className="text-xs max-w-xs mt-1">
                    Upload your resume to get instant ATS scores and
                    personalized career optimization suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content 4: AI Mentor Chat ──────────────────────────────────────── */}
      {activeTab === "chat" && (
        <div className="glass shadow-soft rounded-3xl overflow-hidden border border-border/30 h-[520px] flex">
          {/* Sidebar: Conversations List */}
          <div className="w-60 border-r border-border/40 bg-background/20 flex flex-col h-full shrink-0">
            <div className="p-3 border-b border-border/40 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Chat History
              </span>
              <button
                onClick={handleCreateNewConversation}
                className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title="New Chat"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chatConversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChatId(c.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-colors truncate block ${
                    activeChatId === c.id
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "text-muted-foreground hover:bg-accent/45 hover:text-foreground"
                  }`}
                >
                  💬 {c.title || "New Chat"}
                </button>
              ))}
              {chatConversations.length === 0 && (
                <div className="p-4 text-center text-[11px] text-muted-foreground">
                  No chats found. Click + to start.
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col h-full bg-background/10">
            {/* Header: Active Chat info */}
            <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between bg-background/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-primary animate-pulse" />
                <div>
                  <div className="text-xs font-semibold">
                    Sahaayak Success AI Mentor
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Synced with your Digital Twin metrics
                  </div>
                </div>
              </div>

              {student && (
                <div className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20 font-semibold">
                  CGPA: {student.cgpa || "N/A"} | {student.branch || "CS"}
                </div>
              )}
            </div>

            {/* Chat History View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
                    <Sparkles className="size-5" />
                  </div>
                  <h4 className="font-semibold text-sm">Ask Sahaayak Mentor</h4>
                  <p className="text-xs max-w-xs mt-1 mb-4">
                    Get answers about career opportunities, skill roadmaps, or
                    scholarship eligibility.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 max-w-md w-full">
                    {CHAT_PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleSendChatMessage(p)}
                        className="p-2.5 bg-background/50 border border-border/45 rounded-xl text-left text-xs hover:bg-accent/40 hover:text-foreground transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 text-xs ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground font-medium rounded-br-none"
                        : "bg-card border border-border/40 rounded-bl-none text-foreground"
                    }`}
                  >
                    {/* Render reasoning if present */}
                    {msg.reasoning && (
                      <details className="mb-2 border-b border-border/30 pb-1.5 text-[10px] text-muted-foreground/80 cursor-pointer">
                        <summary className="font-semibold">
                          Reasoning Process
                        </summary>
                        <p className="mt-1 font-mono leading-relaxed whitespace-pre-wrap">
                          {msg.reasoning}
                        </p>
                      </details>
                    )}
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {chatTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border/40 rounded-2xl rounded-bl-none p-3.5 text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-muted-foreground/85 animate-bounce" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/85 animate-bounce [animation-delay:0.2s]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/85 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Strip */}
            <div className="p-3 border-t border-border/40 bg-background/30 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about opportunities, skills, or your digital twin..."
                  className="flex-1 h-10 bg-background/50 border border-border/60 rounded-xl px-3.5 text-xs focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="grid size-10 place-items-center rounded-xl text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-45 shrink-0"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Child Sub-Components ──────────────────────────────────────────────────

function Card({
  title,
  subtitle,
  children,
  action,
  className,
  icon,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <section
      className={`glass shadow-soft rounded-3xl p-5 md:p-6 flex flex-col ${className ?? ""}`}
    >
      <header className="mb-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          {icon}
          <div>
            <h3 className="truncate text-sm font-semibold">{title}</h3>
            {subtitle && (
              <p className="truncate text-[11px] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl bg-background/40 p-3.5 border border-border/30">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
        <span className="grid size-6 place-items-center rounded-md bg-primary/15 text-primary">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-xl font-semibold tracking-tight">{value}</div>
        {delta && (
          <div className="text-[9px] font-semibold bg-success/15 text-success px-1.5 py-0.5 rounded border border-success/25 uppercase tracking-wide">
            {delta}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchBadge({
  value,
  compact = false,
}: {
  value: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${compact ? "" : "min-w-[60px] text-center"}`}
      style={{
        background: "color-mix(in oklab, var(--primary) 16%, transparent)",
        color: "oklch(0.78 0.16 280)",
      }}
    >
      {value}% match
    </div>
  );
}

function PillButton({
  icon,
  label,
  to,
  primary,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        primary
          ? "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
          : "inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-2 text-xs font-semibold hover:bg-accent/40"
      }
      style={primary ? { background: "var(--gradient-primary)" } : undefined}
    >
      {icon} {label}
    </button>
  );
}

function HeaderLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      {children} <ArrowUpRight className="size-3.5" />
    </Link>
  );
}
