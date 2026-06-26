import {
  LayoutDashboard,
  Sparkles,
  Compass,
  Rocket,
  GraduationCap,
  Landmark,
  Map,
  FileText,
  Users,
  MessageSquare,
  Gauge,
  ShieldAlert,
  HeartHandshake,
  Mic,
  Network,
  Bell,
  Settings,
  BrainCircuit,
  User,
  Accessibility,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  group: "Core" | "Discover" | "Growth" | "You";
};

export const NAV: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    group: "Core",
  },
  { label: "AI Mentor", to: "/ai-mentor", icon: Sparkles, group: "Core" },
  {
    label: "Digital Twin",
    to: "/digital-twin",
    icon: BrainCircuit,
    group: "Core",
  },
  { label: "Career GPS", to: "/career-gps", icon: Compass, group: "Core" },
  {
    label: "Success Navigator",
    to: "/success-navigator",
    icon: Map,
    group: "Core",
  },
  { label: "Switch to Disability Mode", to: "/accessibility", icon: Accessibility, group: "Core" },

  {
    label: "Opportunities",
    to: "/opportunities",
    icon: Rocket,
    group: "Discover",
  },
  {
    label: "Scholarships",
    to: "/scholarships",
    icon: GraduationCap,
    group: "Discover",
  },
  { label: "Govt. Schemes", to: "/schemes", icon: Landmark, group: "Discover" },
  {
    label: "Knowledge Graph",
    to: "/knowledge-graph",
    icon: Network,
    group: "Discover",
  },

  { label: "Resume Analyzer", to: "/resume", icon: FileText, group: "Growth" },
  { label: "Mentor Network", to: "/mentors", icon: Users, group: "Growth" },
  {
    label: "Community",
    to: "/community",
    icon: MessageSquare,
    group: "Growth",
  },
  {
    label: "Interventions",
    to: "/interventions",
    icon: ShieldAlert,
    group: "Growth",
  },

  { label: "Profile", to: "/profile", icon: User, group: "You" },
  { label: "Parent Mode", to: "/parent", icon: HeartHandshake, group: "You" },
  { label: "Voice Assistant", to: "/voice", icon: Mic, group: "You" },
  { label: "Notifications", to: "/notifications", icon: Bell, group: "You" },
  { label: "Settings", to: "/settings", icon: Settings, group: "You" },
];
