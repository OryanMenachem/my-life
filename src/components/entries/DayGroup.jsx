import EntryCard from "./EntryCard";

export default function DayGroup({ label, entries, onEntryClick, onEditEntry, onDeleteEntry, tagById, categoryByKey }) {
  return (
    <div>
      {/* Day header — "Today · 20 May" split into bold + soft */}
      <div className="px-4 pt-[14px] pb-2">
        {(() => {
          const parts = label.split(" · ");
          return (
            <span className="font-heading text-[14px] font-semibold" style={{ color: "#211f1b" }}>
              {parts[0]}
              {parts[1] && (
                <span className="font-normal text-[10px] ml-[6px]" style={{ color: "#8c867c" }}>
                  · {parts[1]}
                </span>
              )}
            </span>
          );
        })()}
      </div>

      {/* Cards flush white block, hairline separators */}
      <div className="bg-card">
        {entries.map((entry, i) => (
          <div key={entry.id}>
            <EntryCard
              entry={entry}
              onClick={() => onEntryClick(entry)}
              onEdit={() => onEditEntry(entry)}
              onDelete={() => onDeleteEntry(entry)}
              tagById={tagById}
              categoryByKey={categoryByKey}
            />
            {i < entries.length - 1 && (
              <div className="h-px bg-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}