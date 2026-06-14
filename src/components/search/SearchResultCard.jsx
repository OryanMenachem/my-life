import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { getEntryDate } from "@/utils/groupEntriesByDay";
import { highlightText } from "@/utils/searchHighlight";
import MiniTagChip from "@/components/tags/MiniTagChip";
import EntryMediaPreview from "@/components/entries/EntryMediaPreview";

const MOOD_COLORS = [
  "bg-rose-300", "bg-amber-300", "bg-lime-300",
  "bg-teal-300", "bg-sky-300", "bg-violet-300", "bg-pink-300",
];
function moodColor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return MOOD_COLORS[Math.abs(hash) % MOOD_COLORS.length];
}

const MAX_VISIBLE_TAGS = 3;

const isRTL = (text) => /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(text?.slice(0, 60));

export default function SearchResultCard({ entry, query, onClick, tagById, categoryByKey }) {
  const [textExpanded, setTextExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [wrapperMaxH, setWrapperMaxH] = useState(undefined);
  const textRef = useRef(null);
  const clampedHRef = useRef(0);

  const date = getEntryDate(entry);
  const timeStr = format(date, "HH:mm");

  const tagIds = entry.tag_ids || [];
  const visibleIds = tagIds.slice(0, MAX_VISIBLE_TAGS);
  const overflow = tagIds.length - MAX_VISIBLE_TAGS;

  const hasMedia = entry.media && entry.media.length > 0;

  // Measure heights and detect overflow
  useEffect(() => {
    const el = textRef.current;
    if (!el || !entry.content) {
      setNeedsTruncation(false);
      return;
    }
    const full = el.scrollHeight;
    const clamped = el.clientHeight;
    const overflows = full > clamped + 1;
    setNeedsTruncation(overflows);
    if (overflows && !textExpanded) {
      clampedHRef.current = clamped;
      setWrapperMaxH(clamped);
    }
  }, [entry.content, textExpanded]);

  const handleExpand = useCallback((e) => {
    e.stopPropagation();
    const el = textRef.current;
    if (el) {
      el.classList.remove("line-clamp-3");
      const full = el.scrollHeight;
      el.classList.add("line-clamp-3");
      setWrapperMaxH(full);
    }
    setTextExpanded(true);
  }, []);

  const handleCollapse = useCallback((e) => {
    e.stopPropagation();
    setTextExpanded(false);
    setWrapperMaxH(clampedHRef.current);
  }, []);

  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-colors focus:outline-none flex flex-col"
      style={{ minHeight: "140px", paddingBottom: "14px", backgroundColor: "#FFFFFF" }}
    >
      {/* ── Full-width media at top (if present) ── */}
      {hasMedia && (
        <EntryMediaPreview media={entry.media} flush />
      )}

      {/* ── Meta row ── */}
      <div className={`flex items-center gap-2 ${hasMedia ? "pt-3" : "pt-4"} px-5`}>
        <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ backgroundColor: "#c79a4f" }} />
        <span className="text-[10.5px] font-body font-semibold tabular-nums" style={{ color: "#8c867c" }}>
          {timeStr}
        </span>
      </div>

      {/* ── Content with highlights — truncatable ── */}
      {entry.content ? (
        <div className="px-5">
          <div
            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: wrapperMaxH !== undefined ? `${wrapperMaxH}px` : undefined }}
          >
            <p
              ref={textRef}
              className={`font-body text-[14.5px] leading-[1.75] py-[6px] ${!textExpanded ? "line-clamp-3" : ""}`}
              style={{
                color: "#2c2823",
                direction: isRTL(entry.content) ? "rtl" : "ltr",
                textAlign: isRTL(entry.content) ? "right" : "left",
                fontWeight: 400,
              }}
            >
              {highlightText(entry.content, query)}
            </p>
          </div>
          {needsTruncation && !textExpanded && (
            <button
              onClick={handleExpand}
              className="text-[13px] font-body font-semibold mt-[2px] transition-colors"
              style={{ color: "#c79a4f" }}
            >
              …
            </button>
          )}
          {textExpanded && (
            <button
              onClick={handleCollapse}
              className="text-[11.5px] font-body font-medium mt-[2px] transition-colors"
              style={{ color: "#c79a4f" }}
            >
              less
            </button>
          )}
        </div>
      ) : null}

      {/* ── Tags ── */}
      {visibleIds.length > 0 && (
        <div className="flex flex-wrap gap-[5px] items-center px-5 mt-1">
          {visibleIds.map((id) => {
            const tag = tagById?.[id];
            if (!tag) return null;
            const cat = categoryByKey?.[tag.category_key];
            return <MiniTagChip key={id} tag={tag} category={cat} />;
          })}
          {overflow > 0 && (
            <span className="text-[10px] font-body font-semibold" style={{ color: "#8c867c" }}>+{overflow}</span>
          )}
        </div>
      )}
    </button>
  );
}