import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Mic, MicOff, Settings2, Globe, Loader2, ArrowLeft, Volume2, VolumeX, Type, HelpCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/voice")({
  head: () => ({ meta: [{ title: "Voice Assistant · Sahaayak AI" }] }),
  component: VoiceAssistant,
});

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

function VoiceAssistant() {
  const { user } = useUser();
  const navigate = useNavigate();
  const studentId = user?.id || "default_student";

  // Configuration States
  const [language, setLanguage] = useState("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [parentMode, setParentMode] = useState(false);
  const [lowLiteracyMode, setLowLiteracyMode] = useState(false);

  // Conversation States
  const [voiceState, setVoiceState] = useState<"Listening" | "Processing" | "Thinking" | "Speaking" | "Disconnected">("Disconnected");
  const [userTranscript, setUserTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("Tap the microphone to start a conversation.");
  const [emotion, setEmotion] = useState("neutral");

  // Web Audio & WebSocket References
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  
  // Create mutable reference to voiceState for audio processor check
  const voiceStateRef = useRef(voiceState);
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  const disconnectSession = () => {
    // 1. Stop audio playback
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      audioPlaybackRef.current = null;
    }

    // 2. Stop microphone processor and streams
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

    // 3. Close WebSocket
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
    disconnectSession();
    setVoiceState("Thinking");
    setUserTranscript("");
    setAiResponse("Connecting to Voice Mentor...");

    try {
      // 1. Initialize WebSocket
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      // Check if API_BASE_URL is a relative or absolute URL
      let wsUrl = "";
      if (API_BASE_URL.startsWith("http")) {
        wsUrl = API_BASE_URL.replace(/^http/, "ws") + `/voice/ws/voice/${studentId}`;
      } else {
        wsUrl = `${wsProtocol}//${window.location.host}${API_BASE_URL}/voice/ws/voice/${studentId}`;
      }

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        // Send handshake
        socket.send(JSON.stringify({ event: "start", language }));
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.event) {
            case "ready":
              setVoiceState("Listening");
              setAiResponse("I am listening. How can I help you?");
              // Prompt user to start speaking
              if (lowLiteracyMode) {
                speakInstruction("I am listening, please speak.");
              }
              break;
              
            case "listening":
              if (data.speaking) {
                setVoiceState("Listening");
              } else {
                setVoiceState("Listening");
              }
              break;
              
            case "processing":
              setVoiceState("Processing");
              setAiResponse("Transcribing audio...");
              break;
              
            case "transcript":
              setUserTranscript(data.text);
              setVoiceState("Thinking");
              setAiResponse("Formulating guidance response...");
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
              toast.success(`Language updated to ${LANGUAGES.find(l => l.code === data.language)?.name}`);
              break;
              
            case "error":
              toast.error(data.message || "An error occurred.");
              disconnectSession();
              break;
          }
        } catch (err) {
          console.error("Error processing websocket message:", err);
        }
      };

      socket.onclose = () => {
        loggerDisconnect();
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        toast.error("Network connection error. Reconnecting...");
        disconnectSession();
      };

      // 2. Initialize browser microphone and Web Audio capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = context;

      if (context.state === "suspended") {
        await context.resume();
      }

      const source = context.createMediaStreamSource(stream);
      // Buffer size of 4096 yields around ~250ms chunks at 16kHz
      const processor = context.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        // Only capture and send if WebSocket is open, we are listening, and not muted
        if (
          wsRef.current && 
          wsRef.current.readyState === WebSocket.OPEN && 
          voiceStateRef.current === "Listening" && 
          !isMuted
        ) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Convert float32 [-1.0, 1.0] to signed 16-bit PCM integer bytes
          const pcmBuffer = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // Send raw PCM bytes
          wsRef.current.send(pcmBuffer.buffer);
        }
      };

      source.connect(processor);
      processor.connect(context.destination);

    } catch (err) {
      console.error("Voice initialization error:", err);
      toast.error("Microphone access denied or audio device not found.");
      disconnectSession();
    }
  };

  const loggerDisconnect = () => {
    setVoiceState("Disconnected");
    setAiResponse("Conversation finished. Tap the mic to restart.");
  };

  const playAudioResponse = (base64Audio: string) => {
    try {
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current = null;
      }

      setVoiceState("Speaking");

      // Decode base64 to binary buffer
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert MP3 to Blob URL and play
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
        console.error("Audio playback error:", err);
        setVoiceState("Listening");
      });
    } catch (e) {
      console.error("Failed to decode speech response:", e);
      setVoiceState("Listening");
    }
  };

  const speakInstruction = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSession = () => {
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
    } else {
      toast.success(`Language set to ${LANGUAGES.find(l => l.code === langCode)?.name}`);
    }
  };

  // Get active wave amplitude depending on state
  const getWaveScale = (index: number) => {
    if (voiceState === "Listening") {
      return [1, 2.5 + Math.sin(index) * 1.5, 1];
    }
    if (voiceState === "Speaking") {
      return [1, 4 + Math.cos(index) * 2, 1];
    }
    if (voiceState === "Thinking" || voiceState === "Processing") {
      return [1.2, 1.2, 1.2];
    }
    return [0.2, 0.2, 0.2];
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case "happy": return "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]";
      case "sad": return "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]";
      case "stressed": return "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]";
      case "confused": return "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]";
      default: return "text-primary/70";
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 md:p-10 overflow-hidden select-none">
      {/* Premium Glassmorphic / Nebula Background Glimmers */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Top Navigation & Accessory Panel */}
      <div className="w-full flex items-center justify-between z-10">
        <button
          onClick={() => {
            disconnectSession();
            navigate({ to: "/dashboard" });
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white font-medium"
        >
          <ArrowLeft className="size-5" />
          <span>Exit</span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-full border transition-all ${
              isMuted 
                ? "bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>

          {/* Large Text Size toggle */}
          <button
            onClick={() => setLargeText(!largeText)}
            className={`p-3 rounded-full border transition-all ${
              largeText 
                ? "bg-primary/20 border-primary/30 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
            }`}
            title="Toggle Large Text"
          >
            <Type className="size-5" />
          </button>

          {/* Parent Mode Toggle */}
          <button
            onClick={() => {
              setParentMode(!parentMode);
              toast.success(`Parent Guidance Mode ${!parentMode ? "Enabled" : "Disabled"}`);
            }}
            className={`p-3 rounded-full border transition-all ${
              parentMode 
                ? "bg-orange-500/20 border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]" 
                : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
            }`}
            title="Toggle Parent Mode"
          >
            <HelpCircle className="size-5" />
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
            >
              <Globe className="size-5 text-primary" />
              <span className="font-semibold text-sm">
                {LANGUAGES.find((l) => l.code === language)?.name}
              </span>
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900/95 border border-white/10 p-2 shadow-2xl backdrop-blur-xl z-55 max-h-64 overflow-y-auto scrollbar-thin"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        language === lang.code
                          ? "bg-primary text-white"
                          : "hover:bg-white/5 text-slate-300 hover:text-white"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Parent Mode Active Banner */}
      {parentMode && (
        <div className="w-full flex justify-center z-10 -mt-4">
          <div className="bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs px-4 py-1.5 rounded-full flex items-center gap-2 font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            PARENT COMPANION MODE ACTIVE (SIMPLE INSTRUCTIONS)
          </div>
        </div>
      )}

      {/* Transcript & Response Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-4 md:px-8 z-10 space-y-6">
        
        {/* User live transcript */}
        {userTranscript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed italic"
          >
            "{userTranscript}"
          </motion.div>
        )}

        {/* Main Response Box */}
        <div className="space-y-4">
          <motion.h2
            key={aiResponse}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className={`font-bold leading-relaxed tracking-tight select-text selection:bg-primary/30 ${
              largeText ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl"
            } ${
              voiceState === "Listening" ? "text-primary" : "text-white"
            }`}
          >
            "{aiResponse}"
          </motion.h2>

          {/* Emotion Indicator */}
          {voiceState !== "Disconnected" && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5"
            >
              <span className="text-slate-500">Emotion:</span>
              <span className={getEmotionColor()}>{emotion}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer Controls: Wav-form, status and Mic button */}
      <div className="w-full flex flex-col items-center z-10 pb-6">
        
        {/* State Status Descriptor */}
        <div className="text-slate-400 text-sm font-semibold tracking-widest uppercase mb-6 flex items-center gap-2">
          {voiceState === "Thinking" && <Loader2 className="size-4 animate-spin text-primary" />}
          {voiceState === "Processing" && <Loader2 className="size-4 animate-spin text-orange-400" />}
          <span>{voiceState}</span>
        </div>

        {/* Continuous Waveform Animation */}
        <div className="flex items-center gap-2 h-16 mb-8 justify-center">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scaleY: getWaveScale(i),
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5 + (i % 3) * 0.15,
                ease: "easeInOut",
              }}
              className={`w-3.5 rounded-full transition-colors duration-500 ${
                voiceState === "Listening"
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : voiceState === "Speaking"
                  ? "bg-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  : voiceState === "Thinking" || voiceState === "Processing"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-slate-800"
              }`}
              style={{
                height: "8px",
                transformOrigin: "center",
              }}
            />
          ))}
        </div>

        {/* Pulse Glowing Mic Button */}
        <button
          onClick={toggleSession}
          disabled={voiceState === "Thinking" || voiceState === "Processing"}
          className={`size-24 md:size-28 rounded-full flex items-center justify-center border transition-all duration-300 relative ${
            voiceState === "Disconnected"
              ? "bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:scale-105"
              : "bg-red-500/20 border-red-500/30 hover:bg-red-500/30 text-red-400 shadow-[0_0_45px_rgba(239,68,68,0.3)] hover:scale-95"
          } ${(voiceState === "Thinking" || voiceState === "Processing") ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {/* Double pulsating rings */}
          {voiceState !== "Disconnected" && (
            <>
              <span className="absolute inset-0 rounded-full border border-red-500/40 animate-ping opacity-60" style={{ animationDuration: "1.8s" }} />
              <span className="absolute -inset-3 rounded-full border border-red-500/20 animate-ping opacity-30" style={{ animationDuration: "2.4s" }} />
            </>
          )}

          {voiceState === "Disconnected" ? (
            <Mic className="size-10" />
          ) : (
            <VolumeX className="size-10" />
          )}
        </button>

        {/* Low literacy / parent helper guidance note */}
        <div className="mt-4 text-slate-500 text-xs font-medium max-w-sm text-center leading-relaxed">
          {voiceState === "Disconnected" 
            ? "Tap once to call Sahaayak. Make sure your mic is enabled." 
            : "Sahaayak can hear you now. Simply start speaking!"}
        </div>
      </div>
    </div>
  );
}
