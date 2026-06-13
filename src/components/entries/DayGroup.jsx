import EntryCard from "./EntryCard";

export default function DayGroup({ label, entries, onEntryClick, tagById, categoryByKey }) {
  return (
    <div>
      {/* Day header */}
      <div className="px-5 pt-5 pb-2">
        <span className="font-heading text-sm font-semibold text-foreground/70 tracking-wide">
          {label}
        </span>
      </div>

      {/* Cards with hairline separators */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {entries.map((entry, i) => (
          <div key={entry.id}>
            <EntryCard entry={entry} onClick={() => onEntryClick(entry)} tagById={tagById} categoryByKey={categoryByKey} />
            {i < entries.length - 1 && (
              <div className="mx-5 h-px bg-border/50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}