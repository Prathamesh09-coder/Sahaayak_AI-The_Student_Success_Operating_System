import { createFileRoute } from "@tanstack/react-router";
import {
  Compass,
  MapPin,
  Target,
  CheckCircle2,
  Circle,
  Navigation,
  ArrowRight,
  Play,
  BookOpen,
  Trophy,
  Activity,
  Award,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CareerAPI } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

export const Route = createFileRoute("/_app/career-gps")({
  head: () => ({ meta: [{ title: "Career GPS · Sahaayak AI" }] }),
  component: CareerGPS,
});

function CareerGPS() {
  const queryClient = useQueryClient();
  const { user, student, isLoading: userLoading } = useUser();
  const [viewMode, setViewMode] = useState<"timeline" | "graph">("timeline");
  const [generating, setGenerating] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    {},
  );

  // Resolve student ID cleanly
  const studentId = student?.id || user?.id || "";

  // 1. Career Summary Query
  const {
    data: summaryRes,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["careerSummary", studentId],
    queryFn: () => CareerAPI.getSummary(studentId),
    enabled: !!studentId,
  });

  // 2. Roadmap Query
  const { data: roadmapRes, isLoading: roadmapLoading } = useQuery({
    queryKey: ["roadmap", studentId],
    queryFn: () => CareerAPI.getRoadmap(studentId),
    enabled: !!studentId,
  });

  // 3. Skill Gaps Query
  const { data: skillGapsRes, isLoading: skillGapsLoading } = useQuery({
    queryKey: ["skillGaps", studentId],
    queryFn: () => CareerAPI.getSkillGap(studentId),
    enabled: !!studentId,
  });

  // 4. Recommendations Query
  const { data: recommendationsRes, isLoading: recommendationsLoading } =
    useQuery({
      queryKey: ["recommendations", studentId],
      queryFn: () => CareerAPI.getRecommendations(studentId),
      enabled: !!studentId,
    });

  // 5. Milestones Query
  const { data: milestonesRes, isLoading: milestonesLoading } = useQuery({
    queryKey: ["milestones", studentId],
    queryFn: () => CareerAPI.getMilestones(studentId),
    enabled: !!studentId,
  });

  // 6. Progress Query
  const { data: progressRes, isLoading: progressLoading } = useQuery({
    queryKey: ["progress", studentId],
    queryFn: () => CareerAPI.getProgress(studentId),
    enabled: !!studentId,
  });

  // 7. Graph Query
  const { data: graphRes, isLoading: graphLoading } = useQuery({
    queryKey: ["graph", studentId],
    queryFn: () => CareerAPI.getGraph(studentId),
    enabled: !!studentId,
  });

  // Extract real payloads
  const summary = summaryRes?.data || {
    dream_career: "Software Engineer",
    career_match_score: 0,
    estimated_time_months: 8,
    industry_growth: "High",
    average_salary: "₹12 LPA",
    roadmap_completion: 0,
  };

  const steps = roadmapRes?.data || [];
  const skillGaps = skillGapsRes?.data || [];
  const recommendations = recommendationsRes?.data || [];
  const milestones = milestonesRes?.data || [];
  const progress = progressRes?.data || {
    roadmap_completion: 0,
    completed_steps: 0,
    total_steps: 0,
    reward_points: 0,
  };
  const graphData = graphRes?.data || { nodes: [], edges: [] };

  // Set up WebSockets for real-time invalidations
  useEffect(() => {
    if (!studentId) return;

    const wsUrl = `ws://localhost:8000/api/v1/career-gps/ws/career-gps/${studentId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("[WebSocket] Connected to Career GPS live updates.");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WebSocket] Event received:", data);

        if (data.event) {
          // Invalidate React Query cache to fetch fresh data automatically
          queryClient.invalidateQueries({
            queryKey: ["careerSummary", studentId],
          });
          queryClient.invalidateQueries({ queryKey: ["roadmap", studentId] });
          queryClient.invalidateQueries({ queryKey: ["skillGaps", studentId] });
          queryClient.invalidateQueries({
            queryKey: ["milestones", studentId],
          });
          queryClient.invalidateQueries({ queryKey: ["progress", studentId] });
          queryClient.invalidateQueries({
            queryKey: ["recommendations", studentId],
          });
          queryClient.invalidateQueries({ queryKey: ["graph", studentId] });

          if (data.event === "step.completed") {
            toast.success(
              `Step marked ${data.payload.status === "completed" ? "complete" : "pending"}!`,
            );
          } else if (data.event === "roadmap.updated") {
            toast.info("Roadmap status updated.");
          } else if (data.event === "milestone.completed") {
            toast.success(`🏆 Milestone Achieved: ${data.payload.title}!`);
          }
        }
      } catch (err) {
        console.error("[WebSocket] Failed to parse event message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
    };

    socket.onclose = () => {
      console.log("[WebSocket] Connection closed.");
    };

    return () => {
      socket.close();
    };
  }, [studentId, queryClient]);

  // Expand/collapse timeline steps
  const toggleExpandStep = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  // Trigger AI roadmap generation
  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    try {
      const res = await CareerAPI.generateRoadmap({
        student_id: studentId,
      });
      if (res.success) {
        toast.success("AI Career Success Route Calculated!");
        queryClient.invalidateQueries({ queryKey: ["roadmap", studentId] });
        queryClient.invalidateQueries({
          queryKey: ["careerSummary", studentId],
        });
        queryClient.invalidateQueries({ queryKey: ["skillGaps", studentId] });
        queryClient.invalidateQueries({ queryKey: ["milestones", studentId] });
        queryClient.invalidateQueries({ queryKey: ["progress", studentId] });
        queryClient.invalidateQueries({
          queryKey: ["recommendations", studentId],
        });
        queryClient.invalidateQueries({ queryKey: ["graph", studentId] });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  // Toggle step completion status
  const handleToggleStep = async (stepId: string) => {
    try {
      await CareerAPI.updateStep(stepId, studentId);
      // Let WebSocket handle the query invalidation and success toast
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update step status.");
    }
  };

  // Loading Screen
  if (userLoading || summaryLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="h-28 bg-card/50 rounded-3xl w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="h-40 bg-card/50 rounded-3xl" />
            <div className="h-80 bg-card/50 rounded-3xl" />
          </div>
          <div className="h-[600px] bg-card/50 rounded-3xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  // Error Screen
  if (summaryError) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-center p-8 glass-strong rounded-3xl border border-border/50 max-w-md shadow-2xl">
          <div className="size-16 bg-destructive/10 text-destructive rounded-2xl grid place-items-center mx-auto mb-4 shadow-glow">
            <AlertTriangle className="size-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Unable to load Career GPS</h3>
          <p className="text-sm text-muted-foreground mb-6">
            There was a problem connecting to the real-time career systems.
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

  // Empty State (No Roadmap generated yet)
  const showEmptyState = steps.length === 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Career Header Card (Premium Hero Section) */}
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8 border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 pointer-events-none" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-glow">
              <Compass className="size-8" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-primary">
                AI Success Navigator
              </p>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl mt-0.5">
                Career GPS
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Personalized, turn-by-turn routing to land your dream role.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-background/40 backdrop-blur-md rounded-2xl p-3 border border-border/40">
              <div>
                <span className="text-xs text-muted-foreground block">
                  Dream Career
                </span>
                <span className="font-semibold text-sm">
                  {summary.dream_career}
                </span>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div>
                <span className="text-xs text-muted-foreground block">
                  Growth
                </span>
                <span className="font-semibold text-sm text-green-400">
                  {summary.industry_growth}
                </span>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div>
                <span className="text-xs text-muted-foreground block">
                  Avg Salary
                </span>
                <span className="font-semibold text-sm text-primary">
                  {summary.average_salary}
                </span>
              </div>
            </div>

            {!showEmptyState && (
              <Button
                onClick={handleGenerateRoadmap}
                disabled={generating}
                className="rounded-full shadow-glow hover:scale-105 active:scale-95 transition-all"
                style={{ background: "var(--gradient-primary)" }}
              >
                {generating ? (
                  <>
                    <Activity className="size-4 mr-2 animate-spin" />{" "}
                    Recalculating...
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-4 mr-2" /> Recalculate Route
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {showEmptyState ? (
        /* Empty State */
        <div className="min-h-[50vh] grid place-items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-10 glass rounded-3xl border border-border/40 max-w-lg shadow-2xl"
          >
            <div className="size-20 bg-primary/10 text-primary rounded-3xl grid place-items-center mx-auto mb-6 shadow-glow">
              <Sparkles className="size-10" />
            </div>
            <h3 className="text-2xl font-extrabold mb-3 text-foreground">
              No roadmap yet
            </h3>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Unlock your personalized AI-powered career roadmap. We will
              analyze your skills, CGPA, and interests to generate a tailored
              navigation plan to your dream career of{" "}
              <span className="font-bold text-foreground">
                {summary.dream_career}
              </span>
              .
            </p>
            <Button
              onClick={handleGenerateRoadmap}
              disabled={generating}
              size="lg"
              className="rounded-full shadow-glow px-8 py-6 text-base font-semibold hover:scale-105 active:scale-95 transition-all"
              style={{ background: "var(--gradient-primary)" }}
            >
              {generating ? (
                <>
                  <Activity className="size-5 mr-2 animate-spin" /> Computing
                  Success Route...
                </>
              ) : (
                <>
                  <Sparkles className="size-5 mr-2" /> Generate your AI Roadmap
                </>
              )}
            </Button>
          </motion.div>
        </div>
      ) : (
        /* Dynamic Layout */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sidebar Area: Progress, Skill Gaps, AI Recommendations */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            {/* Dynamic Progress Circular Card */}
            <Card title="Route Progress">
              <div className="flex items-center gap-6 p-2">
                <div className="relative size-24 shrink-0">
                  {/* Radial Progress Ring */}
                  <svg
                    className="size-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-muted/30"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <motion.path
                      className="text-primary"
                      strokeWidth="3.5"
                      strokeDasharray={`${progress.roadmap_completion}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      initial={{ pathLength: 0 }}
                      animate={{
                        pathLength: progress.roadmap_completion / 100,
                      }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground">
                      {progress.roadmap_completion}%
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold">
                      Done
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    On Track to Destination
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed{" "}
                    <span className="text-foreground font-semibold">
                      {progress.completed_steps}
                    </span>{" "}
                    of{" "}
                    <span className="text-foreground font-semibold">
                      {progress.total_steps}
                    </span>{" "}
                    milestones.
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 bg-yellow-500/10 text-yellow-500 rounded-full px-2.5 py-1 text-[10px] font-bold border border-yellow-500/20 w-fit shadow-glow">
                    <Trophy className="size-3.5" />
                    <span>{progress.reward_points} XP Earned</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Target Destination & Readiness */}
            <Card
              title="Destination Match"
              icon={<Target className="size-4 text-primary" />}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold text-foreground">
                    {summary.dream_career}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Estimated Time: {summary.estimated_time_months} Months
                  </p>
                </div>
                <div className="bg-primary/15 text-primary rounded-2xl px-3 py-2 text-center border border-primary/20 shadow-glow">
                  <div className="text-lg font-black">
                    {summary.career_match_score}%
                  </div>
                  <div className="text-[8px] uppercase font-bold tracking-wider">
                    Match Score
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Skill Gap Dashboard */}
            <Card title="Skill Gap Dashboard" className="flex-1">
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {skillGaps.map((item: any, idx: number) => {
                  // Color rules
                  let priorityColor =
                    "bg-green-500/10 text-green-400 border-green-500/20";
                  let barColor = "bg-green-500";
                  if (item.priority === "CRITICAL") {
                    priorityColor =
                      "bg-red-500/15 text-red-400 border-red-500/20";
                    barColor = "bg-red-500";
                  } else if (item.priority === "HIGH") {
                    priorityColor =
                      "bg-orange-500/15 text-orange-400 border-orange-500/20";
                    barColor = "bg-orange-500";
                  } else if (item.priority === "MEDIUM") {
                    priorityColor =
                      "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
                    barColor = "bg-yellow-500";
                  }

                  const widthPercent =
                    (item.current_level / item.required_level) * 100;

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-background/30 rounded-2xl border border-border/40 hover:border-border transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm text-foreground">
                          {item.skill}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Current: {item.current_level}/10</span>
                        <span>Req: {item.required_level}/10</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 5. Milestone Tracker Gamification */}
            <Card
              title="Unlocked Achievements"
              icon={<Award className="size-4 text-primary" />}
            >
              <div className="space-y-2">
                {milestones.map((ms: any, i: number) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      ms.completed
                        ? "bg-yellow-500/5 border-yellow-500/25 text-foreground"
                        : "bg-background/20 border-border/40 text-muted-foreground opacity-60"
                    }`}
                  >
                    <div
                      className={`grid size-9 place-items-center rounded-xl ${
                        ms.completed
                          ? "bg-yellow-500/15 text-yellow-500 shadow-glow"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Trophy className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{ms.title}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {ms.completed
                          ? `Unlocked at ${ms.completed_at}`
                          : `Gain +${ms.reward_points} XP`}
                      </p>
                    </div>
                    {ms.completed && (
                      <span className="text-[9px] font-black uppercase text-yellow-500 tracking-wider">
                        Unlocked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Area: Navigation Route Timeline or Graph View */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* 3. Dynamic AI Roadmap Timeline / Graph View */}
            <Card
              title="Navigation Route"
              className="flex-1 flex flex-col min-h-[600px]"
              icon={<Navigation className="size-4 text-primary" />}
              headerAction={
                <div className="flex bg-background/60 backdrop-blur-md rounded-full p-1 border border-border">
                  <button
                    onClick={() => setViewMode("timeline")}
                    className={`text-xs px-4 py-1.5 rounded-full transition-all ${
                      viewMode === "timeline"
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Timeline Route
                  </button>
                  <button
                    onClick={() => setViewMode("graph")}
                    className={`text-xs px-4 py-1.5 rounded-full transition-all ${
                      viewMode === "graph"
                        ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Interactive Graph
                  </button>
                </div>
              }
            >
              {viewMode === "timeline" ? (
                <div className="relative pl-6 mt-4 overflow-y-auto flex-1 max-h-[580px] pr-2">
                  {/* Vertical Route Line */}
                  <div className="absolute left-9 top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary to-purple-500/10" />

                  <div className="space-y-6 pb-6">
                    <AnimatePresence>
                      {steps.map((step: any, idx: number) => {
                        const isExpanded = !!expandedSteps[step.id];
                        const isCompleted = step.status === "completed";
                        const isInProgress = step.status === "in_progress";

                        return (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={step.id}
                            className={`relative flex items-start gap-4 transition-all ${
                              isCompleted ? "opacity-80" : "opacity-100"
                            }`}
                          >
                            {/* Bullet Dot */}
                            <div className="z-10 grid size-6 place-items-center bg-background rounded-full mt-3 shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="size-6 text-primary shadow-glow rounded-full" />
                              ) : isInProgress ? (
                                <div className="size-5 rounded-full border-2 border-primary bg-background shadow-[0_0_10px_var(--primary)]" />
                              ) : (
                                <Circle
                                  className="size-5 text-muted-foreground hover:text-primary cursor-pointer"
                                  onClick={() => handleToggleStep(step.id)}
                                />
                              )}
                            </div>

                            {/* Timeline Step Card */}
                            <div
                              className={`flex-1 rounded-2xl border p-4 backdrop-blur-md transition-all ${
                                isCompleted
                                  ? "border-primary/20 bg-primary/5"
                                  : isInProgress
                                    ? "border-purple-500/30 bg-purple-500/5 shadow-glow"
                                    : "border-border/40 bg-background/20"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-bold uppercase">
                                      {step.month}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                      <Calendar className="size-3" />{" "}
                                      {step.estimated_days} Days
                                    </span>
                                  </div>
                                  <h4
                                    className={`font-bold text-base mt-2 ${
                                      isCompleted
                                        ? "line-through text-muted-foreground"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {step.title}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <Button
                                    size="sm"
                                    variant={
                                      isCompleted ? "outline" : "default"
                                    }
                                    onClick={() => handleToggleStep(step.id)}
                                    className="h-8 rounded-full text-xs"
                                  >
                                    {isCompleted ? "Completed" : "Mark Done"}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => toggleExpandStep(step.id)}
                                    className="size-8 rounded-full"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="size-4" />
                                    ) : (
                                      <ChevronDown className="size-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Expandable Section */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-4 pt-4 border-t border-border/50 space-y-3 text-sm"
                                  >
                                    <p className="text-muted-foreground leading-relaxed">
                                      {step.description}
                                    </p>

                                    {/* Resources */}
                                    {step.resources &&
                                      step.resources.length > 0 && (
                                        <div className="space-y-2">
                                          <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                                            Recommended Learning resources
                                          </h5>
                                          <div className="grid gap-2 sm:grid-cols-2">
                                            {step.resources.map(
                                              (res: any, rIdx: number) => (
                                                <a
                                                  key={rIdx}
                                                  href={res.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-2 p-2.5 bg-background/50 rounded-xl border border-border/40 hover:border-primary/30 transition-all text-xs"
                                                >
                                                  <BookOpen className="size-4 text-primary shrink-0" />
                                                  <div className="min-w-0">
                                                    <p className="font-bold text-foreground truncate">
                                                      {res.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                      {res.provider}
                                                    </p>
                                                  </div>
                                                  <ArrowRight className="size-3.5 text-muted-foreground ml-auto shrink-0" />
                                                </a>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Notes Field */}
                                    <div className="bg-background/30 rounded-xl p-3 border border-border/20 text-xs">
                                      <span className="font-bold text-foreground block mb-1">
                                        Mentor Insights:
                                      </span>
                                      <p className="text-muted-foreground">
                                        Complete the lab project to earn extra
                                        XP and automatically unlock the
                                        milestones.
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                /* 4. Graph View (Dynamic ReactFlow) */
                <div className="w-full h-full min-h-[500px] flex-1 rounded-2xl overflow-hidden border border-border/40 mt-4 relative">
                  <ReactFlow
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    fitView
                    style={{ background: "#0b0f19" }}
                  >
                    <Background color="#1e293b" gap={16} />
                    <Controls className="fill-foreground bg-card border-border" />
                  </ReactFlow>
                </div>
              )}
            </Card>

            {/* 6. AI Recommendations Panel */}
            <Card
              title="AI Recommendations & Career Steps"
              icon={<Sparkles className="size-4 text-primary" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendations.map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-background/40 backdrop-blur-md rounded-2xl border border-border/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                          {rec.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4 rounded-full text-xs w-fit border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      Take Action <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
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
