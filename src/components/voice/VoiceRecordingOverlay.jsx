import { useEffect, useState, useRef } from "react";
import { Square } from "lucide-react";

/**
 * Full-screen recording overlay.
 * Props:
 *   transcript  — live transcribed text (string)
 *   onStop()    — user tapped stop
 *   onCancel()  — user cancelled (discards result)
 */
export default function VoiceRecordingOverlay({ transcript, onStop, onCancel }) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-[55] bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 flex-shrink-0">
        <button
          onClick={onCancel}
          className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors px-1 py-1"
        >
          Cancel
        </button>
        <span className="text-sm font-body font-semibold text-foreground tabular-nums">
          {fmt(elapsed)}
        </span>
        <div className="w-16" />
      </div>

      {/* Live waveform animation */}
      <div className="flex items-end justify-center gap-1 py-8 flex-shrink-0">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-foreground"
            style={{
              height: "4px",
              animation: `voiceBar 0.9s ease-in-out ${(i * 0.1).toFixed(1)}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes voiceBar {
          from { height: 4px; }
          to   { height: 32px; }
        }
      `}</style>

      {/* Listening label */}
      <p className="text-center text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-6 flex-shrink-0">
        Listening…
      </p>

      {/* Live transcript */}
      <div className="flex-1 overflow-y-auto px-6">
        {transcript ? (
          <p className="font-heading text-[18px] leading-[1.75] text-foreground">
            {transcript}
          </p>
        ) : (
          <p className="font-heading italic text-muted-foreground/40 text-[18px]">
            Start speaking…
          </p>
        )}
      </div>

      {/* Stop button */}
      <div className="flex justify-center pb-12 pt-6 flex-shrink-0">
        <button
          onClick={onStop}
          className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center shadow-lg active:scale-95 transition-all"
          aria-label="Stop recording"
        >
          <Square className="w-5 h-5 text-background fill-background" />
        </button>
        <p className="absolute mt-20 text-xs font-body text-muted-foreground">Tap to stop</p>
      </div>
    </div>
  );
}