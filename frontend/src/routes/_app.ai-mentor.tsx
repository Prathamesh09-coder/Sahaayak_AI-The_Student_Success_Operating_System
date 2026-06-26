import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Send,
  Paperclip,
  Mic,
  FileText,
  BrainCircuit,
  HeartPulse,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCw,
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChatAPI } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai-mentor")({
  head: () => ({ meta: [{ title: "AI Mentor · Sahaayak AI" }] }),
  component: AIMentor,
});

const PRESETS = [
  "Review my latest resume",
  "Any scholarships matching my profile?",
  "Help me prepare for TCS interview",
  "Explain DSA graphs in Hindi",
];

interface MessageSource {
  source: string;
  page?: number;
  score?: number;
}

interface ChatMessage {
  id?: string;
  role: "user" | "ai" | "system" | "assistant";
  content: string;
  reasoning?: string;
  sources?: MessageSource[];
  followups?: string[];
}

interface Conversation {
  id: string;
  title: string;
  summary: string | null;
  updated_at: string;
}

function AIMentor() {
  const { user, student, isLoading } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState("en");

  // Text-to-Speech (TTS) State
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const studentId = user?.id;

  // ─── 1. Load Conversations ────────────────────────────────────────────────
  const loadConversations = async (id: string) => {
    try {
      const res = await ChatAPI.getConversations(id);
      const data = res.data || [];
      setConversations(data);
      if (data.length > 0) {
        if (!activeConversationId) {
          setActiveConversationId(data[0].id);
        }
      } else {
        if (!activeConversationId) {
          setActiveConversationId("new_" + Date.now().toString());
        }
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
      if (!activeConversationId) {
        setActiveConversationId("new_" + Date.now().toString());
      }
    }
  };

  useEffect(() => {
    if (studentId) {
      loadConversations(studentId);
    }
  }, [studentId]);

  // ─── 2. Load Conversation History ──────────────────────────────────────────
  const historyLoadedFor = useRef<string | null>(null);

  useEffect(() => {
    // Cancel any active speaking when conversation changes
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
    }

    if (!activeConversationId) {
      setMessages([]);
      historyLoadedFor.current = null;
      return;
    }

    // Suppress history reloading if we just transitioned from a "new_" ID to its resolved UUID
    if (
      activeConversationId &&
      !activeConversationId.startsWith("new_") &&
      historyLoadedFor.current &&
      historyLoadedFor.current.startsWith("new_")
    ) {
      console.log("Suppressing history load during conversation ID resolution");
      historyLoadedFor.current = activeConversationId;
      return;
    }

    const loadHistory = async () => {
      try {
        const res = await ChatAPI.getHistory(activeConversationId);
        const history = res.data || [];
        if (history && history.length > 0) {
          setMessages(
            history.map((m: any) => ({
              id: m.id,
              role: m.role === "assistant" ? "ai" : m.role,
              content: m.content,
              sources: m.retrieved_sources,
              followups: m.followups,
            })),
          );
        } else {
          setMessages([]);
        }
        historyLoadedFor.current = activeConversationId;
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };

    if (activeConversationId.startsWith("new_")) {
      setMessages([]);
      historyLoadedFor.current = activeConversationId;
    } else {
      loadHistory();
    }
  }, [activeConversationId]);

  // ─── 3. WebSocket Auto-Reconnect and Heartbeats ────────────────────────────
  const wsConversationId = useRef<string | null>(null);

  useEffect(() => {
    if (!studentId || !activeConversationId) return;

    // Prevent reconnecting if we are transitioning from a "new_" ID to its resolved UUID
    if (
      ws.current &&
      ws.current.readyState === WebSocket.OPEN &&
      wsConversationId.current &&
      (wsConversationId.current === activeConversationId ||
        (!activeConversationId.startsWith("new_") &&
          wsConversationId.current.startsWith("new_")))
    ) {
      console.log(
        "Suppressing WS reconnect during conversation ID resolution",
        activeConversationId,
      );
      wsConversationId.current = activeConversationId;
      return;
    }

    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let heartbeatCheckInterval: ReturnType<typeof setInterval>;

    const connectWS = () => {
      let lastHeartbeat = Date.now();
      wsConversationId.current = activeConversationId;

      ws.current = new WebSocket(
        `ws://localhost:8000/api/v1/mentor/ws/${activeConversationId}?student_id=${studentId}`,
      );

      heartbeatCheckInterval = setInterval(() => {
        if (Date.now() - lastHeartbeat > 15000) {
          console.warn(
            "No heartbeat received for 15s, reconnecting WebSocket...",
          );
          ws.current?.close();
        }
      }, 5000);

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.event === "heartbeat") {
            lastHeartbeat = Date.now();
            return;
          }

          if (data.type === "chat.conversation_created") {
            // Update active conversation ID state dynamically
            setActiveConversationId(data.conversation_id);
            // Refresh conversations list so the sidebar displays the new title
            loadConversations(studentId);
            return;
          }

          if (data.type === "token.stream") {
            setIsTyping(false);
            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.role === "ai") {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...lastMsg,
                  content: lastMsg.content + data.content,
                };
                return updated;
              } else {
                return [...prev, { role: "ai", content: data.content }];
              }
            });
          } else if (data.type === "reasoning.stream") {
            setIsTyping(false);
            setMessages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (lastMsg && lastMsg.role === "ai") {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...lastMsg,
                  reasoning: (lastMsg.reasoning || "") + data.content,
                };
                return updated;
              } else {
                return [
                  ...prev,
                  { role: "ai", content: "", reasoning: data.content },
                ];
              }
            });
          } else if (data.type === "chat.followups") {
            setMessages((prev) => {
              const updated = [...prev];
              if (
                updated.length > 0 &&
                updated[updated.length - 1].role === "ai"
              ) {
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  followups: data.followups,
                };
              }
              return updated;
            });
          } else if (data.type === "chat.error") {
            setIsTyping(false);
            toast.error(data.error || "A connection error occurred.");
          } else if (
            data.type === "message.completed" ||
            data.type === "chat.completed"
          ) {
            if (data.sources && data.sources.length > 0) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  sources: data.sources,
                };
                return updated;
              });
            }
            if (
              conversations.length === 0 ||
              !conversations.find((c) => c.id === activeConversationId)
            ) {
              loadConversations(studentId);
            }
          }
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected, retrying...");
        clearInterval(heartbeatCheckInterval);
        reconnectTimeout = setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(heartbeatCheckInterval);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [studentId, activeConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle auto-growing textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim() || !ws.current) return;

    if (ws.current.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket is not connected. Please wait a moment.");
      return;
    }

    // Cancel any active speech on sending
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
    }

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    ws.current.send(
      JSON.stringify({
        event: "chat.message",
        message: text,
        language: language,
      }),
    );
  };

  const createNewChat = () => {
    // Cancel any active speech on creating new chat
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIdx(null);
    }
    setActiveConversationId("new_" + Date.now().toString());
    setMessages([]);
  };

  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await ChatAPI.deleteConversation(id);
      const updated = conversations.filter((c) => c.id !== id);
      setConversations(updated);
      if (activeConversationId === id) {
        setActiveConversationId(updated.length > 0 ? updated[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard!");
  };

  // ─── 4. Text-to-Speech (TTS) Engine ────────────────────────────────────────
  const handleSpeakText = (text: string, index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    const synth = window.speechSynthesis;

    if (synth.speaking) {
      synth.cancel();
      if (speakingMsgIdx === index) {
        setSpeakingMsgIdx(null);
        return;
      }
    }

    // Strip markdown formatting characters for cleaner voice output
    const cleanText = text
      .replace(/[*#_`~>\[\]()\-+]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set voice rate slightly slower for clearer educational delivery
    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingMsgIdx(null);
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setSpeakingMsgIdx(null);
    };

    synth.speak(utterance);
    setSpeakingMsgIdx(index);
  };

  // Speaks the last AI response in the message list (bound to input Mic button)
  const handleSpeakLastResponse = () => {
    // Find the last AI message in the list
    let lastAiIdx = -1;
    for (let idx = messages.length - 1; idx >= 0; idx--) {
      if (messages[idx].role === "ai" || messages[idx].role === "assistant") {
        lastAiIdx = idx;
        break;
      }
    }

    if (lastAiIdx !== -1) {
      handleSpeakText(messages[lastAiIdx].content, lastAiIdx);
    } else {
      toast.info("No AI response available to read aloud.");
    }
  };

  const isSpeakingAny = speakingMsgIdx !== null;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your Sahaayak AI Mentor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar for conversations - Desktop only */}
      <div className="hidden w-72 flex-col gap-4 lg:flex glass rounded-3xl p-4 shadow-soft">
        <button
          onClick={createNewChat}
          className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" /> New Chat
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full bg-background/50 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 mt-2 pr-1 custom-scrollbar">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`group flex items-center justify-between w-full text-left px-3 py-3 text-sm rounded-xl cursor-pointer transition-all ${
                activeConversationId === conv.id
                  ? "bg-primary/10 text-primary font-bold border border-primary/20"
                  : "hover:bg-accent/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare className="size-4 shrink-0 text-current" />
                <span className="truncate">
                  {conv.title || "New Conversation"}
                </span>
              </div>
              <button
                onClick={(e) => deleteConversation(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity shrink-0 p-1"
                title="Delete chat"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="text-center text-muted-foreground text-xs p-4">
              No recent chats
            </div>
          )}
        </div>

        {/* Real-time Dynamic Profile Card in Sidebar */}
        {student && (
          <div className="mt-auto p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-2.5 animate-in fade-in duration-500">
            <div className="flex items-center gap-2.5">
              <div
                className="grid size-9 place-items-center rounded-full text-sm font-bold text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                {user?.full_name ? user.full_name[0].toUpperCase() : "S"}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-foreground">
                  {user?.full_name}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {student.college || "Update college"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-background/45 rounded-xl border border-border/30">
                <div className="text-xs font-extrabold text-primary">
                  {student.cgpa ? student.cgpa.toFixed(1) : "N/A"}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  CGPA
                </div>
              </div>
              <div className="p-2 bg-background/45 rounded-xl border border-border/30">
                <div className="text-xs font-extrabold text-success">
                  {Math.round(student.profile_completeness)}%
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  Profile
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl glass shadow-soft">
        <header className="flex items-center justify-between border-b border-border/50 bg-background/50 p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <Sparkles className="size-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Mentor</h2>
              <p className="text-xs text-muted-foreground">
                Always-on, personalized guidance
              </p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:border-primary text-foreground"
          >
            <option value="en">English</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="mr">Marathi (मराठी)</option>
          </select>
        </header>

        {/* Chat Messages Workspace */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-background/5">
          {messages.length === 0 && !isTyping && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 animate-in fade-in duration-500">
              <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary shadow-glow">
                <Sparkles className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mt-4">
                Ask your first question
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                I'm your AI Mentor, synced with your Digital Twin context. I can
                help with career planning, scholarship matches, and academic
                guidance.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ${
                m.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`grid size-8 shrink-0 place-items-center rounded-full mt-1 font-bold ${
                  m.role === "user"
                    ? "bg-accent/15 text-accent text-xs"
                    : "bg-primary/20 text-primary text-xs"
                }`}
              >
                {m.role === "user" ? (
                  user?.full_name ? (
                    user.full_name[0].toUpperCase()
                  ) : (
                    "U"
                  )
                ) : (
                  <Sparkles className="size-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                  m.role === "user"
                    ? "bg-accent/10 rounded-tr-none text-foreground font-medium"
                    : "bg-card border border-border/40 rounded-tl-none text-foreground shadow-sm"
                }`}
              >
                {m.role === "ai" || m.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {/* Reasoning Details */}
                    {m.reasoning && (
                      <details className="mb-4 rounded-xl border border-border/50 bg-background/40 p-3 group shadow-inner">
                        <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground list-none transition-colors">
                          <BrainCircuit className="size-4 text-primary/70 group-open:text-primary" />
                          {isTyping && i === messages.length - 1
                            ? "Thinking in progress..."
                            : "AI Reasoning"}
                        </summary>
                        <div className="mt-3 text-[11px] text-muted-foreground/90 whitespace-pre-wrap font-mono leading-relaxed border-t border-border/50 pt-3">
                          {m.reasoning}
                        </div>
                      </details>
                    )}

                    {/* Content Markdown */}
                    {m.content && (
                      <div className="markdown-content leading-relaxed text-foreground/90">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </div>
                )}

                {/* Sources Citation */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-border/50">
                    <p className="text-[11px] font-bold mb-2 flex items-center gap-1 text-foreground/80 uppercase tracking-wide">
                      <BookOpen className="size-3.5" /> Sources Used:
                    </p>
                    <ul className="space-y-1.5">
                      {m.sources.map((src, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-muted-foreground flex items-start gap-2"
                        >
                          <span className="mt-1.5 size-1.5 rounded-full bg-primary/60 shrink-0" />
                          <span>
                            {src.source} {src.page ? `(Page ${src.page})` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Message Action Bar (Copy, Speak, Feedback) */}
                {(m.role === "ai" || m.role === "assistant") &&
                  i >= 0 &&
                  !isTyping && (
                    <div className="flex items-center gap-3.5 mt-4 pt-3 text-muted-foreground border-t border-border/30 text-xs">
                      <button
                        onClick={() => copyToClipboard(m.content)}
                        className="hover:text-primary transition-colors flex items-center gap-1"
                        title="Copy message"
                      >
                        <Copy className="size-3.5" /> Copy
                      </button>

                      {/* Integrated TTS Speak Button next to message */}
                      <button
                        onClick={() => handleSpeakText(m.content, i)}
                        className={`transition-colors flex items-center gap-1 ${
                          speakingMsgIdx === i
                            ? "text-success font-bold"
                            : "hover:text-primary"
                        }`}
                        title={
                          speakingMsgIdx === i ? "Stop reading" : "Read aloud"
                        }
                      >
                        {speakingMsgIdx === i ? (
                          <>
                            <VolumeX className="size-3.5 text-success animate-pulse" />{" "}
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="size-3.5" /> Speak
                          </>
                        )}
                      </button>

                      <div className="flex-1"></div>
                      <button
                        className="hover:text-success transition-colors"
                        title="Thumbs up"
                      >
                        <ThumbsUp className="size-3.5" />
                      </button>
                      <button
                        className="hover:text-destructive transition-colors"
                        title="Thumbs down"
                      >
                        <ThumbsDown className="size-3.5" />
                      </button>
                    </div>
                  )}

                {/* Followups */}
                {(m.role === "ai" || m.role === "assistant") &&
                  m.followups &&
                  !isTyping && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-border/35 pt-3.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Suggested Follow-ups:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {m.followups.map((f: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(f)}
                            className="rounded-xl border border-border bg-background/50 px-3 py-2 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-left transition-colors"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {/* Smooth Typing Bouncing Dots */}
          {isTyping && (
            <div className="flex gap-3 animate-in fade-in duration-300">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="size-4 animate-spin" />
              </div>
              <div className="bg-background/60 border border-border/50 rounded-2xl rounded-tl-none p-4 text-sm flex items-center gap-1.5 shadow-sm">
                <span className="size-1.5 rounded-full bg-primary/50 animate-bounce" />
                <span className="size-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-primary/50 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Shortcuts (shown when empty chat) */}
        {messages.length === 0 && (
          <div className="px-4 pb-4 max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap justify-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="rounded-xl border border-border/60 bg-background/40 px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 bg-background/40 border-t border-border/50 shrink-0">
          <div className="max-w-4xl mx-auto flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <button
              className="grid size-9 mb-1 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent/20 hover:text-foreground transition-colors"
              title="Attach file"
            >
              <Paperclip className="size-4" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask your AI Mentor... (Shift+Enter for new line)"
              className="w-full resize-none border-0 bg-transparent px-2 py-2.5 text-sm shadow-none focus:outline-none focus:ring-0 custom-scrollbar text-foreground"
              style={{ minHeight: "40px", maxHeight: "120px" }}
              rows={1}
            />

            {/* Mic button with integrated TTS Read-Aloud last response */}
            <button
              type="button"
              onClick={handleSpeakLastResponse}
              className={`grid size-9 mb-1 shrink-0 place-items-center rounded-full transition-all border ${
                isSpeakingAny
                  ? "bg-success/15 border-success text-success animate-pulse shadow-[0_0_12px_var(--success)]/25"
                  : "text-muted-foreground hover:bg-accent/20 hover:text-foreground border-transparent"
              }`}
              title={
                isSpeakingAny
                  ? "Stop reading last response"
                  : "Read aloud most recent response"
              }
            >
              {isSpeakingAny ? (
                <VolumeX className="size-4 text-success" />
              ) : (
                <Mic className="size-4" />
              )}
            </button>

            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || !activeConversationId}
              className="grid size-9 mb-1 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="size-4" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] text-muted-foreground">
              AI can make mistakes. Consider verifying important information.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
