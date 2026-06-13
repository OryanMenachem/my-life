import { format } from "date-fns";

export default function EntryCard({ entry }) {
  const displayDate = entry.entry_date
    ? format(new Date(entry.entry_date), "MMM d, yyyy · h:mm a")
    : format(new Date(entry.created_date), "MMM d, yyyy · h:mm a");

  return (
    <div className="bg-card rounded-2xl px-5 py-4 shadow-sm border border-border/50 transition-all duration-200 hover:shadow-md">
      <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap">
        {entry.content}
      </p>
      <p className="text-muted-foreground text-xs mt-3 tracking-wide">
        {displayDate}
      </p>
    </div>
  );
}