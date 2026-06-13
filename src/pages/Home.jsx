import { useState, useRef, useCallback } from "react";
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
import VoiceMicButton from "../components/voice/VoiceMicButton";
import VoiceRecordingOverlay from "../components/voice/VoiceRecordingOverlay";
import VoicePermissionSheet from "../components/voice/VoicePermissionSheet";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import { Loader2 } from "lucide-react";

// Voice states
const VOICE_IDLE = "idle";
const VOICE_RECORDING = "recording";
const VOICE_PERMISSION_ERROR = "permission_error";
const VOICE_NOT_SUPPORTED = "not_supported";

export default function Home() {
  const [writing, setWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [undoEntry, setUndoEntry] = useState(null);
  const undoTimerRef = useRef(null);

  // Voice
  const [voiceState, setVoiceState] = useState(VOICE_IDLE);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceText, setVoiceText] = useState(null); // text to open WriteScreen with
  const userLangRef = useRef("en");

  const queryClient = useQueryClient();
  const { tagById, categoryByKey } = useTagCatalog();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      // Opportunistically load user language
      try {
        const me = await base44.auth.me();
        if (me?.language) userLangRef.current = me.language;
      } catch { /* ok */ }
      return base44.entities.Entry.list("-created_date", 100);
    },
  });

  const groups = groupEntriesByDay(entries);

  // ── Speech recognition ───────────────────────────────────────
  const langCode = userLangRef.current === "he" ? "he-IL" : "en-US";

  const handleTranscript = useCallback((text) => setLiveTranscript(text), []);

  const handleResult = useCallback((text) => {
    setVoiceState(VOICE_IDLE);
    setLiveTranscript("");
    // Always open write screen — even if empty the user can type
    setVoiceText(text);
  }, []);

  const handleSpeechError = useCallback((msg) => {
    setVoiceState(
      msg.includes("permission") || msg.includes("not-allowed")
        ? VOICE_PERMISSION_ERROR
        : VOICE_IDLE
    );
    setLiveTranscript("");
    // On generic error still open write screen with whatever was captured
    if (!msg.includes("permission") && !msg.includes("not-allowed")) {
      setVoiceText(liveTranscript || "");
    }
  }, [liveTranscript]);

  const { isSupported, start: startRecognition, stop: stopRecognition } =
    useSpeechRecognition({
      language: langCode,
      onTranscript: handleTranscript,
      onResult: handleResult,
      onError: handleSpeechError,
    });

  const handleMicPress = async () => {
    if (!isSupported) {
      setVoiceState(VOICE_NOT_SUPPORTED);
      return;
    }
    // Request permission by attempting to get mic
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setVoiceState(VOICE_PERMISSION_ERROR);
      return;
    }
    setLiveTranscript("");
    setVoiceState(VOICE_RECORDING);
    startRecognition();
  };

  const handleVoiceStop = () => {
    stopRecognition();
    // onResult will fire after stop
    // If it doesn't fire (e.g. no speech), fall through with empty
  };

  const handleVoiceCancel = () => {
    stopRecognition();
    setVoiceState(VOICE_IDLE);
    setLiveTranscript("");
  };

  // ── Create ──────────────────────────────────────────────────
  const handleCreate = (newEntry) => {
    queryClient.setQueryData(["entries"], (old = []) => [newEntry, ...old]);
    setWriting(false);
    setVoiceText(null);
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
  const handleDeleteRequest = (entry) => setDeletingEntry(entry);

  const handleDeleteConfirm = () => {
    const entry = deletingEntry;
    setDeletingEntry(null);
    queryClient.setQueryData(["entries"], (old = []) =>
      old.filter((e) => e.id !== entry.id)
    );
    setUndoEntry(entry);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(async () => {
      setUndoEntry(null);
      try {
        await base44.entities.Entry.delete(entry.id);
      } catch {
        queryClient.setQueryData(["entries"], (old = []) =>
          [entry, ...old].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        );
      }
    }, 5000);
  };

  const handleUndo = () => {
    clearTimeout(undoTimerRef.current);
    const entry = undoEntry;
    setUndoEntry(null);
    queryClient.setQueryData(["entries"], (old = []) =>
      [entry, ...old].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    );
  };

  // Voice entry is open when voiceText is non-null (including empty string)
  const voiceWriting = voiceText !== null;

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

      {/* Floating mic button — hidden when any overlay is open */}
      {!writing && !voiceWriting && !editingEntry && !selectedEntry && voiceState === VOICE_IDLE && (
        <VoiceMicButton onClick={handleMicPress} />
      )}

      {/* Text new entry */}
      {writing && (
        <WriteScreen
          onSave={handleCreate}
          onCancel={() => setWriting(false)}
          source="text"
        />
      )}

      {/* Voice → WriteScreen */}
      {voiceWriting && (
        <WriteScreen
          onSave={handleCreate}
          onCancel={() => setVoiceText(null)}
          source="voice"
          initialText={voiceText}
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

      {/* Delete confirm */}
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

      {/* Voice recording overlay */}
      {voiceState === VOICE_RECORDING && (
        <VoiceRecordingOverlay
          transcript={liveTranscript}
          onStop={handleVoiceStop}
          onCancel={handleVoiceCancel}
        />
      )}

      {/* Permission / not-supported sheet */}
      {(voiceState === VOICE_PERMISSION_ERROR || voiceState === VOICE_NOT_SUPPORTED) && (
        <VoicePermissionSheet
          reason={voiceState === VOICE_PERMISSION_ERROR ? "denied" : "unsupported"}
          onWriteInstead={() => { setVoiceState(VOICE_IDLE); setWriting(true); }}
          onDismiss={() => setVoiceState(VOICE_IDLE)}
        />
      )}
    </div>
  );
}