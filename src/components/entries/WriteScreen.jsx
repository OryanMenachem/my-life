import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, X, Trash2, Link as LinkIcon, Sun, Moon, Heart, Zap, Wind, Cloud, Briefcase, Users, User, HeartPulse, BookOpen, Home, TreePine, Plane, Lightbulb, Mountain, Star, Crosshair, UtensilsCrossed, GlassWater, Coffee, Waves, Umbrella, Compass, Sailboat, MapPin, Ticket, Leaf, Trees, ShoppingBag, Film, Music, Landmark, Sparkles, ChefHat } from "lucide-react";

const ICON_MAP = {
  "sun": Sun, "moon": Moon, "heart": Heart, "zap": Zap, "wind": Wind, "cloud": Cloud,
  "briefcase": Briefcase, "users": Users, "user": User, "heart-pulse": HeartPulse,
  "book-open": BookOpen, "home": Home, "tree-pine": TreePine, "plane": Plane,
  "lightbulb": Lightbulb, "mountain": Mountain,
  "star": Star, "crosshair": Crosshair,
  "utensils-crossed": UtensilsCrossed, "glass-water": GlassWater, "coffee": Coffee,
  "waves": Waves, "umbrella": Umbrella, "compass": Compass, "sailboat": Sailboat,
  "map-pin": MapPin, "ticket": Ticket, "leaf": Leaf, "trees": Trees,
  "shopping-bag": ShoppingBag, "film": Film, "music": Music, "landmark": Landmark,
  "sparkles": Sparkles,
  "chef-hat": ChefHat,
};
import { useTagCatalog } from "@/hooks/useTagCatalog";
import { useMediaUploader } from "@/hooks/useMediaUploader";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { autoTagEntry } from "@/utils/autoTag";
import TagPickerSheet from "@/components/tags/TagPickerSheet";
import AutoTagButton from "@/components/tags/AutoTagButton";
import VoiceRecordingOverlay from "@/components/voice/VoiceRecordingOverlay";
import VoicePermissionSheet from "@/components/voice/VoicePermissionSheet";
import VoiceMicButton from "@/components/voice/VoiceMicButton";
import MediaRow from "./MediaRow";
import LinkCard from "./LinkCard";

/**
 * Used for both creating (entry=null) and editing (entry=existing).
 * onSave(savedEntry) is called with the created/updated record.
 * source: "text" | "voice" — stored on the entry when creating.
 * initialText: pre-filled text (e.g. from voice transcription).
 */
