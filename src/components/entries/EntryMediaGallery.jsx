import { Play } from "lucide-react";
import { formatDuration } from "@/utils/mediaUtils";

/**
 * Full media gallery shown in EntryDetail.
 * Photos: full-width. Videos: thumbnail + play icon.
 */
export default function EntryMediaGallery({ media }) {
  if (!media || media.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-5">
      {media.map((item, idx) => {
        const src = item.thumbnail_url || item.url;
        const isVideo = item.type === "video";
        const ratio = item.width && item.height
          ? item.width / item.height
          : 4 / 3;

        return (
          <div
            key={idx}
            className="relative w-full rounded-2xl overflow-hidden bg-muted"
            style={{ aspectRatio: ratio }}
          >
            {src && (
              <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {isVideo && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/20"
              >
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
                {item.duration_seconds > 0 && (
                  <span className="absolute bottom-3 right-3 text-xs font-body font-semibold text-white bg-black/50 px-2 py-0.5 rounded">
                    {formatDuration(item.duration_seconds)}
                  </span>
                )}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}