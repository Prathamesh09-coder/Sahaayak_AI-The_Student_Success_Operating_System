import { useState } from "react";
import { Mic, X, Waves, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in zoom-in-95">
          <div className="glass-strong w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border-border/50 flex flex-col items-center text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>

            <h3 className="font-semibold text-lg mb-1">AI Voice Companion</h3>
            <p className="text-sm text-muted-foreground mb-10">
              How can I help you today?
            </p>

            <div className="relative mb-12">
              <div
                className={cn(
                  "absolute inset-0 bg-primary/20 rounded-full blur-2xl transition-all duration-1000",
                  isListening ? "scale-150 opacity-100" : "scale-100 opacity-0",
                )}
              />
              <Button
                onClick={() => setIsListening(!isListening)}
                className="relative size-24 rounded-full shadow-glow"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isListening ? (
                  <Waves className="size-10 animate-pulse text-primary-foreground" />
                ) : (
                  <Mic className="size-10 text-primary-foreground" />
                )}
              </Button>
            </div>

            <div className="h-16 flex items-center justify-center w-full">
              {isListening ? (
                <div className="flex gap-1.5 items-center justify-center w-full">
                  <div className="w-1.5 h-4 bg-primary rounded-full animate-[bounce_1s_infinite_100ms]" />
                  <div className="w-1.5 h-8 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]" />
                  <div className="w-1.5 h-12 bg-primary rounded-full animate-[bounce_1s_infinite_300ms]" />
                  <div className="w-1.5 h-6 bg-primary rounded-full animate-[bounce_1s_infinite_400ms]" />
                  <div className="w-1.5 h-4 bg-primary rounded-full animate-[bounce_1s_infinite_500ms]" />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm font-medium">
                  Tap to speak
                </p>
              )}
            </div>

            <div className="flex gap-2 w-full mt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-full text-xs h-10 shadow-none border-border/50"
              >
                Read my notifications
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full text-xs h-10 shadow-none border-border/50"
              >
                Update my profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
