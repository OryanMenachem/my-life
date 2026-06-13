import { useState, useMemo, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { useAllEntries, useFilteredEntriesWithTags } from "@/hooks/useSearchEntries";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import { groupEntriesByDay } from "@/utils/groupEntriesByDay";
import SearchBar from "@/components/search/SearchBar";
import QuickTagChips from "@/components/search/QuickTagChips";
import ActiveFilterRow from "@/components/search/ActiveFilterRow";
import AllTagsSheet from "@/components/search/AllTagsSheet";
import TimeFilterSheet from "@/components/search/TimeFilterSheet";
import SearchEmptyState from "@/components/search/SearchEmptyState";
import EntryDetail from "@/components/entries/EntryDetail";
import WriteScreen from "@/components/entries/WriteScreen";
import DeleteConfirmSheet from "@/components/entries/DeleteConfirmSheet";
import DayGroup from "@/components/entries/DayGroup";
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
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const undoTimerRef = useRef(null);

  const queryClient = useQueryClient();

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

  const groups = useMemo(() => {
    // Sort filtered entries newest-first
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.entry_date || a.created_date);
      const dateB = new Date(b.entry_date || b.created_date);
      return dateB - dateA;
    });
    return groupEntriesByDay(sorted);
  }, [filtered]);

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

  // ── Edit ────────────────────────────────────────────────────
  const handleEditSave = (updatedEntry) => {
    queryClient.invalidateQueries({ queryKey: ["entries"] });
    setEditingEntry(null);
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDeleteRequest = (entry) => setDeletingEntry(entry);

  const handleDeleteConfirm = () => {
    const entry = deletingEntry;
    setDeletingEntry(null);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(async () => {
      try {
        await base44.entities.Entry.delete(entry.id);
        queryClient.invalidateQueries({ queryKey: ["entries"] });
      } catch {
        queryClient.invalidateQueries({ queryKey: ["entries"] });
      }
    }, 5000);
    queryClient.invalidateQueries({ queryKey: ["entries"] });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search block — unified seamless */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3 flex flex-col gap-2">
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
      <main className="max-w-lg mx-auto w-full pb-24">
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
            <div className="px-4">
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
            </div>
            <SearchEmptyState
              query={rawQuery}
              onSearchAllTime={() => { setTimeFilter("all"); setCustomRange(null); }}
              onClearAll={clearAll}
            />
          </>
        ) : (
          <>
            <div className="px-4 pt-4">
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
            </div>
            <div className="mt-4">
              {groups.map((group) => (
                <DayGroup
                  key={group.dayKey}
                  label={group.label}
                  entries={group.entries}
                  onEntryClick={setSelectedEntry}
                  onEditEntry={setEditingEntry}
                  onDeleteEntry={handleDeleteRequest}
                  tagById={tagById}
                  categoryByKey={categoryByKey}
                  searchQuery={rawQuery}
                />
              ))}
            </div>
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
      {editingEntry && (
        <WriteScreen
          initialEntry={editingEntry}
          onSave={handleEditSave}
          onCancel={() => setEditingEntry(null)}
        />
      )}
      {deletingEntry && (
        <DeleteConfirmSheet
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingEntry(null)}
        />
      )}
    </div>
  );
}