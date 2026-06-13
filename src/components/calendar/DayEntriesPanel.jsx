import { format } from "date-fns";
import { PenLine } from "lucide-react";
import EntryCard from "@/components/entries/EntryCard";
import DayGroup from "@/components/entries/DayGroup";

export default function DayEntriesPanel({
  day,
  entries,
  onEditEntry,
  onDeleteEntry,
  onAddEntry,
  tagById,
  categoryByKey,
}) {
  if (!day) return null;

  const label = format(day, "EEEE · d MMMM");
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );

  return (
    <div className="mt-4">
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
        <DayGroup
          label={label}
          entries={sorted}
          onEditEntry={onEditEntry}
          onDeleteEntry={onDeleteEntry}
          tagById={tagById}
          categoryByKey={categoryByKey}
        />
      )}
    </div>
  );
}