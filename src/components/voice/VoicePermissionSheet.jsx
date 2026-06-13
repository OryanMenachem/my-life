import { Mic, PenLine } from "lucide-react";

/**
 * Shown when mic permission is denied or unavailable.
 */
export default function VoicePermissionSheet({ reason, onWriteInstead, onDismiss }) {
  const isDenied = reason === "denied";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/30" onClick={onDismiss}>
      <div
        className="bg-background rounded-t-2xl shadow-2xl pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grip */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        <div className="px-5 pb-8">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Mic className="w-6 h-6 text-muted-foreground" />
          </div>

          {isDenied ? (
            <>
              <h2 className="text-base font-body font-semibold text-foreground mb-1">
                Microphone access blocked
              </h2>
              <p className="text-sm font-body text-muted-foreground mb-6 leading-relaxed">
                To use voice capture, allow microphone access in your browser settings, then try again.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-base font-body font-semibold text-foreground mb-1">
                Microphone not supported
              </h2>
              <p className="text-sm font-body text-muted-foreground mb-6 leading-relaxed">
                Your browser doesn't support voice capture. You can still write your entry by text.
              </p>
            </>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={onWriteInstead}
              className="w-full h-11 rounded-full bg-foreground text-background text-sm font-body font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <PenLine className="w-4 h-4" />
              Write by text
            </button>
            <button
              onClick={onDismiss}
              className="w-full h-11 rounded-full bg-muted text-foreground text-sm font-body font-semibold active:scale-95 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}