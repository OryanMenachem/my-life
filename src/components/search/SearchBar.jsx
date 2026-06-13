import { Search, X, CalendarDays } from "lucide-react";

export default function SearchBar({ query, onChange, onTimeFilter, timeFilterActive }) {
  return (
    <div className="flex gap-2 items-stretch">
      {/* Search field */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search entries…"
          className="w-full h-10 pl-9 pr-8 bg-transparent outline-none font-body text-sm text-foreground placeholder:text-muted-foreground/50"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Time filter button */}
      <button
        onClick={onTimeFilter}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          timeFilterActive
            ? "bg-foreground text-background"
            : "bg-muted/60 text-muted-foreground hover:bg-muted"
        }`}
        aria-label="Time filter"
      >
        <CalendarDays className="w-4 h-4" />
        {timeFilterActive && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </button>
    </div>
  );
}