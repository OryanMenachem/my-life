import { Pencil, Paperclip } from "lucide-react";
import useLiveClock from "@/hooks/useLiveClock";

export default function Composer({ onOpen }) {
  const time = useLiveClock();

  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-card rounded-2xl border border-border/50 shadow-sm px-5 pt-5 pb-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md active:scale-[0.99]"
      style={{ minHeight: "clamp(180px, 38vh, 260px)" }}
      aria-label="Write a new entry"
    >
      {/* Time row */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/30 flex-shrink-0" />
        <span className="text-sm font-body font-medium text-muted-foreground tabular-nums">
          {time}
        </span>
        <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground/60">
          now
        </span>
      </div>

      {/* Placeholder */}
      <p className="font-heading italic text-muted-foreground/50 text-[17px] leading-relaxed flex-1 flex items-center mt-4">
        What's on your mind right now?
      </p>

      {/* Bottom row: paperclip hint + pencil */}
      <div className="flex items-center justify-between mt-4">
        <Paperclip className="w-4 h-4 text-muted-foreground/40" strokeWidth={2} />
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "var(--theme-accent, #C08743)" }}
        >
          <Pencil className="w-4 h-4" style={{ color: "#fff" }} strokeWidth={2} />
        </span>
      </div>
    </button>
  );
}