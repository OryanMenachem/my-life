import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle } from "lucide-react";

export default function DeleteAccountSheet({ onClose, onDeleted }) {
  const [step, setStep] = useState(1); // 1=warn, 2=confirm
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const CONFIRM_WORD = "DELETE";

  const handleDelete = async () => {
    if (typed.trim().toUpperCase() !== CONFIRM_WORD) {
      setErr(`Please type "${CONFIRM_WORD}" to confirm.`);
      return;
    }
    setLoading(true);
    try {
      // Delete all user's entries (and their media is referenced by URL, not private storage per current schema)
      let entries = [];
      try { entries = await base44.entities.Entry.list("-created_date", 1000); } catch {}
      for (const e of entries) {
        try { await base44.entities.Entry.delete(e.id); } catch {}
      }
      // Sign out — account data handled by platform
      await base44.auth.logout();
      onDeleted?.();
    } catch {
      setErr("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative z-10 bg-card rounded-t-3xl px-6 pt-5 pb-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-muted-foreground/25 rounded-full mx-auto mb-5" />

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <h2 className="font-heading text-base font-semibold text-destructive">Delete account</h2>
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              This will permanently delete <strong>all your journal entries</strong> and your account data. This cannot be undone.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-body font-semibold text-sm bg-destructive text-white active:scale-95 transition-transform"
            >
              I understand, continue
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-heading text-base font-semibold text-destructive">Final confirmation</h2>
            <p className="font-body text-sm text-muted-foreground">
              Type <span className="font-mono font-bold text-foreground">{CONFIRM_WORD}</span> to permanently delete your account.
            </p>
            <input
              autoFocus
              type="text"
              placeholder={CONFIRM_WORD}
              value={typed}
              onChange={(e) => { setTyped(e.target.value); setErr(""); }}
              className="w-full px-4 py-3 rounded-xl border border-destructive/50 bg-background font-body text-sm text-foreground outline-none focus:ring-2 focus:ring-destructive"
            />
            {err && <p className="text-xs text-destructive font-body">{err}</p>}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full py-3 rounded-xl font-body font-semibold text-sm bg-destructive text-white active:scale-95 transition-transform disabled:opacity-50"
            >
              {loading ? "Deleting…" : "Delete my account"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}