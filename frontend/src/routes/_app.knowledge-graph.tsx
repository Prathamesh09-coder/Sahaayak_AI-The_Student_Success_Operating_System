import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Network,
  Search,
  Filter,
  Maximize2,
  Share2,
  User,
  Target,
  Award,
  BookOpen,
  Gift,
  Zap,
  Users,
  Globe,
  Trophy,
  Sparkles,
  RefreshCw,
  Play,
  ArrowRight,
  Brain,
  Compass,
  Coins,
  ChevronRight,
  Info,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KnowledgeGraphAPI } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

// Custom node components for React Flow
const StudentNode = ({ data }: any) => (
  <div className="relative p-4 rounded-2xl border border-indigo-500/40 bg-background/70 backdrop-blur-md shadow-[0_0_25px_rgba(99,102,241,0.25)] text-center w-[190px]">
    <div className="mx-auto size-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 mb-2">
      <User className="size-6 animate-pulse" />
    </div>
    <div className="font-bold text-sm truncate text-foreground">
      {data.name || "Student"}
    </div>
    <div className="text-[10px] text-muted-foreground mb-2">Student Center</div>

    <div className="grid grid-cols-2 gap-1 text-[9px] border-t border-border/50 pt-2 mt-1">
      <div>
        <span className="text-muted-foreground block">Success Index</span>
        <span className="font-bold text-indigo-400">
          {data.success_score ? Math.round(data.success_score) : 75}%
        </span>
      </div>
      <div>
        <span className="text-muted-foreground block">Completeness</span>
        <span className="font-bold text-emerald-400">
          {data.profile_completeness
            ? Math.round(data.profile_completeness)
            : 80}
          %
        </span>
      </div>
    </div>

    <Handle
      type="source"
      position={Position.Top}
      id="s-top"
      className="!bg-indigo-500"
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="s-bottom"
      className="!bg-indigo-500"
    />
    <Handle
      type="source"
      position={Position.Left}
      id="s-left"
      className="!bg-indigo-500"
    />
    <Handle
      type="source"
      position={Position.Right}
      id="s-right"
      className="!bg-indigo-500"
    />
  </div>
);

const CareerNode = ({ data }: any) => (
  <div className="relative p-3 rounded-xl border border-blue-500/30 bg-background/70 backdrop-blur-md shadow-lg w-[160px] hover:border-blue-500 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1">
      <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
        <Target className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs truncate text-foreground">
          {data.name || "Dream Career"}
        </div>
        <div className="text-[9px] text-muted-foreground">Career Goal</div>
      </div>
    </div>
    <div className="text-[10px] bg-blue-500/5 text-blue-400 font-medium px-2 py-0.5 rounded border border-blue-500/10 inline-block mt-1">
      Match: {data.match_score ? Math.round(data.match_score) : 75}%
    </div>
    <Handle type="target" position={Position.Top} className="!bg-blue-500" />
    <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
  </div>
);

const SkillNode = ({ data }: any) => (
  <div className="relative p-3 rounded-xl border border-emerald-500/30 bg-background/70 backdrop-blur-md shadow-lg w-[150px] hover:border-emerald-500 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1">
      <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
        <Award className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs truncate text-foreground">
          {data.name || "Skill"}
        </div>
        <div className="text-[9px] text-muted-foreground">Target Skill</div>
      </div>
    </div>
    <div className="text-[9px] text-emerald-400 mt-1 flex justify-between">
      <span>Proficiency:</span>
      <span className="font-bold">{data.proficiency || "Intermediate"}</span>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
    <Handle
      type="source"
      position={Position.Bottom}
      className="!bg-emerald-500"
    />
  </div>
);

