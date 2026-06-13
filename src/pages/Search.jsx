import { useState, useMemo, useCallback } from "react";
import { useAllEntries, useFilteredEntriesWithTags } from "@/hooks/useSearchEntries";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import { groupSearchResults } from "@/utils/groupSearchResults";
import SearchBar from "@/components/search/SearchBar";
import QuickTagChips from "@/components/search/QuickTagChips";
import ActiveFilterRow from "@/components/search/ActiveFilterRow";
import AllTagsSheet from "@/components/search/AllTagsSheet";
import TimeFilterSheet from "@/components/search/TimeFilterSheet";
import SearchResultCard from "@/components/search/SearchResultCard";
import SearchEmptyState from "@/components/search/SearchEmptyState";
import EntryDetail from "@/components/entries/EntryDetail";
import { Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
} from "date-fns";

export default function Search() {
  const [rawQuery, setRawQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customRange, setCustomRange] = useState(null);
  const [allTagsOpen, setAllTagsOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const query = useDebounce(rawQuery, 180);

  const { data: entries = [], isLoading } = useAllEntries();
  const { categories, tags, tagById, categoryByKey } = useTagCatalog();

  // Compute top 3 most-used tags
  const topTags = useMemo(() => {
    const counts = {};
    for (const e of entries) {
      for (const id of (e.tag_ids || [])) {
        counts[id] = (counts[id] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
  }, [entries]);

  // Entry counts per time preset (for the time filter sheet)
  const entryCounts = useMemo(() => {
    const now = new Date();
    const ranges = {
      today: [startOfDay(now), endOfDay(now)],
      week: [startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })],
      month: [startOfMonth(now), endOfMonth(now)],
      year: [startOfYear(now), endOfYear(now)],
    };
    const counts = { all: entries.length };
    for (const [key, [start, end]] of Object.entries(ranges)) {
      counts[key] = entries.filter((e) => {
        const d = new Date(e.entry_date || e.created_date);
        return d >= start && d <= end;
      }).length;
    }
    return counts;
  }, [entries]);

  const filtered = useFilteredEntriesWithTags({
    entries,
    query,
    selectedTagIds,
    timeFilter,
    customRange,
    tagById,
  });

  const groups = useMemo(() => groupSearchResults(filtered), [filtered]);

  const hasFilters = rawQuery.trim() || selectedTagIds.length > 0 || (timeFilter && timeFilter !== "all");
  const showResults = hasFilters;

  const toggleTag = useCallback((id) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearAll = useCallback(() => {
    setRawQuery("");
    setSelectedTagIds([]);
    setTimeFilter("all");
    setCustomRange(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search block — flush, matches Composer layout */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-4 flex flex-col" style={{ minHeight: "auto" }}>
          <SearchBar
            query={rawQuery}
            onChange={setRawQuery}
            onTimeFilter={() => setTimeSheetOpen(true)}
            timeFilterActive={timeFilter !== "all"}
          />
          <QuickTagChips
            topTags={topTags}
            tagById={tagById}
            categoryByKey={categoryByKey}
            selectedTagIds={selectedTagIds}
            onToggleTag={toggleTag}
            onAllTags={() => setAllTagsOpen(true)}
          />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : !showResults ? (
          /* Idle state: show a prompt */
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="font-heading text-[17px] text-muted-foreground/60 italic">
              Search your journal…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <>
            <ActiveFilterRow
              query={rawQuery}
              selectedTagIds={selectedTagIds}
              timeFilter={timeFilter}
              tagById={tagById}
              categoryByKey={categoryByKey}
              onRemoveQuery={() => setRawQuery("")}
              onRemoveTag={(id) => setSelectedTagIds((p) => p.filter((x) => x !== id))}
              onRemoveTime={() => { setTimeFilter("all"); setCustomRange(null); }}
              onClearAll={clearAll}
            />
            <SearchEmptyState
              query={rawQuery}
              onSearchAllTime={() => { setTimeFilter("all"); setCustomRange(null); }}
              onClearAll={clearAll}
            />
          </>
        ) : (
          <>
            <ActiveFilterRow
              query={rawQuery}
              selectedTagIds={selectedTagIds}
              timeFilter={timeFilter}
              tagById={tagById}
              categoryByKey={categoryByKey}
              onRemoveQuery={() => setRawQuery("")}
              onRemoveTag={(id) => setSelectedTagIds((p) => p.filter((x) => x !== id))}
              onRemoveTime={() => { setTimeFilter("all"); setCustomRange(null); }}
              onClearAll={clearAll}
            />
            {groups.map((group) => (
              <div key={group.key} className="mt-4">
                {/* Group header */}
                <div className="px-1 pb-2">
                  <span className="font-heading text-sm font-semibold text-foreground/70 tracking-wide">
                    {group.label} · {group.entries.length}
                  </span>
                </div>
                {/* Cards */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  {group.entries.map((entry, i) => (
                    <div key={entry.id}>
                      <SearchResultCard
                        entry={entry}
                        query={query}
                        onClick={() => setSelectedEntry(entry)}
                        tagById={tagById}
                        categoryByKey={categoryByKey}
                      />
                      {i < group.entries.length - 1 && (
                        <div className="mx-5 h-px bg-border/50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      {/* Sheets */}
      {allTagsOpen && (
        <AllTagsSheet
          categories={categories}
          tags={tags}
          selectedTagIds={selectedTagIds}
          onClose={(ids) => { setSelectedTagIds(ids); setAllTagsOpen(false); }}
        />
      )}
      {timeSheetOpen && (
        <TimeFilterSheet
          current={timeFilter}
          entryCounts={entryCounts}
          onSelect={(key, range) => {
            setTimeFilter(key);
            setCustomRange(range);
            setTimeSheetOpen(false);
          }}
          onClose={() => setTimeSheetOpen(false)}
        />
      )}
      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          tagById={tagById}
          categoryByKey={categoryByKey}
        />
      )}
    </div>
  );
}