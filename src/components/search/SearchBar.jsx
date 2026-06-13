import { Search, X, CalendarDays } from "lucide-react";
import { useState } from "react";

export default function SearchBar({ query, onChange, onTimeFilter, timeFilterActive }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex gap-2 items-stretch">
      {/* Search field */}
      <div
        className="flex-1 relative rounded-xl px-3 py-2 transition-all duration-150"
        style={{
          backgroundColor: "#FFFFFF",
          border: focused ? "2px solid #000000" : "1.5px solid #D0D0D0",
        }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#808080" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search entries…"
          className="w-full h-6 pl-6 pr-8 bg-transparent outline-none font-body text-sm"
          style={{ color: "#000000" }}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: "#E8E8E8", color: "#808080" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#D8D8D8"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#E8E8E8"}
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
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