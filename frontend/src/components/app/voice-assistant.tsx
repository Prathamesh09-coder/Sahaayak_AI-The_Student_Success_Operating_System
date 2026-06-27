import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Waves, Volume2, Globe, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "gu", name: "Gujarati" },
  { code: "bn", name: "Bengali" },
];

export function VoiceAssistant() {
  const { user } = useUser();
  const studentId = user?.id || "default_student";

  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Voice states: Disconnected, Listening, Processing, Thinking, Speaking
  const [voiceState, setVoiceState] = useState<"Disconnected" | "Listening" | "Processing" | "Thinking" | "Speaking">("Disconnected");
  const [transcript, setTranscript] = useState("Tap the microphone to start speaking.");
  const [aiResponse, setAiResponse] = useState("");
  const [emotion, setEmotion] = useState("neutral");

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const voiceStateRef = useRef(voiceState);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Clean up when overlay closes or component unmounts
  useEffect(() => {
    if (!isOpen) {
      disconnectSession();
    }
    return () => {
      disconnectSession();
    };
  }, [isOpen]);

  const disconnectSession = () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: "stop" }));
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    setVoiceState("Disconnected");
  };

  const startSession = async () => {
    setVoiceState("Thinking");
    setTranscript("Connecting to voice gateway...");
    setAiResponse("");

    try {
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      let wsUrl = "";
      if (API_BASE_URL.startsWith("http")) {
        wsUrl = API_BASE_URL.replace(/^http/, "ws") + `/voice/ws/voice/${studentId}`;
      } else {
        wsUrl = `${wsProtocol}//${window.location.host}${API_BASE_URL}/voice/ws/voice/${studentId}`;
      }

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ event: "start", language }));
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.event) {
            case "ready":
              setVoiceState("Listening");
              setTranscript("I am listening. How can I help you?");
              break;
              
            case "listening":
              setVoiceState("Listening");
              break;
              
            case "processing":
              setVoiceState("Processing");
              setTranscript("Processing your voice input...");
              break;
              
            case "transcript":
              setTranscript(`"${data.text}"`);
              setVoiceState("Thinking");
              break;
              
            case "ai.response":
              setAiResponse(data.text);
              break;
              
            case "emotion":
              setEmotion(data.emotion);
              break;
              
            case "audio.chunk":
              playAudioResponse(data.audio);
              break;
              
            case "language.changed":
              toast.success(`Language: ${LANGUAGES.find(l => l.code === data.language)?.name}`);
              break;
              
            case "error":
              toast.error(data.message);
              disconnectSession();
              break;
          }
        } catch (err) {
          console.error("Error processing message:", err);
        }
      };

      socket.onclose = () => {
        setVoiceState("Disconnected");
      };

      socket.onerror = () => {
        disconnectSession();
      };

      // Mic Stream setup
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = context;

      if (context.state === "suspended") {
        await context.resume();
      }

      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (
          wsRef.current && 
          wsRef.current.readyState === WebSocket.OPEN && 
          voiceStateRef.current === "Listening" && 
          !isMuted
        ) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBuffer = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          wsRef.current.send(pcmBuffer.buffer);
        }
      };

      source.connect(processor);
      processor.connect(context.destination);

    } catch (err) {
      console.error(err);
      toast.error("Failed to access microphone.");
      disconnectSession();
    }
  };

  const playAudioResponse = (base64Audio: string) => {
    try {
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current = null;
      }

      setVoiceState("Speaking");
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes.buffer], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioPlaybackRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioPlaybackRef.current = null;
        setVoiceState("Listening");
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        audioPlaybackRef.current = null;
        setVoiceState("Listening");
      };

      audio.play().catch((err) => {
        console.error(err);
        setVoiceState("Listening");
      });
    } catch (e) {
      console.error(e);
      setVoiceState("Listening");
    }
  };

  const toggleVoice = () => {
    if (voiceState === "Disconnected") {
      startSession();
    } else {
      disconnectSession();
    }
  };

  const changeLanguage = (langCode: string) => {
    setLanguage(langCode);
    setShowLangMenu(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: "language", language: langCode }));
    }
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case "happy": return "text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]";
      case "sad": return "text-sky-400 font-bold drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]";
      case "stressed": return "text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]";
      case "confused": return "text-violet-400 font-bold drop-shadow-[0_0_8px_rgba(167,139,250,0.3)]";
      default: return "text-primary/90 font-bold";
    }
  };

  return (
    <>
      {/* Floating Action Button (Mic logo on the right/down side) */}
      <div className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="size-14 rounded-full shadow-glow shadow-primary/50 text-primary-foreground hover:scale-105 transition-transform"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Mic className="size-6" />
        </Button>
      </div>

      {/* Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          {/* Card Container */}
          <div className="bg-slate-900/95 border border-white/10 text-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative flex flex-col items-center select-none overflow-hidden">
            
            {/* Glowing Nebulas inside the card */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar (Aligned Properly to prevent overlapping) */}
            <div className="w-full flex items-center justify-between mb-4 z-10">
              {/* Language Selector Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                >
                  <Globe className="size-3.5 text-primary" />
                  <span>{LANGUAGES.find(l => l.code === language)?.name}</span>
                </button>

                {showLangMenu && (
                  <div className="absolute left-0 mt-1.5 w-32 rounded-xl bg-slate-950 border border-white/10 p-1 shadow-2xl max-h-40 overflow-y-auto z-[110] scrollbar-thin">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                          language === lang.code ? "bg-primary text-white" : "hover:bg-white/5 text-slate-300 hover:text-white"
                        )}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Icon Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                aria-label="Close assistant"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Header Title */}
            <div className="text-center mb-5 z-10">
              <h3 className="font-bold text-lg tracking-tight">AI Voice Companion</h3>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">
                Sahaayak Intelligent Success Voice
              </p>
            </div>
            
            {/* Transcript Area / Speech Bubble Container */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[6.5rem] max-h-[8.5rem] overflow-y-auto mb-6 flex flex-col justify-center text-center z-10 scrollbar-thin">
              <p className="text-xs text-slate-400 italic leading-relaxed">
                {transcript}
              </p>
              {aiResponse && (
                <p className="text-sm text-white font-medium mt-2.5 leading-relaxed">
                  "{aiResponse}"
                </p>
              )}
            </div>

            {/* Glowing Big Mic Button */}
            <div className="relative mb-6 z-10">
              {/* Pulsing Backlight */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full blur-3xl transition-all duration-1000 scale-90 opacity-0",
                  voiceState === "Listening" && "bg-emerald-500/30 scale-125 opacity-100",
                  voiceState === "Speaking" && "bg-primary/30 scale-125 opacity-100",
                  (voiceState === "Thinking" || voiceState === "Processing") && "bg-amber-500/20 scale-110 opacity-80"
                )}
              />
              
              <Button
                onClick={toggleVoice}
                disabled={voiceState === "Thinking" || voiceState === "Processing"}
                className={cn(
                  "relative size-24 rounded-full border transition-all duration-300 shadow-lg flex items-center justify-center text-white",
                  voiceState === "Disconnected"
                    ? "bg-primary hover:bg-primary/95 border-primary/20 hover:scale-105"
                    : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400 hover:scale-95"
                )}
                style={voiceState === "Disconnected" ? { background: "var(--gradient-primary)" } : undefined}
              >
                {voiceState === "Listening" ? (
                  <Waves className="size-10 text-white animate-pulse" />
                ) : voiceState === "Speaking" ? (
                  <Volume2 className="size-10 text-white animate-bounce" />
                ) : voiceState === "Thinking" || voiceState === "Processing" ? (
                  <Loader2 className="size-10 text-white animate-spin" />
                ) : (
                  <Mic className="size-10 text-white" />
                )}
              </Button>
            </div>

            {/* Wellness Emotion Display */}
            {voiceState !== "Disconnected" && (
              <div className="text-[10px] tracking-widest uppercase font-bold text-slate-500 mb-4 z-10">
                Emotion: <span className={getEmotionColor()}>{emotion}</span>
              </div>
            )}

            {/* Mic Helper Status Text */}
            <div className="h-8 flex items-center justify-center w-full mb-6 z-10">
              {voiceState === "Listening" ? (
                <div className="flex gap-1.5 items-center justify-center w-full">
                  <div className="w-1.5 h-4 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms]" />
                  <div className="w-1.5 h-7 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
                  <div className="w-1.5 h-5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_300ms]" />
                  <div className="w-1.5 h-3 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_400ms]" />
                </div>
              ) : voiceState === "Speaking" ? (
                <div className="flex gap-1.5 items-center justify-center w-full">
                  <div className="w-1.5 h-3 bg-primary rounded-full animate-[bounce_1.2s_infinite_150ms]" />
                  <div className="w-1.5 h-6 bg-primary rounded-full animate-[bounce_1.2s_infinite_300ms]" />
                  <div className="w-1.5 h-8 bg-primary rounded-full animate-[bounce_1.2s_infinite_450ms]" />
                  <div className="w-1.5 h-4 bg-primary rounded-full animate-[bounce_1.2s_infinite_600ms]" />
                </div>
              ) : (
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  {voiceState === "Disconnected" ? "Tap to speak" : voiceState}
                </p>
              )}
            </div>

            {/* Modern Glass Pill Controls */}
            <div className="flex gap-3 w-full z-10">
              <Button
                variant="outline"
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "flex-1 rounded-full text-xs h-10 font-semibold border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors",
                  isMuted && "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-400"
                )}
              >
                {isMuted ? <MicOff className="size-3.5 mr-1.5" /> : <Mic className="size-3.5 mr-1.5" />}
                {isMuted ? "Unmute" : "Mute Mic"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  disconnectSession();
                  setIsOpen(false);
                  toast.info("Opening Full Screen companion...");
                  window.location.hash = "#/voice";
                }}
                className="flex-1 rounded-full text-xs h-10 font-semibold border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Maximize2 className="size-3.5 mr-1.5" />
                Full Screen
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
