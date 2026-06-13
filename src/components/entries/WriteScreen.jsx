import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, X, Trash2, Sun, Moon, Heart, Zap, Wind, Cloud, Briefcase, Users, User, HeartPulse, BookOpen, Home, TreePine, Plane, Lightbulb } from "lucide-react";

const ICON_MAP = {
  "sun": Sun, "moon": Moon, "heart": Heart, "zap": Zap, "wind": Wind, "cloud": Cloud,
  "briefcase": Briefcase, "users": Users, "user": User, "heart-pulse": HeartPulse,
  "book-open": BookOpen, "home": Home, "tree-pine": TreePine, "plane": Plane, "lightbulb": Lightbulb,
};
import { useTagCatalog } from "@/hooks/useTagCatalog";
import { useMediaUploader } from "@/hooks/useMediaUploader";
import TagPickerSheet from "@/components/tags/TagPickerSheet";
import MediaRow from "./MediaRow";

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
  const [error, setError] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState(entry?.tag_ids ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const textareaRef = useRef(null);

  const { categories, tags, categoryByKey, tagById } = useTagCatalog();
  const { items: mediaItems, addFiles, removeItem, retryItem, readyMedia, hasUploading } =
    useMediaUploader(entry?.media ?? []);

  useEffect(() => {
    const id = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, []);

  const trimmed = text.trim();
  const hasContent = trimmed.length > 0 || readyMedia.length > 0;
  const canSave = hasContent && !saving;

  const handleAddFiles = async (files) => {
    setMediaError("");
    const errors = await addFiles(files);
    if (errors.length > 0) setMediaError(errors.join(" "));
  };

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    setSaving(true);
    try {
      let savedEntry;
      if (isEdit) {
        savedEntry = await base44.entities.Entry.update(entry.id, {
          content: trimmed,
          tag_ids: selectedTagIds,
          media: readyMedia,
          updated_date: new Date().toISOString(),
        });
      } else {
        let language = "en";
        try {
          const me = await base44.auth.me();
          if (me?.language) language = me.language;
        } catch { /* use default */ }
        savedEntry = await base44.entities.Entry.create({
          content: trimmed,
          source: source,
          entry_date: new Date().toISOString(),
          language,
          tag_ids: selectedTagIds,
          media: readyMedia,
        });
      }
      onSave(savedEntry);
    } catch {
      setError("Couldn't save. Your text is safe — please try again.");
      setSaving(false);
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
          placeholder="Start writing…"
          className="w-full min-h-[30vh] resize-none bg-transparent outline-none font-heading text-[18px] leading-[1.75] text-foreground placeholder:text-muted-foreground/40 placeholder:italic"
        />

        {/* Media row */}
        <div className="mt-3 pb-2">
          <MediaRow
            items={mediaItems}
            onAddFiles={handleAddFiles}
            onRemove={removeItem}
            onRetry={retryItem}
          />
        </div>

        {hasUploading && (
          <p className="text-xs font-body text-muted-foreground mt-1">
            Uploading…
          </p>
        )}

        {/* Tags label + chips */}
        <div className="mt-5">
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
                general:  { bg: "#f1efeb", fg: "#6e685f", bd: "#cfc8ba" },
              };
              const s = CAT_STYLES[cat?.system_key ?? "general"] ?? CAT_STYLES.general;
              return (
                <button
                  key={id}
                  onClick={() => removeTag(id)}
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
          <span className="text-[11px] font-body" style={{ color: "#8c867c" }}>Tap a photo to remove it</span>
          {onDelete && (
            <button
              onClick={onDelete}
              className="ml-auto w-10 h-10 flex items-center justify-center transition-colors"
              style={{ borderRadius: "11px", background: "#f7eceb", color: "#b1493f" }}
              aria-label="Delete entry"
            >
              <Trash2 className="w-[17px] h-[17px]" />
            </button>
          )}
        </div>
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
    </div>
  );
}