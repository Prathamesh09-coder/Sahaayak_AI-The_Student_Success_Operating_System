import { createFileRoute } from "@tanstack/react-router";
import {
  Mic,
  Volume2,
  Globe,
  Heart,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/parent")({
  head: () => ({ meta: [{ title: "Parent Mode · Sahaayak AI" }] }),
  component: ParentMode,
});

import { ParentAPI } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

function ParentMode() {
  const { user } = useUser();
  const [language, setLanguage] = useState("mr");
  const [studentId, setStudentId] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setStudentId(user.id);
    } else {
      setStudentId("student_123");
    }
  }, [user]);

  const handleQuery = async (topic: string) => {
    setLoading(true);
    setExplanation("");
    try {
      const res = await ParentAPI.query({
        student_id: studentId,
        topic,
        language,
      });
      if (res.success && res.data) {
        setExplanation(res.data.explanation);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch explanation.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "mr" ? "en" : "mr";
    setLanguage(nextLang);
    toast.success(
      `Language changed to ${nextLang === "mr" ? "Marathi" : "English"}`,
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 pb-24">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          सहा्यक
        </h1>
        <Button
          onClick={toggleLanguage}
          variant="outline"
          size="lg"
          className="rounded-full text-lg h-12 px-6 shadow-sm border-2"
        >
          <Globe className="size-5 mr-2" />
          {language === "mr" ? "मराठी" : "English"}
        </Button>
      </div>

      {/* Voice Prompt Area */}
      <div className="glass-strong rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-8 shadow-lg border-2 border-primary/20">
        <h2 className="text-2xl md:text-3xl font-bold leading-relaxed">
          {language === "mr"
            ? "नमस्कार! तुम्हाला तुमच्या मुलाच्या शिक्षणाबद्दल काही प्रश्न आहेत का?"
            : "Hello! Do you have questions about your child's education?"}
        </h2>

        <button
          onClick={() =>
            handleQuery(language === "mr" ? "अभ्यासक्रम" : "Curriculum")
          }
          className="size-24 md:size-32 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.4)] hover:scale-105 transition-transform active:scale-95"
        >
          <Mic className="size-10 md:size-14" />
        </button>

        <p className="text-lg md:text-xl text-muted-foreground font-medium">
          {language === "mr"
            ? "प्रश्नासाठी बटण दाबा आणि बोला"
            : "Press button to speak"}
        </p>
      </div>

      {/* Explanation Result */}
      {(loading || explanation) && (
        <div className="glass rounded-[2rem] p-6 shadow-md border border-border/50">
          <h3 className="text-lg font-bold mb-2">
            {language === "mr" ? "सहा्यक उत्तर:" : "Sahaayak Answer:"}
          </h3>
          {loading ? (
            <p className="text-sm text-muted-foreground animate-pulse">
              {language === "mr"
                ? "उत्तर शोधत आहे..."
                : "Fetching explanation..."}
            </p>
          ) : (
            <p className="text-base text-foreground/90 whitespace-pre-line">
              {explanation}
            </p>
          )}
        </div>
      )}

      {/* Quick Questions */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl md:text-2xl font-bold mb-6">
          {language === "mr" ? "किंवा हे विचारून पहा:" : "Or try asking:"}
        </h3>

        <div className="grid gap-4">
          <QuickCard
            icon={<Briefcase />}
            text={
              language === "mr" ? "प्लेसमेंट म्हणजे काय?" : "What is Placement?"
            }
            onClick={() =>
              handleQuery(
                language === "mr"
                  ? "प्लेसमेंट म्हणजे काय?"
                  : "What is Placement?",
              )
            }
          />
          <QuickCard
            icon={<GraduationCap />}
            text={
              language === "mr"
                ? "शिष्यवृत्ती कशी मिळवायची?"
                : "How to get a scholarship?"
            }
            onClick={() =>
              handleQuery(
                language === "mr"
                  ? "शिष्यवृत्ती कशी मिळवायची?"
                  : "How to get a scholarship?",
              )
            }
          />
          <QuickCard
            icon={<Heart />}
            text={
              language === "mr"
                ? "माझा मुलगा सध्या काय शिकत आहे?"
                : "What is my child studying currently?"
            }
            onClick={() =>
              handleQuery(
                language === "mr"
                  ? "माझा मुलगा सध्या काय शिकत आहे?"
                  : "What is my child studying currently?",
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

function QuickCard({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-6 p-6 rounded-3xl bg-card border-2 border-border shadow-sm hover:border-primary/50 transition-colors text-left group w-full"
    >
      <div className="size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xl md:text-2xl font-semibold">{text}</span>
      <div className="ml-auto size-12 rounded-full bg-muted grid place-items-center shrink-0">
        <Volume2 className="size-6 text-muted-foreground" />
      </div>
    </button>
  );
}
