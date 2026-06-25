import { createFileRoute } from "@tanstack/react-router";
import { Star, Building2, MapPin, Target, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/success-stories")({
  head: () => ({ meta: [{ title: "Success Stories · Sahaayak AI" }] }),
  component: SuccessStories,
});

function SuccessStories() {
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    setStories([
      {
        id: "story1",
        title: "From Rural Maharashtra to Google",
        story:
          "Coming from a village with poor internet, I started learning Python on my phone. The roadmap provided by Sahaayak AI helped me structure my learning. I eventually got an internship at TCS, which opened the door to Google.",
        career_outcome: "Software Engineer",
        company: "Google",
        similarity_score: 92,
        featured: true,
        author: "Ravi S.",
        location: "Solapur, MH",
      },
      {
        id: "story2",
        title: "Breaking into ML without a Tier-1 college",
        story:
          "I didn't have the IIT tag, so I focused purely on Kaggle competitions and open-source contributions. A mentor I met here reviewed my projects and referred me to NVIDIA.",
        career_outcome: "ML Engineer",
        company: "NVIDIA",
        similarity_score: 85,
        featured: false,
        author: "Anjali M.",
        location: "Pune, MH",
      },
    ]);
  }, []);

  return (
    <div className="space-y-4">
      <header className="glass-strong shadow-soft relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-primary/20 text-primary">
            <Star className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Success Stories
            </h1>
            <p className="text-sm text-muted-foreground">
              Inspiring journeys from students with backgrounds just like yours.
            </p>
          </div>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant="default" className="rounded-full h-8 text-xs">
          Recommended for You
        </Button>
        <Button variant="outline" className="rounded-full h-8 text-xs">
          First Generation
        </Button>
        <Button variant="outline" className="rounded-full h-8 text-xs">
          Rural Background
        </Button>
        <Button variant="outline" className="rounded-full h-8 text-xs">
          ML Engineering
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {stories.map((story, idx) => (
          <StoryCard key={idx} story={story} />
        ))}
      </div>
    </div>
  );
}

function StoryCard({ story }: { story: any }) {
  return (
    <article
      className={`glass shadow-soft rounded-3xl p-6 border ${story.featured ? "border-primary/30 bg-primary/5" : "border-border/50"}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-muted grid place-items-center">
            <span className="font-bold text-lg text-muted-foreground">
              {story.author[0]}
            </span>
          </div>
          <div>
            <h4 className="font-bold">{story.author}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3" /> {story.location}
            </p>
          </div>
        </div>
        {story.similarity_score >= 90 && (
          <div className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
            <Sparkles className="size-3" /> {story.similarity_score}% Similar
            Background
          </div>
        )}
      </div>

      <h3 className="font-bold text-xl mb-3 leading-tight">{story.title}</h3>
      <p className="text-sm text-foreground/80 mb-6 italic leading-relaxed">
        "{story.story}"
      </p>

      <div className="bg-background rounded-2xl p-4 border border-border/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wider">
            Current Role
          </p>
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <span className="font-semibold text-sm">
              {story.career_outcome}
            </span>
          </div>
        </div>
        <div className="h-px w-full sm:h-8 sm:w-px bg-border/50" />
        <div>
          <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wider">
            Company
          </p>
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <span className="font-semibold text-sm">{story.company}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
