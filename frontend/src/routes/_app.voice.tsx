import { createFileRoute } from "@tanstack/react-router";
import { Mic, MicOff, Settings2, Globe, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { VoiceAPI } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/voice")({
  head: () => ({ meta: [{ title: "Voice Assistant · Sahaayak AI" }] }),
  component: VoiceAssistant,
});

function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("Hi! How can I help you today?");
  const [language, setLanguage] = useState("en");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], "voice_input.webm", {
          type: "audio/webm",
        });

        setIsProcessing(true);
        setTranscript("Processing your voice input...");

        try {
          const response = await VoiceAPI.transcribe(audioFile);
          if (response.success && response.data?.transcript) {
            const resultText = response.data.transcript;
            setTranscript(resultText);

            // Attempt browser-level TTS playback
            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance(resultText);
              utterance.lang = language === "mr" ? "mr-IN" : "en-US";
              window.speechSynthesis.speak(utterance);
            }

            // Sync with backend voice synthesizer
            await VoiceAPI.synthesize(resultText, language);
          } else {
            toast.error("Failed to transcribe audio.");
            setTranscript("Could not transcribe your voice. Please try again.");
          }
        } catch (error) {
          console.error("Error transcribing:", error);
          toast.error("Error connecting to voice assistant.");
          setTranscript("Error processing. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setTranscript("Listening...");
    } catch (err) {
      console.error("Failed to access mic:", err);
      toast.error("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      if (isProcessing) return;
      startRecording();
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "mr" : "en";
    setLanguage(nextLang);
    toast.success(
      `Language switched to ${nextLang === "mr" ? "Marathi" : "English"}`,
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-between p-8 md:p-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Top actions */}
      <div className="w-full max-w-4xl flex justify-between items-center opacity-70">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 p-3 rounded-full hover:bg-muted transition-colors text-foreground"
        >
          <Globe className="size-6 text-primary" />
          <span className="font-semibold text-lg">
            {language === "en" ? "English" : "Marathi"}
          </span>
        </button>
        <button className="p-3 rounded-full hover:bg-muted transition-colors text-foreground">
          <Settings2 className="size-6" />
        </button>
      </div>

      {/* Center content - Transcript */}
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center text-center">
        {isProcessing && (
          <Loader2 className="size-10 animate-spin text-primary mb-4" />
        )}
        <motion.h2
          key={transcript}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-3xl md:text-5xl font-bold leading-tight md:leading-snug tracking-tight ${
            isListening ? "text-primary" : "text-foreground"
          }`}
        >
          "{transcript}"
        </motion.h2>
      </div>

      {/* Bottom controls - Mic & Wave */}
      <div className="w-full flex flex-col items-center pb-10">
        {/* Wave animation */}
        <div className="flex items-center gap-2 h-20 mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
            <motion.div
              key={bar}
              animate={
                isListening
                  ? {
                      height: [20, Math.random() * 60 + 20, 20],
                    }
                  : {
                      height: 4,
                    }
              }
              transition={{
                repeat: Infinity,
                duration: 0.5 + Math.random() * 0.5,
              }}
              className={`w-3 md:w-4 rounded-full ${
                isListening ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Mic button */}
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`size-24 md:size-28 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-destructive text-destructive-foreground shadow-[0_0_50px_rgba(239,68,68,0.5)]"
              : "bg-primary text-primary-foreground shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:scale-105"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isListening ? (
            <MicOff className="size-10" />
          ) : (
            <Mic className="size-10" />
          )}
        </button>
      </div>
    </div>
  );
}
