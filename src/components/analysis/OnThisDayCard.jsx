import { format } from "date-fns";

export default function OnThisDayCard({ entries, onEntryClick }) {
  if (!entries || entries.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-5">
      <h3 className="font-heading text-[14px] font-semibold text-foreground mb-4">On this day</h3>
      <div className="space-y-3">
        {entries.map((entry) => {
          const date = new Date(entry.entry_date);
          const now = new Date();
          const yearsAgo = now.getFullYear() - date.getFullYear();
          const timeLabel =
            yearsAgo === 0
              ? format(date, "d MMM (this year)")
              : yearsAgo === 1
              ? format(date, "d MMM yyyy (1 year ago)")
              : format(date, `d MMM yyyy (${yearsAgo} years ago)`);

          const snippet =
            entry.content?.length > 140
              ? entry.content.slice(0, 140) + "…"
              : entry.content;

          return (
            <button
              key={entry.id}
              onClick={() => onEntryClick(entry)}
              className="w-full text-left block"
            >
              <p className="text-[11px] font-body font-semibold text-muted-foreground mb-1">
                {timeLabel}
              </p>
              {snippet && (
                <p className="text-[13px] font-body leading-relaxed text-foreground/80 line-clamp-2">
                  {snippet || "(no text)"}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}