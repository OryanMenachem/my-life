import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, subDays } from "date-fns";
import { Image, X, ArrowRight } from "lucide-react";

/**
 * Shows a gentle, dismissible reminder to describe imported photo entries.
 *
 * Logic:
 * - Finds the oldest qualifying entry (imported, no text, no tags, within 30 days)
 * - Shows roughly once a week per user, with randomized timing
 * - "Add description" opens the edit screen; "Not now" dismisses
 */
export default function ImportReminderBanner({ onDescribe }) {
  const [entry, setEntry] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkForReminder();
  }, []);

  const checkForReminder = async () => {
    try {
      const user = await base44.auth.me();
      const enabled = user?.import_reminders_enabled !== false; // default true

      if (!enabled) return;

      // Should we show a reminder? Check last reminder time
      const last = user?.last_reminder_shown_at;
      const now = new Date();

      if (last) {
        const lastDate = new Date(last);
        const daysSince = (now - lastDate) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) return; // Less than a week since last reminder
      }

      // Find qualifying entries: imported, no text, no tags, within 30 days
      const cutoff = subDays(now, 30);
      const entries = await base44.entities.Entry.list("-created_date", 200);

      const qualifying = entries.filter((e) => {
        if (!e.is_imported) return false;
        if (e.content?.trim()) return false;
        if ((e.tag_ids || []).length > 0) return false;
        const importedAt = e.imported_at ? new Date(e.imported_at) : null;
        if (!importedAt || importedAt < cutoff) return false;
        return true;
      });

      if (qualifying.length === 0) return;

      // Pick the oldest qualifying entry
      const oldest = qualifying.sort(
        (a, b) => new Date(a.imported_at || a.created_date) - new Date(b.imported_at || b.created_date)
      )[0];

      setEntry(oldest);
      setVisible(true);
    } catch {
      // Silently skip if auth or query fails
    }
  };

  const handleDescribe = async () => {
    // Mark reminder as shown
    try {
      await base44.auth.updateMe({ last_reminder_shown_at: new Date().toISOString() });
    } catch {}
    setVisible(false);
    if (entry) onDescribe?.(entry);
  };

  const handleDismiss = async () => {
    // Mark reminder as shown so it doesn't reappear immediately
    try {
      await base44.auth.updateMe({ last_reminder_shown_at: new Date().toISOString() });
    } catch {}
    setVisible(false);
  };

  if (!visible || !entry) return null;

  const entryDate = entry.entry_date
    ? format(new Date(entry.entry_date), "d MMM")
    : "";

  const firstPhoto = (entry.media || []).find((m) => m.type === "photo");

  return (
    <div className="mx-4 mt-4">
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          borderColor: "hsl(var(--border))",
          backgroundColor: "hsl(var(--card))",
        }}
      >
        <div className="flex gap-3 p-4">
          {/* Thumbnail */}
          {firstPhoto ? (
            <img
              src={firstPhoto.url}
              alt=""
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Image className="w-5 h-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-body text-[13px] text-foreground leading-snug">
              You have a memory from{" "}
              <span className="font-semibold">{entryDate}</span> with no description.
            </p>
            <p className="font-body text-[12px] text-muted-foreground mt-0.5">
              Add a few words?
            </p>
          </div>

          {/* Dismiss X */}
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted/60 flex-shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Action */}
        <button
          onClick={handleDescribe}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-border/60 hover:bg-muted/30 transition-colors"
        >
          <span className="font-body text-[12px] font-semibold" style={{ color: "hsl(var(--primary))" }}>
            Add description
          </span>
          <ArrowRight className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
        </button>
      </div>
    </div>
  );
}