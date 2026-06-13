import { SearchX } from "lucide-react";

export default function SearchEmptyState({ query, onSearchAllTime, onClearAll }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
        <SearchX className="w-7 h-7 text-accent-foreground" />
      </div>
      {query ? (
        <p className="font-heading text-[17px] text-foreground mb-1">
          Nothing for <span className="italic">"{query}"</span>
        </p>
      ) : (
        <p className="font-heading text-[17px] text-foreground mb-1">No matching entries</p>
      )}
      <p className="text-sm font-body text-muted-foreground mb-6 leading-relaxed">
        Try adjusting your filters or search all time.
      </p>
      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        <button
          onClick={onSearchAllTime}
          className="w-full h-11 rounded-full bg-foreground text-background text-sm font-body font-semibold active:scale-95 transition-all"
        >
          Search all time
        </button>
        <button
          onClick={onClearAll}
          className="w-full h-11 rounded-full bg-muted text-foreground text-sm font-body font-semibold active:scale-95 transition-all"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}