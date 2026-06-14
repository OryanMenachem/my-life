import { useState, useCallback, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useFilteredSearchEntries, useSearchStats } from "@/hooks/useSearchEntries";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import { groupEntriesByDay } from "@/utils/groupEntriesByDay";
import SearchBar from "@/components/search/SearchBar";
import QuickTagChips from "@/components/search/QuickTagChips";
import ActiveFilterRow from "@/components/search/ActiveFilterRow";
import ContentTypeFilter from "@/components/search/ContentTypeFilter";
import AllTagsSheet from "@/components/search/AllTagsSheet";
import TimeFilterSheet from "@/components/search/TimeFilterSheet";
import SearchEmptyState from "@/components/search/SearchEmptyState";
import InfiniteScrollSentinel from "@/components/InfiniteScrollSentinel";
import WriteScreen from "@/components/entries/WriteScreen";
import DeleteConfirmSheet from "@/components/entries/DeleteConfirmSheet";
import UndoSnackbar from "@/components/entries/UndoSnackbar";
import DayGroup from "@/components/entries/DayGroup";
import { Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function Search() {
  const [rawQuery, setRawQuery] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customRange, setCustomRange] = useState(null);
  const [allTagsOpen, setAllTagsOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [undoEntry, setUndoEntry] = useState(null);
  const undoTimerRef = useRef(null);

  const query = useDebounce(rawQuery, 280);
  const { categories, tags, tagById, categoryByKey } = useTagCatalog();

  const {
    entries,
    allEntries,
    filtered,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchNextPage,
    refetch,
  } = useFilteredSearchEntries({
    query,
    selectedTagIds,
    contentTypes,
    timeFilter,
    customRange,
    tagById,
  });

  // Compute stats from the FULL entry set (not just the loaded page)
  const { topTags, entryCounts } = useSearchStats({ allEntries });

  const groups = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      const dateA = new Date(a.entry_date || a.created_date);
      const dateB = new Date(b.entry_date || b.created_date);
      return dateB - dateA;
    });
    return groupEntriesByDay(sorted);
  }, [entries]);

  const hasFilters = rawQuery.trim() || selectedTagIds.length > 0 || contentTypes.length > 0 || (timeFilter && timeFilter !== "all");
  const showResults = hasFilters;

  const toggleTag = useCallback((id) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleContentType = useCallback((type) => {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const clearAll = useCallback(() => {
    setRawQuery("");
    setSelectedTagIds([]);
    setContentTypes([]);
    setTimeFilter("all");
    setCustomRange(null);
  }, []);

  // ── Edit ──
  const handleEditSave = (updatedEntry) => {
    setEditingEntry(null);
    refetch();
  };

  // ── Delete ──
  const handleDeleteRequest = (entry) => setDeletingEntry(entry);

  const handleDeleteConfirm = () => {
    const entry = deletingEntry;
    setDeletingEntry(null);
    setUndoEntry(entry);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(async () => {
      setUndoEntry(null);
      try {
        await base44.entities.Entry.delete(entry.id);
        refetch();
      } catch { /* ignore */ }
    }, 5000);
  };

  const handleUndo = () => {
    clearTimeout(undoTimerRef.current);
    setUndoEntry(null);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search block */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3 flex flex-col gap-2">
          <SearchBar
            query={rawQuery}
            onChange={setRawQuery}
            onTimeFilter={() => setTimeSheetOpen(true)}
            timeFilterActive={timeFilter !== "all"}
          />
          <ContentTypeFilter
            selected={contentTypes}
            onToggle={toggleContentType}
          />
          <div className="mt-2">
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
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto w-full pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : !showResults ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="font-heading text-[17px] text-muted-foreground/60 italic">
              Search your journal…
            </p>
          </div>
        ) : entries.length === 0 ? (
          <>
            <div className="px-4">
              <ActiveFilterRow
                query={rawQuery}
                selectedTagIds={selectedTagIds}
                contentTypes={contentTypes}
                timeFilter={timeFilter}
                tagById={tagById}
                categoryByKey={categoryByKey}
                onRemoveQuery={() => setRawQuery("")}
                onRemoveTag={(id) => setSelectedTagIds((p) => p.filter((x) => x !== id))}
                onRemoveContentType={(ct) => setContentTypes((p) => p.filter((t) => t !== ct))}
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
                contentTypes={contentTypes}
                timeFilter={timeFilter}
                tagById={tagById}
                categoryByKey={categoryByKey}
                onRemoveQuery={() => setRawQuery("")}
                onRemoveTag={(id) => setSelectedTagIds((p) => p.filter((x) => x !== id))}
                onRemoveContentType={(ct) => setContentTypes((p) => p.filter((t) => t !== ct))}
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
                  onEditEntry={setEditingEntry}
                  onDeleteEntry={handleDeleteRequest}
                  tagById={tagById}
                  categoryByKey={categoryByKey}
                  searchQuery={rawQuery}
                />
              ))}
              <InfiniteScrollSentinel
                onIntersect={fetchNextPage}
                loading={isFetchingMore}
                hasMore={hasMore}
              />
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
      {editingEntry && (
        <WriteScreen
          entry={editingEntry}
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
      {undoEntry && (
        <UndoSnackbar
          onUndo={handleUndo}
          onExpire={() => setUndoEntry(null)}
        />
      )}
    </div>
  );
}