export default function WriteScreen({ onSave, onCancel, onDelete, entry = null, source = "text", initialText = "" }) {
  const isEdit = !!entry;

  const [text, setText] = useState(entry?.content ?? initialText);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState(entry?.tag_ids ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linkAdding, setLinkAdding] = useState(false);
  const textareaRef = useRef(null);

  const { categories, tags, categoryByKey, tagById } = useTagCatalog();
  const { items: mediaItems, addFiles, addLinkItem, removeItem, retryItem, readyMedia, hasUploading } =
    useMediaUploader(entry?.media ?? []);

  // ── Voice recording ──────────────────────────────────────────
  const [voiceState, setVoiceState] = useState("idle"); // idle | recording | permission_error | not_supported
  const [transcribing, setTranscribing] = useState(false);

  const handleAudioResult = useCallback(async (blob) => {
    setTranscribing(true);
    try {
      const file = new File([blob], "recording.webm", { type: blob.type });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      const result = typeof transcript === "string" ? transcript : transcript?.text ?? "";

      if (result) {
        const textarea = textareaRef.current;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const before = text.substring(0, cursorPos);
          const after = text.substring(textarea.selectionEnd || cursorPos);
          const needsSpaceBefore = before.length > 0 && !before.endsWith("\n") && !before.endsWith(" ");
          const needsSpaceAfter = after.length > 0 && !after.startsWith("\n") && !after.startsWith(" ");
          const prefix = needsSpaceBefore ? " " : "";
          const suffix = needsSpaceAfter ? " " : "";
          const combined = before + prefix + result + suffix + after;
          setText(combined);
          // Restore cursor after the inserted text
          const newPos = cursorPos + prefix.length + result.length + suffix.length;
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newPos, newPos);
          }, 50);
        } else {
          setText((prev) => {
            const separator = prev && !prev.endsWith("\n") ? " " : "";
            return prev + separator + result + " ";
          });
        }
      }
    } catch {
      // Failed silently — keep existing text
    } finally {
      setTranscribing(false);
      setVoiceState("idle");
    }
  }, [text]);

  const handleAudioError = useCallback((err) => {
    setVoiceState(err === "permission" ? "permission_error" : "not_supported");
  }, []);

  const { start: startRecording, stop: stopRecording, cancel: cancelRecording } =
    useAudioRecorder({ onResult: handleAudioResult, onError: handleAudioError });

  const handleMicPress = () => {
    if (typeof MediaRecorder === "undefined") {
      setVoiceState("not_supported");
      return;
    }
    setVoiceState("recording");
    startRecording();
  };

  useEffect(() => {
    const id = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, []);

  const trimmed = text.trim();
  const hasText = trimmed.length > 0;
  const hasMedia = readyMedia.length > 0;
  const hasContent = hasText || hasMedia;
  const canSave = hasContent && !saving;

  const handleAddFiles = async (files) => {
    setMediaError("");
    const errors = await addFiles(files);
    if (errors.length > 0) setMediaError(errors.join(" "));
  };

  const handleAddLink = async () => {
    const url = linkUrl.trim();
    if (!url) return;
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setLinkError("Please enter a valid URL");
      return;
    }
    setLinkError("");
    setLinkAdding(true);
    let title = "";
    let thumbnailUrl = "";
    try {
      // Try to fetch page title and og:image
      const resp = await fetch(url, { mode: "no-cors" });
      // no-cors mode won't let us read the response, so just use domain
    } catch { /* ignore */ }
    // Use domain as fallback title
    try {
      const u = new URL(url);
      title = u.hostname.replace(/^www\./, "");
    } catch {
      title = url;
    }
    addLinkItem(url, title, thumbnailUrl);
    setLinkUrl("");
    setShowLinkInput(false);
    setLinkAdding(false);
  };

  const handleSave = async () => {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setError("");
    setSaving(true);
    try {
      let finalTagIds = [...selectedTagIds];
      let language = "en";

      if (!isEdit) {
        // Fetch user settings (language + auto_ai_tagging)
        try {
          const me = await base44.auth.me();
          if (me?.language) language = me.language;

          // Auto AI tagging for new entries when enabled
          if (me?.auto_ai_tagging && trimmed) {
            try {
              const aiIds = await autoTagEntry(trimmed, tags, categoryByKey);
              const existing = new Set(finalTagIds);
              aiIds.forEach((id) => {
                if (!existing.has(id)) finalTagIds.push(id);
              });
            } catch {
              // AI failed, continue with manual tags only
            }
          }
        } catch {
          /* use defaults */
        }
      }

      let savedEntry;
      if (isEdit) {
        savedEntry = await base44.entities.Entry.update(entry.id, {
          content: trimmed || "",
          tag_ids: finalTagIds,
          media: readyMedia,
          updated_date: new Date().toISOString(),
        });
      } else {
        savedEntry = await base44.entities.Entry.create({
          content: trimmed || "",
          source: source,
          entry_date: new Date().toISOString(),
          language,
          tag_ids: finalTagIds,
          media: readyMedia,
        });
      }
      onSave(savedEntry);
    } catch {
      setError("Couldn't save. Your text is safe — please try again.");
      setSaving(false);
      savingRef.current = false;
    }
  };

  const removeTag = (id) => setSelectedTagIds((prev) => prev.filter((t) => t !== id));

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 flex-shrink-0">
        <button
          onClick={onCancel}
          className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
        >
          Cancel
        </button>
        <span className="text-sm font-body font-semibold text-foreground">
          {isEdit ? "Edit entry" : "New entry"}
        </span>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all duration-150 bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
        >
          {saving ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving
            </span>
          ) : (
            "Save"
          )}
        </button>
      </div>

      {/* Error banners */}
      {error && (
        <div className="mx-5 mt-3 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-body flex-shrink-0">
          {error}
        </div>
      )}
      {mediaError && (
        <div className="mx-5 mt-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-body flex-shrink-0">
          {mediaError}
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2">
        {/* Entry meta (date dot) */}
        {isEdit && (
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30 flex-shrink-0" />
            <span className="text-xs font-body text-muted-foreground">
              {entry?.entry_date
                ? new Date(entry.entry_date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                : ""}
            </span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={5000}
          placeholder="Start writing…"
          dir={/[\u0590-\u05FF\uFB1D-\uFB4F]/.test(text.slice(0, 60)) ? "rtl" : "ltr"}
          className="w-full min-h-[30vh] resize-none bg-transparent outline-none font-heading text-[18px] leading-[1.75] text-foreground placeholder:text-muted-foreground/40 placeholder:italic"
        />
        {text.length > 4500 && (
          <p className={`text-right text-[11px] font-body mt-1 transition-colors ${text.length >= 5000 ? "text-destructive" : "text-muted-foreground/60"}`}>
            {text.length}/5000
          </p>
        )}

        {/* Media row */}
        <div className="mt-3 pb-2">
          <MediaRow
            items={mediaItems}
            onAddFiles={handleAddFiles}
            onAddLink={() => setShowLinkInput(true)}
            onRemove={removeItem}
            onRetry={retryItem}
          />
        </div>

        {/* Link input */}
        {showLinkInput && (
          <div className="mt-2 flex gap-2 items-start">
            <div className="flex-1 flex flex-col gap-1">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => { setLinkUrl(e.target.value); setLinkError(""); }}
                placeholder="Paste a URL..."
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] font-body text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/30 transition-colors"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleAddLink(); }}
              />
              {linkError && (
                <span className="text-[11px] font-body text-destructive">{linkError}</span>
              )}
            </div>
            <button
              onClick={handleAddLink}
              disabled={linkAdding || !linkUrl.trim()}
              className="h-9 px-4 rounded-lg bg-foreground text-background text-[12px] font-body font-semibold disabled:opacity-30 transition-opacity active:scale-95"
            >
              {linkAdding ? "..." : "Add"}
            </button>
          </div>
        )}

        {hasUploading && (
          <p className="text-xs font-body text-muted-foreground mt-1">
            Uploading…
          </p>
        )}

        {/* AI Auto-tag */}
        <div className="mt-5">
          <AutoTagButton
            text={text}
            tags={tags}
            categoryByKey={categoryByKey}
            selectedIds={selectedTagIds}
            onTagsAdded={(newIds) =>
              setSelectedTagIds((prev) => [...prev, ...newIds])
            }
          />
        </div>

        {/* Tags label + chips */}
        <div className="mt-3">
          <p className="text-[11px] font-body font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2 items-center">
            {selectedTagIds.map((id) => {
              const tag = tagById[id];
              if (!tag) return null;
              const cat = categoryByKey[tag.category_key];
              const CAT_STYLES = {
                mood:     { bg: "#f6ecd9", fg: "#946a2b", bd: "#dcc59c" },
                life:     { bg: "#efe7dc", fg: "#876848", bd: "#d9c4a6" },
                location: { bg: "#ebe9d7", fg: "#71703e", bd: "#cdc69a" },
                leisure:  { bg: "#e8f0ed", fg: "#407a6c", bd: "#b8d4cc" },
                general:  { bg: "#f1efeb", fg: "#6e685f", bd: "#cfc8ba" },
              };
              const s = CAT_STYLES[cat?.system_key ?? "general"] ?? CAT_STYLES.general;
              return (
                <button
                  key={id}
                  onClick={() => removeTag(id)}
                  title={tag.description || ""}
                  className="inline-flex items-center gap-[5px] px-[11px] rounded-full text-[11.5px] font-body font-medium border border-dashed whitespace-nowrap active:scale-95 transition-all"
                  style={{ height: "27px", backgroundColor: s.bg, borderColor: s.bd, color: s.fg }}
                >
                  {tag.icon && (() => { const I = ICON_MAP[tag.icon]; return I ? <I size={10} strokeWidth={2} /> : null; })()}
                  {tag.name_en}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
            <button
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-[5px] px-[11px] rounded-full text-[11.5px] font-body font-semibold border border-dashed whitespace-nowrap transition-colors"
              style={{ height: "27px", borderColor: "#cfc8ba", color: "#6e685f", background: "#fff" }}
            >
              <Plus className="w-3 h-3" />
              tag
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar — edit mode only: hint + delete */}
      {isEdit && (
        <div className="flex items-center px-5 pt-3 pb-3 border-t border-border/40 flex-shrink-0">
          <span className="text-[11px] font-body text-muted-foreground">Tap a photo to remove it</span>
          {onDelete && (
            <button
              onClick={onDelete}
              className="ml-auto w-10 h-10 flex items-center justify-center transition-colors"
              className="rounded-[11px] bg-destructive/10 text-destructive"
              aria-label="Delete entry"
            >
              <Trash2 className="w-[17px] h-[17px]" />
            </button>
          )}
        </div>
      )}

      {/* Floating mic button — identical to Home, shown in edit mode when idle */}
      {isEdit && voiceState === "idle" && (
        <VoiceMicButton onClick={handleMicPress} />
      )}

      {/* Tag picker sheet */}
      {pickerOpen && (
        <TagPickerSheet
          categories={categories}
          tags={tags}
          selectedIds={selectedTagIds}
          onClose={(ids) => {
            setSelectedTagIds(ids);
            setPickerOpen(false);
          }}
        />
      )}

      {/* Voice recording overlay */}
      {voiceState === "recording" && (
        <VoiceRecordingOverlay
          transcribing={transcribing}
          onStop={stopRecording}
          onCancel={() => { cancelRecording(); setVoiceState("idle"); }}
        />
      )}

      {/* Permission / not-supported sheet */}
      {(voiceState === "permission_error" || voiceState === "not_supported") && (
        <VoicePermissionSheet
          reason={voiceState === "permission_error" ? "denied" : "unsupported"}
          onWriteInstead={() => setVoiceState("idle")}
          onDismiss={() => setVoiceState("idle")}
        />
      )}
    </div>
  );
}