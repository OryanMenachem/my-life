import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function WriteScreen({ onSave, onCancel }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    // Auto-focus with slight delay to allow the screen to mount
    const id = setTimeout(() => textareaRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, []);

  const trimmed = text.trim();
  const canSave = trimmed.length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setError("");
    setSaving(true);
    try {
      let language = "en";
      try {
        const me = await base44.auth.me();
        if (me?.language) language = me.language;
      } catch {
        // use default
      }
      const newEntry = await base44.entities.Entry.create({
        content: trimmed,
        source: "text",
        entry_date: new Date().toISOString(),
        language,
      });
      onSave(newEntry);
    } catch (err) {
      setError("Couldn't save. Your text is safe — please try again.");
      setSaving(false);
    }
  };

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
        <span className="text-sm font-body font-semibold text-foreground">New entry</span>
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

      {/* Error banner */}
      {error && (
        <div className="mx-5 mt-3 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-body flex-shrink-0">
          {error}
        </div>
      )}

      {/* Text area */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing…"
          className="w-full h-full min-h-[50vh] resize-none bg-transparent outline-none font-heading text-[18px] leading-[1.75] text-foreground placeholder:text-muted-foreground/40 placeholder:italic"
        />
      </div>
    </div>
  );
}