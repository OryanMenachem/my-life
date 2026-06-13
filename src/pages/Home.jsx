import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EntryCard from "../components/entries/EntryCard";
import EmptyState from "../components/entries/EmptyState";
import Composer from "../components/entries/Composer";
import WriteScreen from "../components/entries/WriteScreen";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [writing, setWriting] = useState(false);
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.Entry.list("-created_date"),
  });

  const handleSave = (newEntry) => {
    // Optimistic: prepend immediately, then refetch to confirm
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
      <main className="max-w-lg mx-auto px-5 py-6 flex flex-col gap-4">
        {/* Composer */}
        <Composer onOpen={() => setWriting(true)} />

        {/* Feed */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
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
    </div>
  );
}