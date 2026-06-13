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
      className="w-full text-left px-4 pt-4 pb-4 flex flex-col"
      style={{ minHeight: "200px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E5E5" }}
      aria-label="Write a new entry"
    >
      {/* Time row */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#D0D0D0" }} />
        <span className="text-xs font-body font-semibold tabular-nums" style={{ color: "#808080" }}>
          {time}
        </span>
        <span className="text-[10px] font-body font-semibold uppercase tracking-widest" style={{ color: "#A8A8A8" }}>
          now
        </span>
      </div>

      {/* Placeholder */}
      <p className="font-heading italic text-[19px] leading-snug flex-1" style={{ color: "#BFBFBF" }}>
        What's on your mind right now?
      </p>

      {/* Bottom row: straight pin + round pencil button */}
      <div className="flex items-center justify-between mt-3">
        <span style={{ color: "#A8A8A8" }}>
          <PinIcon />
        </span>
        <span
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#F6F6F6" }}
        >
          <PencilIcon />
        </span>
      </div>
    </button>
  );
}