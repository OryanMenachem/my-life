import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  format, startOfMonth, endOfMonth, addMonths, subMonths, isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import { useLang } from "@/lib/LanguageContext";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import DayEntriesPanel from "@/components/calendar/DayEntriesPanel";
import WriteScreen from "@/components/entries/WriteScreen";
import DeleteConfirmSheet from "@/components/entries/DeleteConfirmSheet";

export default function Calendar() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);
  const [writing, setWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);

  const queryClient = useQueryClient();
  const { tagById, categoryByKey } = useTagCatalog();
  const { lang } = useLang();

  const calendarTitle = lang === "he" ? "לוח שנה" : "Calendar";

  // Load entries for the visible month only
  const monthKey = format(month, "yyyy-MM");
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["calendar-entries", monthKey],
    queryFn: async () => {
      const start = startOfMonth(month).toISOString();
      const end = endOfMonth(month).toISOString();
      return base44.entities.Entry.filter(
        { entry_date: { $gte: start, $lte: end } },
        "-created_date",
        500
      );
    },
    staleTime: 1000 * 60 * 2,
  });

  // Build a map: "yyyy-MM-dd" → Entry[]
  const dotsByDay = useMemo(() => {
    const map = {};
    for (const entry of entries) {
      const d = entry.entry_date
        ? format(new Date(entry.entry_date), "yyyy-MM-dd")
        : format(new Date(entry.created_date), "yyyy-MM-dd");
      if (!map[d]) map[d] = [];
      map[d].push(entry);
    }
    return map;
  }, [entries]);

  const selectedDayKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const dayEntries = selectedDayKey ? dotsByDay[selectedDayKey] || [] : [];

  const goToPrev = () => { setMonth((m) => subMonths(m, 1)); setSelectedDay(null); };
  const goToNext = () => { setMonth((m) => addMonths(m, 1)); setSelectedDay(null); };
  const goToToday = () => { setMonth(startOfMonth(new Date())); setSelectedDay(new Date()); };

  // ── Create ──────────────────────────────────────────────────
  const handleCreate = (newEntry) => {
    queryClient.setQueryData(["calendar-entries", monthKey], (old = []) => [newEntry, ...old]);
    setWriting(false);
    queryClient.invalidateQueries({ queryKey: ["calendar-entries", monthKey] });
    queryClient.invalidateQueries({ queryKey: ["entries-feed"] });
  };

  // ── Edit ────────────────────────────────────────────────────
  const handleEditSave = (updated) => {
    queryClient.setQueryData(["calendar-entries", monthKey], (old = []) =>
      old.map((e) => (e.id === updated.id ? updated : e))
    );
    setEditingEntry(null);
    queryClient.invalidateQueries({ queryKey: ["calendar-entries", monthKey] });
    queryClient.invalidateQueries({ queryKey: ["entries-feed"] });
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    const entry = deletingEntry;
    setDeletingEntry(null);
    queryClient.setQueryData(["calendar-entries", monthKey], (old = []) =>
      old.filter((e) => e.id !== entry.id)
    );
    await base44.entities.Entry.delete(entry.id);
    queryClient.invalidateQueries({ queryKey: ["entries-feed"] });
  };

  // The day the user wants to add an entry for
  const entryDateForWrite = writing && selectedDay
    ? (() => {
        const d = new Date(selectedDay);
        const now = new Date();
        d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        return d.toISOString();
      })()
    : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 text-center">
          <h1 className="font-heading text-[21px] font-semibold tracking-[-0.5px] text-foreground uppercase">
            {calendarTitle}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5 gap-3">
          <button
            onClick={goToPrev}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <span className="text-base font-body font-semibold text-foreground flex-1 text-center">
            {format(month, "MMMM yyyy")}
          </span>

          <button
            onClick={goToNext}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          <button
            onClick={goToToday}
            className="text-xs font-body font-semibold px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            Today
          </button>
        </div>

        {/* Calendar grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <CalendarGrid
            month={month}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            dotsByDay={dotsByDay}
          />
        )}

        {/* Day entries panel */}
        {selectedDay && (
          <DayEntriesPanel
            day={selectedDay}
            entries={dayEntries}
            onEditEntry={setEditingEntry}
            onDeleteEntry={setDeletingEntry}
            onAddEntry={() => setWriting(true)}
            tagById={tagById}
            categoryByKey={categoryByKey}
          />
        )}
      </main>

      {/* Write screen — entry_date set to selected day */}
      {writing && (
        <WriteScreenWithDate
          entryDate={entryDateForWrite}
          onSave={handleCreate}
          onCancel={() => setWriting(false)}
        />
      )}

      {editingEntry && (
        <WriteScreen
          entry={editingEntry}
          onSave={handleEditSave}
          onCancel={() => setEditingEntry(null)}
          onDelete={() => { setEditingEntry(null); setDeletingEntry(editingEntry); }}
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

/**
 * Thin wrapper around WriteScreen that overrides the saved entry_date.
 */
function WriteScreenWithDate({ entryDate, onSave, onCancel }) {
  const handleSave = async (savedEntry) => {
    // If we have a target date, patch the entry_date after creation
    if (entryDate && savedEntry?.id) {
      try {
        const patched = await base44.entities.Entry.update(savedEntry.id, { entry_date: entryDate });
        onSave(patched);
        return;
      } catch { /* fall through */ }
    }
    onSave(savedEntry);
  };

  return (
    <WriteScreen
      onSave={handleSave}
      onCancel={onCancel}
      source="text"
    />
  );
}