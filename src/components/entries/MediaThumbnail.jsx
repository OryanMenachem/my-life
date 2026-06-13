import { X, Play } from "lucide-react";
import { formatDuration } from "@/utils/mediaUtils";

/**
 * A single media thumbnail in the write/edit screen.
 * Shows a ✕ button to remove it.
 * Videos show a play icon + duration.
 * If status === "uploading" shows a spinner overlay.
 * If status === "error" shows a retry button.
 */
export default function MediaThumbnail({ item, onRemove, onRetry }) {
  const src = item.previewUrl || item.thumbnail_url || item.url;
  const isVideo = item.type === "video";

  return (
    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border/50">
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-muted" />
      )}

      {/* Video overlay */}
      {isVideo && item.status !== "uploading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
          <Play className="w-5 h-5 text-white fill-white" />
          {item.duration_seconds > 0 && (
            <span className="text-[10px] text-white font-body mt-0.5">
              {formatDuration(item.duration_seconds)}
            </span>
          )}
        </div>
      )}

      {/* Uploading spinner */}
      {item.status === "uploading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error retry */}
      {item.status === "error" && (
        <button
          onClick={onRetry}
          className="absolute inset-0 flex items-center justify-center bg-black/50"
        >
          <span className="text-[10px] text-white font-body font-semibold text-center leading-tight px-1">
            Tap to retry
          </span>
        </button>
      )}

      {/* Remove button */}
      {item.status !== "uploading" && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
          aria-label="Remove media"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
}