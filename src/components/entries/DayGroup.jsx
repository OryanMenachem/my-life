import EntryCard from "./EntryCard";

export default function DayGroup({ label, entries, onEditEntry, onDeleteEntry, tagById, categoryByKey, searchQuery }) {
  return (
    <div>
      {/* Day header — "Today · 20 May" split into bold + soft */}
      <div className="px-4 pt-[14px] pb-2">
        {(() => {
          const parts = label.split(" · ");
          return (
            <span className="font-heading text-[14px] font-semibold text-foreground">
              {parts[0]}
              {parts[1] && (
                <span className="font-normal text-[10px] ml-[6px] text-muted-foreground">
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
          <div key={entry.id} className="bg-card">
            <EntryCard
              entry={entry}
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