import { useRef, useCallback } from "react";

const MAX_DURATION_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Thin wrapper around the Web Speech API.
 * Returns { isSupported, start, stop }
 *
 * callbacks:
 *   onTranscript(text)   — called with interim text while recording
 *   onResult(text)       — called with final text when recognition ends
 *   onError(message)     — called on any error
 */
export function useSpeechRecognition({ onTranscript, onResult, onError, language = "en-US" }) {
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const accumulatedRef = useRef("");

  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSupported = !!SpeechRecognition;

  const stop = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognition) {
      onError?.("Speech recognition is not supported in this browser.");
      return;
    }

    // Clean up any previous instance
    stop();
    accumulatedRef.current = "";

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = "";
      let newFinal = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          newFinal += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }
      if (newFinal) accumulatedRef.current += newFinal + " ";
      const current = (accumulatedRef.current + interim).trim();
      onTranscript?.(current);
    };

    recognition.onerror = (event) => {
      // "no-speech" is benign — ignore it
      if (event.error === "no-speech") return;
      // "aborted" means we called stop() ourselves
      if (event.error === "aborted") return;
      onError?.(event.error === "not-allowed"
        ? "Microphone permission denied."
        : `Recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      clearTimeout(timeoutRef.current);
      const final = accumulatedRef.current.trim();
      onResult?.(final);
    };

    recognition.start();

    // Auto-stop at 2 minutes
    timeoutRef.current = setTimeout(() => {
      stop();
    }, MAX_DURATION_MS);
  }, [SpeechRecognition, language, stop, onTranscript, onResult, onError]);

  return { isSupported, start, stop };
}