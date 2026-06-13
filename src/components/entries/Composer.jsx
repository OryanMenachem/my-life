import useLiveClock from "@/hooks/useLiveClock";

// Straight pin SVG (attach)
const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 7.5v9a3.5 3.5 0 0 1-7 0V6.5a2 2 0 0 1 4 0v9.2a.8.8 0 0 1-1.6 0V8" />
  </svg>
);

// Round pencil SVG
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

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

      {/* Bottom row: straight pin + round pencil button */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-muted-foreground/40">
          <PinIcon />
        </span>
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--theme-accent, #C08743)" }}
        >
          <PencilIcon />
        </span>
      </div>
    </button>
  );
}