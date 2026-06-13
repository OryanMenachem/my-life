import { useState } from "react";
import { Mic, MicOff } from "lucide-react";

export default function StepMicrophone({ onNext, onSkip }) {
  const [state, setState] = useState("idle"); // idle | granted | denied | unsupported

  const requestMic = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setState("granted");
    } catch {
      setState("denied");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-8">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--theme-accent)22" }}
      >
        {state === "denied" || state === "unsupported" ? (
          <MicOff className="w-9 h-9" style={{ color: "var(--theme-accent)" }} />
        ) : (
          <Mic className="w-9 h-9" style={{ color: "var(--theme-accent)" }} />
        )}
      </div>

      <div className="space-y-2 max-w-xs">
        {state === "idle" && (
          <>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Voice journaling
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              My Life uses your microphone to turn your voice into journal entries — instantly.
            </p>
          </>
        )}
        {state === "granted" && (
          <>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              You're all set! 🎉
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Microphone access granted. Tap the mic button anytime to record.
            </p>
          </>
        )}
        {state === "denied" && (
          <>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Mic access denied
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              No worries — you can still type entries. Enable the mic in your browser settings any time.
            </p>
          </>
        )}
        {state === "unsupported" && (
          <>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Not supported
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Your browser doesn't support voice input. You can still write entries by typing.
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {state === "idle" && (
          <button
            onClick={requestMic}
            className="px-8 py-3 rounded-full font-body font-semibold text-base active:scale-95 transition-transform"
            style={{ backgroundColor: "var(--theme-accent)", color: "#fff" }}
          >
            Allow microphone
          </button>
        )}
        {(state === "granted" || state === "denied" || state === "unsupported") && (
          <button
            onClick={onNext}
            className="px-8 py-3 rounded-full font-body font-semibold text-base active:scale-95 transition-transform"
            style={{ backgroundColor: "var(--theme-accent)", color: "#fff" }}
          >
            Continue
          </button>
        )}
        {state === "idle" && (
          <button
            onClick={onSkip}
            className="px-4 py-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}