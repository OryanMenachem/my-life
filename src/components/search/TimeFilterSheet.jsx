import { useState } from "react";
import { Sun, Calendar, CalendarDays, CalendarRange, Clock, ChevronRight } from "lucide-react";

const PRESETS = [
  { key: "today",  label: "Today",      Icon: Sun },
  { key: "week",   label: "This week",  Icon: CalendarDays },
  { key: "month",  label: "This month", Icon: Calendar },
  { key: "year",   label: "This year",  Icon: CalendarRange },
];

export default function TimeFilterSheet({ current, entryCounts, onSelect, onClose }) {
  const [showCustom, setShowCustom] = useState(current === "custom");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleSelect = (key) => {
    if (key === "custom") { setShowCustom(true); return; }
    onSelect(key, null);
  };

  const handleCustomApply = () => {
    if (!start || !end) return;
    onSelect("custom", { start: new Date(start), end: new Date(end + "T23:59:59") });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-background rounded-t-2xl pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grip */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        <div className="px-4 pb-8">
          {!showCustom ? (
            <>
              {/* Preset grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {PRESETS.map(({ key, label, Icon }) => {
                  const active = current === key;
                  const count = entryCounts[key] ?? 0;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(key)}
                      className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border transition-all active:scale-95 ${
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card border-border/50 text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-body font-semibold">{label}</span>
                      <span className={`text-xs font-body ${active ? "text-background/70" : "text-muted-foreground"}`}>
                        {count} {count === 1 ? "entry" : "entries"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom range */}
              <button
                onClick={() => handleSelect("custom")}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border mb-3 transition-all active:scale-95 ${
                  current === "custom"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border/50 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-body font-semibold">Custom range</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {/* All time */}
              <button
                onClick={() => onSelect("all", null)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all active:scale-95 ${
                  current === "all" || !current
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border/50 hover:bg-muted/40"
                }`}
              >
                <span className="text-sm font-body font-semibold">All time</span>
                <span className={`text-xs font-body ${current === "all" || !current ? "text-background/70" : "text-muted-foreground"}`}>
                  {entryCounts.all ?? 0} entries
                </span>
              </button>
            </>
          ) : (
            /* Custom date pickers */
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowCustom(false)}
                className="text-sm font-body text-muted-foreground text-left"
              >
                ← Back
              </button>
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">From</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted font-body text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">To</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-muted font-body text-sm outline-none"
                />
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!start || !end}
                className="w-full h-11 rounded-full bg-foreground text-background text-sm font-body font-semibold disabled:opacity-30 active:scale-95 transition-all"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}