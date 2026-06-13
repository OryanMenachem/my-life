import { Play } from "lucide-react";
import { formatDuration } from "@/utils/mediaUtils";

/**
 * Shows the first media item on a feed card at 4:3 ratio.
 * Extra items shown as "+N" badge.
 */
export default function EntryMediaPreview({ media }) {
  if (!media || media.length === 0) return null;

  const first = media[0];
  const extra = media.length - 1;
  const src = first.thumbnail_url || first.url;
  const isVideo = first.type === "video";

  return (
    <div className="relative w-full mt-2.5 rounded-xl overflow-hidden bg-muted" style={{ aspectRatio: "4/3" }}>
      {src && (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Video overlay */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          {first.duration_seconds > 0 && (
            <span className="absolute bottom-2 right-2 text-[11px] font-body font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded">
              {formatDuration(first.duration_seconds)}
            </span>
          )}
        </div>
      )}

      {/* Extra count badge */}
      {extra > 0 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-[11px] font-body font-semibold px-2 py-0.5 rounded-full">
          +{extra}
        </div>
      )}
    </div>
  );
}