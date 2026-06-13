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
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
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
  const [transcribing, setTranscribing] = useState(false);
  const [voiceText, setVoiceText] = useState(null); // text to open WriteScreen with

  const queryClient = useQueryClient();
  const { tagById, categoryByKey } = useTagCatalog();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.Entry.list("-created_date", 100),
  });

  const groups = groupEntriesByDay(entries);

  // ── Audio recorder + Whisper transcription ───────────────────
  const handleAudioResult = useCallback(async (blob) => {
    setTranscribing(true);
    try {
      // Upload the audio blob as a File
      const file = new File([blob], "recording.webm", { type: blob.type });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      setVoiceText(typeof transcript === "string" ? transcript : transcript?.text ?? "");
    } catch {
      // If transcription fails, still open write screen (empty)
      setVoiceText("");
    } finally {
      setTranscribing(false);
      setVoiceState(VOICE_IDLE);
    }
  }, []);

  const handleAudioError = useCallback((err) => {
    setVoiceState(err === "permission" ? VOICE_PERMISSION_ERROR : VOICE_NOT_SUPPORTED);
  }, []);

  const { start: startRecording, stop: stopRecording, cancel: cancelRecording } =
    useAudioRecorder({ onResult: handleAudioResult, onError: handleAudioError });

  const handleMicPress = () => {
    if (typeof MediaRecorder === "undefined") {
      setVoiceState(VOICE_NOT_SUPPORTED);
      return;
    }
    setVoiceState(VOICE_RECORDING);
    startRecording();
  };

  const handleVoiceStop = () => {
    stopRecording();
    // handleAudioResult will fire, which sets transcribing=true
  };

  const handleVoiceCancel = () => {
    cancelRecording();
    setTranscribing(false);
    setVoiceState(VOICE_IDLE);
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
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-2 text-center">
          <h1 className="font-heading text-[21px] font-semibold tracking-[-0.5px] text-foreground uppercase">
            MYLIFE
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto flex flex-col">
        <Composer onOpen={() => setWriting(true)} />

        {isLoading ? (
          <div className="flex items-center justify-center py-16 px-5">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="px-5 py-8"><EmptyState /></div>
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
          onDelete={() => { setEditingEntry(null); handleDeleteRequest(editingEntry); }}
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
          transcribing={transcribing}
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