const CourseNode = ({ data }: any) => (
  <div className="relative p-3 rounded-xl border border-amber-500/30 bg-background/70 backdrop-blur-md shadow-lg w-[170px] hover:border-amber-500 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1">
      <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
        <BookOpen className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="font-bold text-xs truncate text-foreground"
          title={data.title}
        >
          {data.title || "Course"}
        </div>
        <div className="text-[9px] text-muted-foreground truncate">
          {data.provider || "Provider"}
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between text-[9px] text-amber-400 mt-1">
      <span>{data.duration || "Self-paced"}</span>
      <span className="px-1.5 py-0.2 bg-amber-500/10 rounded">
        {data.difficulty || "Medium"}
      </span>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-amber-500" />
  </div>
);

const ScholarshipNode = ({ data }: any) => (
  <div className="relative p-3 rounded-xl border border-rose-500/30 bg-background/70 backdrop-blur-md shadow-lg w-[165px] hover:border-rose-500 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1">
      <div className="size-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
        <Gift className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="font-bold text-xs truncate text-foreground"
          title={data.title}
        >
          {data.title || "Scholarship"}
        </div>
        <div className="text-[9px] text-muted-foreground">Financial Aid</div>
      </div>
    </div>
    <div className="flex items-center justify-between text-[9px] text-rose-400 mt-1">
      <span className="font-bold">{data.amount || "Variable"}</span>
      <span>Due: {data.deadline || "TBA"}</span>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-rose-500" />
  </div>
);

const OpportunityNode = ({ data }: any) => (
  <div className="relative p-3 rounded-xl border border-purple-500/30 bg-background/70 backdrop-blur-md shadow-lg w-[160px] hover:border-purple-500 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1">
      <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
        <Zap className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="font-bold text-xs truncate text-foreground"
          title={data.title}
        >
          {data.title || "Opportunity"}
        </div>
        <div className="text-[9px] text-muted-foreground truncate">
          {data.company || "Company"}
        </div>
      </div>
    </div>
    <div className="text-[9px] text-purple-400 mt-1">
      <span className="px-1.5 py-0.5 bg-purple-500/10 rounded">
        {data.type || "Internship"}
      </span>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-purple-500" />
  </div>
);

const MentorNode = ({ data }: any) => (
  <div className="relative p-3 rounded-xl border border-teal-500/30 bg-background/70 backdrop-blur-md shadow-lg w-[150px] hover:border-teal-500 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1">
      <div className="size-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
        <Users className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs truncate text-foreground">
          {data.name || "Mentor"}
        </div>
        <div className="text-[9px] text-muted-foreground truncate">
          {data.company || "Company"}
        </div>
      </div>
    </div>
    <div className="text-[9px] text-teal-400 mt-1 flex justify-between">
      <span>Match:</span>
      <span className="font-bold">
        {data.match_score ? Math.round(data.match_score) : 85}%
      </span>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-teal-500" />
  </div>
);

const CommunityNode = ({ data }: any) => (
  <div className="relative p-3 rounded-xl border border-cyan-500/30 bg-background/70 backdrop-blur-md shadow-lg w-[150px] hover:border-cyan-500 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1">
      <div className="size-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
        <Globe className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs truncate text-foreground">
          {data.name || "Community"}
        </div>
        <div className="text-[9px] text-muted-foreground">Student Hub</div>
      </div>
    </div>
    <div className="text-[9px] text-cyan-400 mt-1 flex justify-between">
      <span>Members:</span>
      <span className="font-bold">{data.members || 0}</span>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
  </div>
);

const SuccessstoryNode = ({ data }: any) => (
  <div className="relative p-3 rounded-xl border border-yellow-500/30 bg-background/70 backdrop-blur-md shadow-lg w-[160px] hover:border-yellow-500 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1">
      <div className="size-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
        <Trophy className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="font-bold text-xs truncate text-foreground"
          title={data.title}
        >
          {data.title || "Success Story"}
        </div>
        <div className="text-[9px] text-muted-foreground">Alumni Path</div>
      </div>
    </div>
    <div className="text-[9px] text-yellow-400 mt-1">
      <span className="font-semibold">Company: {data.company || "Alumni"}</span>
    </div>
    <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
  </div>
);

