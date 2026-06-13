import { useState } from "react";
import { useAppLock } from "@/lib/AppLockContext";

export default function AppLockSheet({ onClose, currentlyEnabled }) {
  const { setLockEnabled } = useAppLock();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEnable = async () => {
    if (pin.length < 4) { setErr("PIN must be at least 4 digits."); return; }
    if (pin !== confirm) { setErr("PINs don't match."); return; }
    setSaving(true);
    await setLockEnabled(true, pin);
    onClose(true);
  };

  const handleDisable = async () => {
    setSaving(true);
    await setLockEnabled(false);
    onClose(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 bg-card rounded-t-3xl px-6 pt-5 pb-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-muted-foreground/25 rounded-full mx-auto mb-5" />
        <h2 className="font-heading text-base font-semibold text-foreground mb-4">
          {currentlyEnabled ? "Disable App Lock" : "Set App PIN"}
        </h2>

        {currentlyEnabled ? (
          <div className="space-y-4">
            <p className="font-body text-sm text-muted-foreground">
              This will remove the PIN requirement when opening the app.
            </p>
            <button
              onClick={handleDisable}
              disabled={saving}
              className="w-full py-3 rounded-xl font-body font-semibold text-sm bg-destructive text-white active:scale-95 transition-transform disabled:opacity-50"
            >
              Disable lock
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-body text-sm text-muted-foreground mb-4">
              Choose a PIN to lock the app on open. Only the hash is stored — never the PIN itself.
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Enter PIN (min 4 digits)"
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Confirm PIN"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value.replace(/\D/g, "")); setErr(""); }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            {err && <p className="text-xs text-destructive font-body">{err}</p>}
            <button
              onClick={handleEnable}
              disabled={saving}
              className="w-full py-3 rounded-xl font-body font-semibold text-sm text-white active:scale-95 transition-transform disabled:opacity-50"
              style={{ backgroundColor: "var(--theme-accent)" }}
            >
              Enable lock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}