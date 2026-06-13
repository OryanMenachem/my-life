import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { groupEntriesByDay } from "@/utils/groupEntriesByDay";
import DayGroup from "../components/entries/DayGroup";
import EmptyState from "../components/entries/EmptyState";
import Composer from "../components/entries/Composer";
import WriteScreen from "../components/entries/WriteScreen";
import EntryDetail from "../components/entries/EntryDetail";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [writing, setWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.Entry.list("-created_date", 100),
  });

  const groups = groupEntriesByDay(entries);

  const handleSave = (newEntry) => {
    queryClient.setQueryData(["entries"], (old = []) => [newEntry, ...old]);
    setWriting(false);
    queryClient.invalidateQueries({ queryKey: ["entries"] });
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
        {/* Composer */}
        <div className="mb-2">
          <Composer onOpen={() => setWriting(true)} />
        </div>

        {/* Feed */}
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
              />
            ))}
          </div>
        )}
      </main>

      {/* Write screen overlay */}
      {writing && (
        <WriteScreen
          onSave={handleSave}
          onCancel={() => setWriting(false)}
        />
      )}

      {/* Entry detail overlay */}
      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}