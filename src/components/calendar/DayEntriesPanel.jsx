import { format } from "date-fns";
import { PenLine } from "lucide-react";
import EntryCard from "@/components/entries/EntryCard";

export default function DayEntriesPanel({
  day,
  entries,
  onEntryClick,
  onEditEntry,
  onDeleteEntry,
  onAddEntry,
  tagById,
  categoryByKey,
}) {
  if (!day) return null;

  const label = format(day, "EEEE, d MMMM");
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );

  return (
    <div className="mt-4">
      {/* Day header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="text-sm font-body font-semibold text-foreground">{label}</span>
        <button
          onClick={onAddEntry}
          className="flex items-center gap-1 text-xs font-body font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted/60"
          aria-label="Add entry for this day"
        >
          <PenLine className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <span className="text-3xl">📭</span>
          <p className="text-sm font-body text-muted-foreground text-center">
            No entries on this day
          </p>
          <button
            onClick={onAddEntry}
            className="px-4 py-2 rounded-full text-sm font-body font-semibold bg-foreground text-background active:scale-95 transition-transform"
          >
            Write one
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden divide-y divide-border/40">
          {sorted.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onClick={() => onEntryClick(entry)}
              onEdit={() => onEditEntry(entry)}
              onDelete={() => onDeleteEntry(entry)}
              tagById={tagById}
              categoryByKey={categoryByKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}