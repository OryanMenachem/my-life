/**
 * Records audio using MediaRecorder and returns a Blob when stopped.
 * Much more reliable than Web Speech API across browsers.
 */
import { useRef, useCallback, useState } from "react";

export function useAudioRecorder({ onResult, onError }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const timeoutRef = useRef(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Pick a widely-supported MIME type
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
        .find((t) => MediaRecorder.isTypeSupported(t)) || "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        onResult?.(blob);
      };

      recorder.start(250); // collect data every 250ms
      setIsRecording(true);

      // Auto-stop at 2 minutes
      timeoutRef.current = setTimeout(() => stop(), 2 * 60 * 1000);
    } catch (err) {
      setIsRecording(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        onError?.("permission");
      } else {
        onError?.(err.message || "mic_error");
      }
    }
  }, [onResult, onError]);

  const stop = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      // Remove onstop so onResult isn't called
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsRecording(false);
  }, []);

  return { isRecording, start, stop, cancel };
}