const nodeTypes = {
  student: StudentNode,
  career: CareerNode,
  skill: SkillNode,
  course: CourseNode,
  scholarship: ScholarshipNode,
  opportunity: OpportunityNode,
  mentor: MentorNode,
  community: CommunityNode,
  successstory: SuccessstoryNode,
};

// Orbital math distribution engine
function layoutGraph(rawNodes: any[], rawEdges: any[]) {
  if (!rawNodes || rawNodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes = rawNodes.map((n) => ({ ...n }));
  const edges = rawEdges.map((e) => ({ ...e }));

  const studentNode = nodes.find((n) => n.type === "student");
  if (!studentNode) return { nodes, edges };

  const centerX = 500;
  const centerY = 400;

  studentNode.position = { x: centerX - 95, y: centerY - 65 }; // Adjust for node center offset

  // Find all direct children of the student node (Inner Ring)
  const innerNodeIds = new Set<string>();
  edges.forEach((edge) => {
    if (edge.source === studentNode.id) {
      innerNodeIds.add(edge.target);
    } else if (edge.target === studentNode.id) {
      innerNodeIds.add(edge.source);
    }
  });

  const innerNodes = nodes.filter(
    (n) => n.id !== studentNode.id && innerNodeIds.has(n.id),
  );
  const outerNodes = nodes.filter(
    (n) => n.id !== studentNode.id && !innerNodeIds.has(n.id),
  );

  // Position Inner Ring
  const R1 = 230; // Radius for inner orbit
  const numInner = innerNodes.length;
  const innerAngles: Record<string, number> = {};

  innerNodes.forEach((node, idx) => {
    // Distribute evenly in a circle
    const angle = (idx * 2 * Math.PI) / (numInner || 1);
    innerAngles[node.id] = angle;
    node.position = {
      x: centerX + R1 * Math.cos(angle) - 80, // Offset half of node width
      y: centerY + R1 * Math.sin(angle) - 40, // Offset half of node height
    };
  });

  // Position Outer Ring (e.g. Courses connected to Skills)
  const parentToChildren: Record<string, any[]> = {};
  outerNodes.forEach((node) => {
    // Find parent skill or node that this is connected to
    const edge = edges.find(
      (e) =>
        (e.source === node.id && innerNodeIds.has(e.target)) ||
        (e.target === node.id && innerNodeIds.has(e.source)),
    );
    const parentId = edge
      ? innerNodeIds.has(edge.source)
        ? edge.source
        : edge.target
      : null;
    if (parentId) {
      if (!parentToChildren[parentId]) parentToChildren[parentId] = [];
      parentToChildren[parentId].push(node);
    } else {
      if (!parentToChildren["default"]) parentToChildren["default"] = [];
      parentToChildren["default"].push(node);
    }
  });

  const R2 = 390; // Radius for outer orbit
  Object.entries(parentToChildren).forEach(([parentId, children]) => {
    if (parentId === "default") {
      children.forEach((node, idx) => {
        const angle = (idx * 2 * Math.PI) / (children.length || 1);
        node.position = {
          x: centerX + R2 * Math.cos(angle) - 85,
          y: centerY + R2 * Math.sin(angle) - 40,
        };
      });
    } else {
      const parentAngle = innerAngles[parentId] || 0;
      const numChildren = children.length;
      children.forEach((node, idx) => {
        // Spread children radially around parent angle
        const angleOffset =
          numChildren > 1
            ? (idx - (numChildren - 1) / 2) * 0.35 // spread offset
            : 0;
        const angle = parentAngle + angleOffset;
        node.position = {
          x: centerX + R2 * Math.cos(angle) - 85,
          y: centerY + R2 * Math.sin(angle) - 40,
        };
      });
    }
  });

  // Beautify Edges
  edges.forEach((edge) => {
    edge.animated = edge.label === "REQUIRES" || edge.label === "TARGETS";
    edge.style = {
      stroke: edge.animated
        ? "rgba(99, 102, 241, 0.6)"
        : "rgba(148, 163, 184, 0.3)",
      strokeWidth: edge.animated ? 2.5 : 1.5,
    };
    edge.markerEnd = {
      type: MarkerType.ArrowClosed,
      width: 12,
      height: 12,
      color: edge.animated ? "#6366f1" : "#94a3b8",
    };
  });

  return { nodes, edges };
}

export const Route = createFileRoute("/_app/knowledge-graph")({
  head: () => ({ meta: [{ title: "Student Success Universe · Sahaayak AI" }] }),
  component: KnowledgeGraph,
});

const FILTER_OPTIONS = [
  {
    type: "career",
    label: "Careers",
    icon: Target,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    type: "skill",
    label: "Skills",
    icon: Award,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    type: "course",
    label: "Courses",
    icon: BookOpen,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    type: "scholarship",
    label: "Scholarships",
    icon: Gift,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
  {
    type: "opportunity",
    label: "Opportunities",
    icon: Zap,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  {
    type: "mentor",
    label: "Mentors",
    icon: Users,
    color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
  },
  {
    type: "community",
    label: "Communities",
    icon: Globe,
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    type: "successstory",
    label: "Success Stories",
    icon: Trophy,
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  },
];

const LOADING_STEPS = [
  "Reading student profile and career aspirations...",
  "Constructing core skill nodes and curriculum connections...",
  "Mapping mentor relationships and community hubs...",
  "Synthesizing scholarship eligibility and opportunity match...",
  "Rendering interactive success universe graph...",
];

function KnowledgeGraph() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, student, isLoading: userLoading } = useUser();
  const studentId = student?.id || user?.id || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // 1. Fetch Knowledge Graph Data
  const {
    data: graphRes,
    isLoading: graphLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["knowledge-graph", studentId],
    queryFn: () => KnowledgeGraphAPI.getGraph(studentId),
    enabled: !!studentId,
  });

  const rawNodes = graphRes?.data?.nodes || [];
  const rawEdges = graphRes?.data?.edges || [];
  const insights = graphRes?.data?.insights || [];
  const recommendations = graphRes?.data?.recommendations || [];

  // Setup WebSockets for Real-Time Invalidations
  useEffect(() => {
    if (!studentId) return;
    const wsUrl = `ws://localhost:8000/api/v1/knowledge-graph/ws/knowledge-graph/${studentId}`;
    console.log("Connecting to Knowledge Graph WebSocket...", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket event received:", data);
        if (data.event === "knowledge_graph.updated") {
          toast.info("Knowledge Graph updated in real-time.", { icon: "🔮" });
          queryClient.invalidateQueries({
            queryKey: ["knowledge-graph", studentId],
          });
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.log("Knowledge Graph WebSocket connection closed.");
    };

    return () => {
      ws.close();
    };
  }, [studentId, queryClient]);

  // Loading Steps Incrementor
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      interval = setInterval(() => {
        setLoadingStep((prev) =>
          prev < LOADING_STEPS.length - 1 ? prev + 1 : prev,
        );
      }, 1800);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  // Apply Orbital Layout
  const laidOutGraph = useMemo(() => {
    return layoutGraph(rawNodes, rawEdges);
  }, [rawNodes, rawEdges]);

  // Initialize React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync laid out nodes/edges to state when they change
  useEffect(() => {
    if (laidOutGraph.nodes.length > 0) {
      setNodes(laidOutGraph.nodes);
      setEdges(laidOutGraph.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [laidOutGraph, setNodes, setEdges]);

  // Handle Generate Request
  const handleGenerateGraph = async () => {
    if (!studentId) return;
    setGenerating(true);
    try {
      const res = await KnowledgeGraphAPI.generateGraph(studentId);
      if (res.success) {
        toast.success("Success Universe Synthesized!");
        queryClient.invalidateQueries({
          queryKey: ["knowledge-graph", studentId],
        });
      }
    } catch (err: any) {
      console.error("Failed to generate graph:", err);
      toast.error(err.message || "Could not synthesize Success Universe");
    } finally {
      setGenerating(false);
    }
  };

  // Toggle filter logic
  const handleToggleFilter = (type: string) => {
    setSelectedFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  // Filter nodes and edges reactively
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (node.type === "student") return true; // Student node is always visible

      const matchesSearch =
        searchQuery === "" ||
        node.data.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.type?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilters.length === 0 || selectedFilters.includes(node.type);

      return matchesSearch && matchesFilter;
    });
  }, [nodes, searchQuery, selectedFilters]);

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes],
  );

  const filteredEdges = useMemo(() => {
    return edges.filter(
      (edge) =>
        filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
    );
  }, [edges, filteredNodeIds]);

  // Compute node type counts for pills
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rawNodes.forEach((n) => {
      if (n.type) {
        counts[n.type] = (counts[n.type] || 0) + 1;
      }
    });
    return counts;
  }, [rawNodes]);

  // Compute KPI aggregated stats
  const kpis = useMemo(() => {
    const studentNode = rawNodes.find((n) => n.type === "student");
    const successScore = studentNode?.data?.success_score || 75.0;

    const careerNode = rawNodes.find((n) => n.type === "career");
    const careerMatch = careerNode?.data?.match_score || 78.0;

    const totalSkills = rawNodes.filter((n) => n.type === "skill").length;
    // Count how many HAS_SKILL edges exist in the graph
    const acquiredSkills = rawEdges.filter(
      (e) => e.label === "HAS_SKILL",
    ).length;

    const growthNodesCount = rawNodes.filter((n) =>
      ["course", "scholarship", "opportunity", "mentor"].includes(n.type),
    ).length;

    return {
      successScore,
      careerMatch,
      totalSkills,
      acquiredSkills,
      growthNodes: growthNodesCount,
    };
  }, [rawNodes, rawEdges]);

  const isGraphEmpty = rawNodes.length <= 1; // Only contains student or completely empty

  if (userLoading || graphLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <Brain className="size-14 text-primary animate-bounce relative z-10" />
        </div>
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Loading Success Universe...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
      {/* Header Panel */}
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-5 md:p-6 shrink-0 border border-white/10">
        <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
              <Network className="size-6 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl flex items-center gap-2 text-foreground">
                Success Universe
                <span className="text-[10px] bg-primary/20 text-primary-foreground px-2 py-0.5 rounded-full border border-primary/30 font-semibold tracking-wide uppercase">
                  Neo4j Active
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Explore your personalized education, skills, and opportunity
                orbital ecosystem.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                className="pl-9 rounded-xl h-10 bg-background/50 border-border/50 w-full sm:w-[220px] focus:ring-primary focus:border-primary text-xs"
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerateGraph}
              disabled={generating || isRefetching}
              variant="outline"
              size="sm"
              className="rounded-xl h-10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 gap-2 font-medium"
            >
              <RefreshCw
                className={`size-4 ${generating || isRefetching ? "animate-spin" : ""}`}
              />
              Sync Graph
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      {generating ? (
        <div className="flex-1 glass shadow-soft rounded-3xl relative overflow-hidden flex flex-col items-center justify-center bg-background/50 border border-white/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="max-w-md w-full text-center space-y-6 px-6 relative z-10">
            <div className="relative size-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-emerald-500/10 border-b-emerald-500 animate-spin [animation-duration:3s]" />
              <Brain className="size-8 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                Synthesizing Success Universe
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Please wait while Sahaayak AI aligns your credentials, career
                aspirations, and milestones.
              </p>
            </div>

            {/* Steps Visualizer */}
            <div className="space-y-2 text-left bg-muted/30 p-4 rounded-2xl border border-border/40">
              {LOADING_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div
                    className={`size-4 rounded-full flex items-center justify-center text-[8px] font-bold border ${
                      loadingStep > idx
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : loadingStep === idx
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse"
                          : "bg-muted border-border/50 text-muted-foreground"
                    }`}
                  >
                    {loadingStep > idx ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`${loadingStep === idx ? "text-indigo-400 font-semibold" : loadingStep > idx ? "text-foreground/80" : "text-muted-foreground"}`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : isGraphEmpty ? (
        // Empty State: Your Success Universe is still forming
        <div className="flex-1 glass shadow-soft rounded-3xl relative overflow-hidden flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-background to-background border border-white/5 p-6 text-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="max-w-md space-y-6 relative z-10">
            <div className="mx-auto size-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.15)] animate-pulse">
              <Network className="size-10 text-indigo-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Your Success Universe is still forming
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Your educational ecosystem connects your profile with career
                roadmaps, skill milestones, scholarships, and expert mentors.
                Run the synthesizer to chart your personalized universe.
              </p>
            </div>

            <Button
              onClick={handleGenerateGraph}
              className="rounded-xl h-11 px-8 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 gap-2"
            >
              <Sparkles className="size-4 animate-spin [animation-duration:6s]" />
              Synthesize Success Universe
            </Button>
          </div>
        </div>
      ) : (
        // Active Knowledge Graph Dashboard Layout
        <div className="flex-1 flex gap-4 min-h-0 relative">
          {/* Main Visualizer Area */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* KPI statistics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
              <div className="glass shadow-soft p-3 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all duration-300 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/15 shrink-0">
                  <Brain className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block truncate">
                    Success Index
                  </span>
                  <span className="text-base font-bold text-foreground leading-tight">
                    {Math.round(kpis.successScore)}%
                  </span>
                </div>
              </div>

              <div className="glass shadow-soft p-3 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all duration-300 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/15 shrink-0">
                  <Target className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block truncate">
                    Career Fit
                  </span>
                  <span className="text-base font-bold text-foreground leading-tight">
                    {Math.round(kpis.careerMatch)}%
                  </span>
                </div>
              </div>

              <div className="glass shadow-soft p-3 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/15 shrink-0">
                  <Award className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block truncate">
                    Skills Canopy
                  </span>
                  <span className="text-base font-bold text-foreground leading-tight">
                    {kpis.acquiredSkills}/{kpis.totalSkills}
                  </span>
                </div>
              </div>

              <div className="glass shadow-soft p-3 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all duration-300 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/15 shrink-0">
                  <Activity className="size-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground block truncate">
                    Growth Nodes
                  </span>
                  <span className="text-base font-bold text-foreground leading-tight">
                    {kpis.growthNodes} Active
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Pills Area */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
              <div className="flex gap-2">
                <Button
                  variant={selectedFilters.length === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilters([])}
                  className="rounded-full text-[10px] h-8 font-semibold px-4"
                >
                  All Entities
                </Button>
                {FILTER_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedFilters.includes(opt.type);
                  const count = typeCounts[opt.type] || 0;
                  return (
                    <Button
                      key={opt.type}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleFilter(opt.type)}
                      className={`rounded-full text-[10px] h-8 gap-1.5 font-semibold px-4 ${
                        !isSelected
                          ? "hover:bg-background/80 border-border/40 bg-background/40"
                          : ""
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {opt.label}
                      <span
                        className={`ml-1 px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {count}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Canvas Container */}
            <div className="flex-1 glass shadow-soft rounded-3xl relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background/90 via-background to-muted/25 border border-white/5">
              <ReactFlow
                nodes={filteredNodes}
                edges={filteredEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.2}
                maxZoom={1.5}
                className="w-full h-full"
              >
                {/* Visual Enhancements */}
                <Background
                  gap={24}
                  size={1.2}
                  color="rgba(148, 163, 184, 0.15)"
                />
                <Controls className="!bg-background/80 !border-border/50 !rounded-2xl !p-1 backdrop-blur-md shadow-lg" />
                <MiniMap
                  nodeStrokeColor={() => "#6366f1"}
                  nodeColor={(node) => {
                    if (node.type === "student") return "#6366f1";
                    if (node.type === "career") return "#3b82f6";
                    if (node.type === "skill") return "#10b981";
                    if (node.type === "course") return "#f59e0b";
                    if (node.type === "scholarship") return "#f43f5e";
                    if (node.type === "opportunity") return "#a855f7";
                    if (node.type === "mentor") return "#14b8a6";
                    if (node.type === "community") return "#06b6d4";
                    return "#e2e8f0";
                  }}
                  maskColor="rgba(0, 0, 0, 0.4)"
                  className="!bg-background/80 !border-border/50 !rounded-2xl !overflow-hidden backdrop-blur-md shadow-lg"
                />
              </ReactFlow>

              {/* Float Toolbar Legend */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="glass-strong p-3 rounded-2xl text-[9px] space-y-1.5 border border-white/10 shadow-xl max-w-[120px]">
                  <div className="font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Ecosystem
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-indigo-500" />{" "}
                    Student
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-blue-500" /> Career
                    Goal
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-emerald-500" />{" "}
                    Target Skills
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-amber-500" /> Courses
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-rose-500" />{" "}
                    Scholarships
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-purple-500" />{" "}
                    Opportunities
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-teal-500" /> Mentors
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-cyan-500" />{" "}
                    Community
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-yellow-500" /> Alumni
                    Stories
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right AI Insights & Recommendations Sidebar */}
          <aside className="w-[340px] shrink-0 glass shadow-soft rounded-3xl flex flex-col border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-border/40 bg-primary/5 flex items-center gap-3">
              <div className="size-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 border border-indigo-500/25">
                <Brain className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Sahaayak AI Insights
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Ecosystem synthesis & paths
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
              {/* AI Insights List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="size-3 text-indigo-400" />
                  Key Insights
                </h4>
                {insights.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-border/30">
                    No insights generated yet. Sync your graph to run analysis.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {insights.map((insight: any) => (
                      <div
                        key={insight.id}
                        className="p-3 rounded-xl bg-background/50 border border-border/40 text-xs text-foreground leading-relaxed flex gap-2.5 hover:bg-background/80 transition-all duration-200"
                      >
                        <div className="mt-0.5 shrink-0">
                          {insight.type === "academic" && (
                            <Award className="size-3.5 text-emerald-400" />
                          )}
                          {insight.type === "career" && (
                            <Target className="size-3.5 text-blue-400" />
                          )}
                          {insight.type === "scholarship" && (
                            <Coins className="size-3.5 text-rose-400" />
                          )}
                          {insight.type === "mentor" && (
                            <Users className="size-3.5 text-teal-400" />
                          )}
                        </div>
                        <p>{insight.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommendation Cards */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3 text-amber-400" />
                  Actionable Paths
                </h4>
                {recommendations.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-border/30">
                    No action cards found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((rec: any) => (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-background/90 to-background/40 border border-border/40 hover:border-indigo-500/20 hover:shadow-md transition-all duration-300 space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              {rec.action}
                            </span>
                            <h5 className="text-xs font-bold text-foreground mt-1 leading-tight">
                              {rec.title}
                            </h5>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          {rec.description}
                        </p>

                        <Button
                          onClick={() =>
                            navigate({ to: rec.route || "/opportunities" })
                          }
                          size="sm"
                          className="w-full rounded-xl h-8 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1"
                        >
                          Unlock Path
                          <ArrowRight className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
