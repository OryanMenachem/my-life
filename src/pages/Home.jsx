import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { groupEntriesByDay } from "@/utils/groupEntriesByDay";
import { useInfiniteEntries } from "@/hooks/useInfiniteEntries";
import DayGroup from "../components/entries/DayGroup";
import EmptyState from "../components/entries/EmptyState";
import Composer from "../components/entries/Composer";
import WriteScreen from "../components/entries/WriteScreen";
import DeleteConfirmSheet from "../components/entries/DeleteConfirmSheet";
import UndoSnackbar from "../components/entries/UndoSnackbar";
import VoiceMicButton from "../components/voice/VoiceMicButton";
import VoiceRecordingOverlay from "../components/voice/VoiceRecordingOverlay";
import VoicePermissionSheet from "../components/voice/VoicePermissionSheet";
import ImportReminderBanner from "../components/ImportReminderBanner";
import InfiniteScrollSentinel from "../components/InfiniteScrollSentinel";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTagCatalog } from "@/hooks/useTagCatalog";
import Avatar from "../components/Avatar";
import { Loader2 } from "lucide-react";

// Voice states
const VOICE_IDLE = "idle";
const VOICE_RECORDING = "recording";
const VOICE_PERMISSION_ERROR = "permission_error";
const VOICE_NOT_SUPPORTED = "not_supported";

export default function Home() {
  const navigate = useNavigate();
  const [writing, setWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [undoEntry, setUndoEntry] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const undoTimerRef = useRef(null);

  // Load avatar for Home header only
  useEffect(() => {
    base44.auth.me().then((u) => {
      setAvatarUrl(u?.avatar_url || null);
      setUserName(u?.full_name || "");
    }).catch(() => {});
  }, []);

  // Listen for avatar updates from Settings
  useEffect(() => {
    window.__refreshHomeAvatar = () => {
      base44.auth.me().then((u) => {
        setAvatarUrl(u?.avatar_url || null);
        setUserName(u?.full_name || "");
      }).catch(() => {});
    };
    return () => { delete window.__refreshHomeAvatar; };
  }, []);


  // Voice
  const [voiceState, setVoiceState] = useState(VOICE_IDLE);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceText, setVoiceText] = useState(null); // text to open WriteScreen with

  const {
    entries,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchNextPage,
    prependEntry,
    updateEntry,
    removeEntry,
    restoreEntry,
  } = useInfiniteEntries();
  const { tagById, categoryByKey } = useTagCatalog();

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
    prependEntry(newEntry);
    setWriting(false);
    setVoiceText(null);
  };

  // ── Edit ────────────────────────────────────────────────────
  const handleEditSave = (updatedEntry) => {
    updateEntry(updatedEntry);
    setEditingEntry(null);
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDeleteRequest = (entry) => setDeletingEntry(entry);

  const handleDeleteConfirm = () => {
    const entry = deletingEntry;
    setDeletingEntry(null);
    removeEntry(entry.id);
    setUndoEntry(entry);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(async () => {
      setUndoEntry(null);
      try {
        await base44.entities.Entry.delete(entry.id);
      } catch {
        restoreEntry(entry);
      }
    }, 5000);
  };

  const handleUndo = () => {
    clearTimeout(undoTimerRef.current);
    const entry = undoEntry;
    setUndoEntry(null);
    restoreEntry(entry);
  };

  // Voice entry is open when voiceText is non-null (including empty string)
  const voiceWriting = voiceText !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border relative">
        <div className="max-w-lg mx-auto px-4 py-3.5 text-center">
          <h1 className="font-heading text-[21px] font-semibold tracking-[-0.5px] text-foreground uppercase">
            MYLIFE
          </h1>
        </div>
        {/* Avatar — top-left corner, Home screen only */}
        <button
          onClick={() => navigate("/settings")}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full hover:opacity-85 transition-opacity active:scale-95"
          aria-label="Open profile"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <span className="block rounded-full flex-shrink-0 border-2 border-foreground/12 overflow-hidden" style={{ width: 42, height: 42 }}>
            <Avatar avatarUrl={avatarUrl} userName={userName} size={42} />
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto flex flex-col">
        <Composer onOpen={() => setWriting(true)} />

        {/* Import reminder banner */}
        <ImportReminderBanner onDescribe={(entry) => setEditingEntry(entry)} />

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
                onEditEntry={setEditingEntry}
                onDeleteEntry={handleDeleteRequest}
                tagById={tagById}
                categoryByKey={categoryByKey}
              />
            ))}
            <InfiniteScrollSentinel
              onIntersect={fetchNextPage}
              loading={isFetchingMore}
              hasMore={hasMore}
            />
          </div>
        )}
      </main>

      {/* Floating mic button — hidden when any overlay is open */}
      {!writing && !voiceWriting && !editingEntry && voiceState === VOICE_IDLE && (
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