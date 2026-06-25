import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid size-9 place-items-center rounded-xl text-primary-foreground shadow-glow",
        className,
      )}
      style={{ background: "var(--gradient-primary)" }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M12 3l2.5 5.5L20 10l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5L12 3z"
          fill="currentColor"
          opacity=".95"
        />
      </svg>
    </div>
  );
}

export function BrandLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight">
            Sahaayak AI
          </span>
        </div>
      )}
    </div>
  );
}
