import MediaThumbnail from "./MediaThumbnail";
import MediaAddTile from "./MediaAddTile";
import LinkCard from "./LinkCard";
import { Link as LinkIcon } from "lucide-react";

/**
 * Horizontal scrollable media strip shown in the write/edit screen.
 * Links render as full-width link cards (not thumbnails).
 */
export default function MediaRow({ items, onAddFiles, onAddLink, onRemove, onRetry }) {
  const visualItems = items.filter((it) => it.type !== "link");
  const linkItems = items.filter((it) => it.type === "link");

  return (
    <div className="flex flex-col gap-2.5">
      {/* Link cards — full width */}
      {linkItems.length > 0 && (
        <div className="flex flex-col gap-2">
          {linkItems.map((item) => (
            <LinkCard
              key={item._localId}
              item={item}
              compact
              onRemove={() => onRemove(item._localId)}
            />
          ))}
        </div>
      )}

      {/* Photo/video thumbnails + add tiles */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 items-start" style={{ scrollbarWidth: "none" }}>
        {visualItems.map((item) => (
          <MediaThumbnail
            key={item._localId}
            item={item}
            onRemove={() => onRemove(item._localId)}
            onRetry={() => onRetry(item._localId)}
          />
        ))}
        <MediaAddTile onFiles={onAddFiles} />
        {/* Link add button */}
        {onAddLink && (
          <button
            type="button"
            onClick={onAddLink}
            className="w-20 h-20 rounded-xl flex-shrink-0 border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/50 transition-colors active:scale-95"
            aria-label="Add link"
          >
            <LinkIcon className="w-5 h-5" />
            <span className="text-[10px] font-body">Link</span>
          </button>
        )}
      </div>
    </div>
  );
}