import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, X, Trash2 } from "lucide-react";
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
              const color = cat?.color ?? "#888888";
              return (
                <button
                  key={id}
                  onClick={() => removeTag(id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium border whitespace-nowrap active:scale-95 transition-all"
                  style={{ backgroundColor: color, borderColor: color, color: "#fff" }}
                >
                  {tag.name_en}
                  <X className="w-3 h-3" />
                </button>
              );
            })}
            <button
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-body font-medium border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground/70 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              tag
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar — edit mode only: hint + delete */}
      {isEdit && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 flex-shrink-0">
          <span className="text-xs font-body text-muted-foreground/60">Tap a photo to remove it</span>
          {onDelete && (
            <button
              onClick={onDelete}
              className="w-8 h-8 flex items-center justify-center rounded-full text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
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