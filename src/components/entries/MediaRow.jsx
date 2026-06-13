import MediaThumbnail from "./MediaThumbnail";
import MediaAddTile from "./MediaAddTile";

/**
 * Horizontal scrollable media strip shown in the write/edit screen.
 */
export default function MediaRow({ items, onAddFiles, onRemove, onRetry }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 items-start" style={{ scrollbarWidth: "none" }}>
      {items.map((item) => (
        <MediaThumbnail
          key={item._localId}
          item={item}
          onRemove={() => onRemove(item._localId)}
          onRetry={() => onRetry(item._localId)}
        />
      ))}
      <MediaAddTile onFiles={onAddFiles} />
    </div>
  );
}