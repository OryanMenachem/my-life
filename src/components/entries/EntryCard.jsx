import { format } from "date-fns";
import { getEntryDate } from "@/utils/groupEntriesByDay";

// Deterministic soft color from entry id
const MOOD_COLORS = [
  "bg-rose-300",
  "bg-amber-300",
  "bg-lime-300",
  "bg-teal-300",
  "bg-sky-300",
  "bg-violet-300",
  "bg-pink-300",
];

function moodColor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return MOOD_COLORS[Math.abs(hash) % MOOD_COLORS.length];
}

export default function EntryCard({ entry, onClick }) {
  const date = getEntryDate(entry);
  const timeStr = format(date, "HH:mm");
  const dot = moodColor(entry.id);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card px-5 py-4 transition-colors duration-150 hover:bg-muted/40 active:bg-muted/60 focus:outline-none"
    >
      {/* Meta row */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-xs font-body font-medium text-muted-foreground tabular-nums">
          {timeStr}
        </span>
      </div>

      {/* Content */}
      <p className="font-heading text-[15px] leading-relaxed text-foreground line-clamp-3">
        {entry.content}
      </p>
      {entry.content.length > 160 && (
        <span className="text-xs text-muted-foreground/70 font-body mt-1 inline-block">… more</span>
      )}
    </button>
  );
}