import { useState } from "react";
import { useAppLock } from "@/lib/AppLockContext";
import { Lock } from "lucide-react";

export default function AppLockScreen() {
  const { unlock } = useAppLock();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = unlock(pin);
    if (!ok) {
      setErr(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center gap-8 px-8">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--theme-accent)22" }}
      >
        <Lock className="w-7 h-7" style={{ color: "var(--theme-accent)" }} />
      </div>
      <div className="text-center space-y-1">
        <h1 className="font-heading text-xl font-semibold text-foreground">My Life is locked</h1>
        <p className="font-body text-sm text-muted-foreground">Enter your PIN to continue</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          maxLength={8}
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setErr(false); }}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card font-body text-sm text-foreground text-center tracking-[0.3em] outline-none focus:ring-2 focus:ring-ring"
        />
        {err && (
          <p className="text-xs text-destructive font-body text-center">Incorrect PIN. Try again.</p>
        )}
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-body font-semibold text-sm text-white active:scale-95 transition-transform"
          style={{ backgroundColor: "var(--theme-accent)" }}
        >
          Unlock
        </button>
      </form>
    </div>
  );
}