import { X, Link as LinkIcon } from "lucide-react";

/**
 * Displays a link media item as a card with thumbnail, title, and domain.
 * Used in write/edit screen's media row, feed cards, and detail view.
 */
export default function LinkCard({ item, onRemove, compact = false }) {
  const title = item.title || extractDomain(item.url);
  const domain = extractDomain(item.url);
  const hasThumbnail = item.thumbnail_url && item.thumbnail_url.length > 0;

  const card = (
    <div
      className={`flex items-center gap-3 bg-muted/50 border border-border/60 rounded-xl overflow-hidden ${
        compact ? "px-3 py-2" : "px-4 py-3"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
        {hasThumbnail ? (
          <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" decoding="async" loading="lazy" />
        ) : (
          <LinkIcon className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Title + URL */}
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-body font-medium text-foreground truncate leading-tight">
          {title}
        </p>
        <p className="text-[10.5px] font-body text-muted-foreground truncate leading-tight mt-0.5">
          {domain}
        </p>
      </div>

      {/* Remove button (edit mode only) */}
      {onRemove && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
          className="w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center flex-shrink-0 transition-colors"
          aria-label="Remove link"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );

  // Display mode: tappable link card that opens in a new tab.
  // Uses an <a> for reliable mobile tap handling.
  // onClick stopPropagation prevents parent click handlers (e.g., SearchResultCard)
  // from swallowing the link tap.
  if (!onRemove) {
    const url = normalizeUrl(item.url);
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        {card}
      </a>
    );
  }

  // Edit mode: no link behavior, only the ✕ remove button works
  return <div onClick={(e) => e.stopPropagation()}>{card}</div>;
}

function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function extractDomain(url) {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}