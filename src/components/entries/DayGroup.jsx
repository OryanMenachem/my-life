import EntryCard from "./EntryCard";

export default function DayGroup({ label, entries, onEntryClick, onEditEntry, onDeleteEntry, tagById, categoryByKey, searchQuery }) {
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
      <div className="flex flex-col gap-[10px]">
        {entries.map((entry) => (
          <div key={entry.id} style={{ backgroundColor: "#FFFFFF" }}>
            <EntryCard
              entry={entry}
              onClick={() => onEntryClick(entry)}
              onEdit={() => onEditEntry(entry)}
              onDelete={() => onDeleteEntry(entry)}
              tagById={tagById}
              categoryByKey={categoryByKey}
              searchQuery={searchQuery}
            />
          </div>
        ))}
      </div>
    </div>
  );
}