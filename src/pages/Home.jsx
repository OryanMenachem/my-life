import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { groupEntriesByDay } from "@/utils/groupEntriesByDay";
import DayGroup from "../components/entries/DayGroup";
import EmptyState from "../components/entries/EmptyState";
import Composer from "../components/entries/Composer";
import WriteScreen from "../components/entries/WriteScreen";
import EntryDetail from "../components/entries/EntryDetail";
import DeleteConfirmSheet from "../components/entries/DeleteConfirmSheet";
import UndoSnackbar from "../components/entries/UndoSnackbar";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [writing, setWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [undoEntry, setUndoEntry] = useState(null); // entry saved for undo
  const undoTimerRef = useRef(null);

  const queryClient = useQueryClient();
  const { tagById, categoryByKey } = useTagCatalog();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.Entry.list("-created_date", 100),
  });

  const groups = groupEntriesByDay(entries);

  // ── Create ──────────────────────────────────────────────────
  const handleCreate = (newEntry) => {
    queryClient.setQueryData(["entries"], (old = []) => [newEntry, ...old]);
    setWriting(false);
    queryClient.invalidateQueries({ queryKey: ["entries"] });
  };

  // ── Edit ────────────────────────────────────────────────────
  const handleEditSave = (updatedEntry) => {
    queryClient.setQueryData(["entries"], (old = []) =>
      old.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
    setEditingEntry(null);
    queryClient.invalidateQueries({ queryKey: ["entries"] });
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDeleteRequest = (entry) => {
    setDeletingEntry(entry);
  };

  const handleDeleteConfirm = () => {
    const entry = deletingEntry;
    setDeletingEntry(null);

    // Optimistic removal
    queryClient.setQueryData(["entries"], (old = []) =>
      old.filter((e) => e.id !== entry.id)
    );

    // Show undo snackbar
    setUndoEntry(entry);

    // Timer: after 5s commit the delete for real
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(async () => {
      setUndoEntry(null);
      try {
        await base44.entities.Entry.delete(entry.id);
      } catch {
        // Restore on failure
        queryClient.setQueryData(["entries"], (old = []) =>
          [entry, ...old].sort(
            (a, b) => new Date(b.created_date) - new Date(a.created_date)
          )
        );
      }
    }, 5000);
  };

  const handleUndo = () => {
    clearTimeout(undoTimerRef.current);
    const entry = undoEntry;
    setUndoEntry(null);
    // Restore entry into cache
    queryClient.setQueryData(["entries"], (old = []) =>
      [entry, ...old].sort(
        (a, b) => new Date(b.created_date) - new Date(a.created_date)
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="max-w-lg mx-auto px-5 py-4">
          <h1 className="text-2xl font-heading font-semibold tracking-tight text-foreground">
            My Life
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-5 py-4 flex flex-col gap-1">
        <div className="mb-2">
          <Composer onOpen={() => setWriting(true)} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col">
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
              />
            ))}
          </div>
        )}
      </main>

      {/* New entry */}
      {writing && (
        <WriteScreen
          onSave={handleCreate}
          onCancel={() => setWriting(false)}
        />
      )}

      {/* Edit entry */}
      {editingEntry && (
        <WriteScreen
          entry={editingEntry}
          onSave={handleEditSave}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      {/* Entry detail */}
      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          tagById={tagById}
          categoryByKey={categoryByKey}
        />
      )}

      {/* Delete confirm sheet */}
      {deletingEntry && (
        <DeleteConfirmSheet
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingEntry(null)}
        />
      )}

      {/* Undo snackbar */}
      {undoEntry && (
        <UndoSnackbar
          onUndo={handleUndo}
          onExpire={() => setUndoEntry(null)}
        />
      )}
    </div>
  );
}