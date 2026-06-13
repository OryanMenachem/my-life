import React from "react";

/**
 * Returns an array of React spans, with matched portions wrapped in a highlight span.
 */
export function highlightText(text, query) {
  if (!query || !query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    new RegExp(`^${escaped}$`, "i").test(part) ? (
      <mark key={i} className="bg-amber-200/80 text-foreground rounded-sm px-px">
        {part}
      </mark>
    ) : (
      part
    )
  );
}