import useLiveClock from "@/hooks/useLiveClock";

// Straight pin SVG (attach)
const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 7.5v9a3.5 3.5 0 0 1-7 0V6.5a2 2 0 0 1 4 0v9.2a.8.8 0 0 1-1.6 0V8" />
  </svg>
);

// Round pencil SVG
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "#000000" }}>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export default function Composer({ onOpen }) {
  const time = useLiveClock();

  return (
    <button
      onClick={onOpen}
      className="w-full text-left px-4 pt-4 pb-4 flex flex-col bg-card border-b border-border"
      style={{ minHeight: "200px" }}
      aria-label="Write a new entry"
    >
      {/* Time row */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full flex-shrink-0 bg-muted-foreground/30" />
        <span className="text-xs font-body font-semibold tabular-nums text-muted-foreground">
          {time}
        </span>
        <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground/50">
          now
        </span>
      </div>

      {/* Placeholder */}
      <p className="font-heading italic text-[19px] leading-snug flex-1 text-muted-foreground/40">
        What's on your mind right now?
      </p>

      {/* Bottom row: straight pin + round pencil button */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-muted-foreground/40">
          <PinIcon />
        </span>
        <span
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 bg-secondary"
        >
          <PencilIcon />
        </span>
      </div>
    </button>
  );
}