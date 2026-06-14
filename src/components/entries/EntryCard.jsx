import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { getEntryDate } from "@/utils/groupEntriesByDay";
import MiniTagChip from "@/components/tags/MiniTagChip";
import EntryMenu from "./EntryMenu";
import MediaCarousel from "./MediaCarousel";
import LinkCard from "./LinkCard";
import { highlightText } from "@/utils/searchHighlight";

const MAX_VISIBLE_TAGS = 3;

// Detect if text is primarily Hebrew/RTL
const isRTL = (text) => /[\u0590-\u05FF\uFB1D-\uFB4F]/.test(text?.slice(0, 60));

export default function EntryCard({ entry, onEdit, onDelete, tagById, categoryByKey, searchQuery }) {
  const [textExpanded, setTextExpanded] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [wrapperMaxH, setWrapperMaxH] = useState(undefined);
  const textRef = useRef(null);
  const clampedHRef = useRef(0);

  const date = getEntryDate(entry);
  const timeStr = format(date, "HH:mm");

  const tagIds = entry.tag_ids || [];
  const visibleIds = tagsExpanded ? tagIds : tagIds.slice(0, MAX_VISIBLE_TAGS);
  const overflow = tagIds.length - MAX_VISIBLE_TAGS;

  const allMedia = entry.media || [];
  const visualMedia = allMedia.filter((m) => m.type !== "link");
  const linkMedia = allMedia.filter((m) => m.type === "link");
  const hasMedia = allMedia.length > 0;
  const hasVisual = visualMedia.length > 0;
  const hasLinks = linkMedia.length > 0;

  // Measure heights and detect overflow
  useEffect(() => {
    const el = textRef.current;
    if (!el || !entry.content) {
      setNeedsTruncation(false);
      return;
    }
    // scrollHeight = full content height, clientHeight = visible (clamped) height
    const full = el.scrollHeight;
    const clamped = el.clientHeight;
    const overflows = full > clamped + 1;
    setNeedsTruncation(overflows);
    if (overflows && !textExpanded) {
      clampedHRef.current = clamped;
      setWrapperMaxH(clamped);
    }
  }, [entry.content, textExpanded]);

  const handleExpand = useCallback(() => {
    const el = textRef.current;
    if (el) {
      // Temporarily remove line-clamp to measure full natural height
      el.classList.remove("line-clamp-3");
      const full = el.scrollHeight;
      el.classList.add("line-clamp-3");
      setWrapperMaxH(full);
    }
    setTextExpanded(true);
  }, []);

  const handleCollapse = useCallback(() => {
    setTextExpanded(false);
    setWrapperMaxH(clampedHRef.current);
  }, []);

  const textStyle = {
    color: "#2c2823",
    direction: entry.content && isRTL(entry.content) ? "rtl" : "ltr",
    textAlign: entry.content && isRTL(entry.content) ? "right" : "left",
    fontWeight: 400,
    letterSpacing: "0.01em",
  };

  return (
    <div className="w-full relative" style={{ backgroundColor: "#FFFFFF" }}>
      {/* ── Full-width visual media at top (flush, no padding) ── */}
      {hasVisual && (
        <MediaCarousel media={visualMedia} flush />
      )}

      {/* ── Link cards ── */}
      {hasLinks && (
        <div className={`flex flex-col gap-2 ${hasVisual ? "px-4 pt-4" : "px-4 pt-5"}`}>
          {linkMedia.map((item, idx) => (
            <LinkCard key={idx} item={item} />
          ))}
        </div>
      )}

      {/* ── Meta row + kebab menu ── */}
      <div className={`flex items-center gap-[6px] px-4 ${hasMedia && !hasLinks ? "pt-4" : hasLinks && !hasVisual ? "pt-2" : hasMedia ? "pt-4" : "pt-5"}`}>
        <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ backgroundColor: "#c79a4f" }} />
        <span className="text-[10.5px] font-body font-semibold tabular-nums" style={{ color: "#8c867c" }}>
          {timeStr}
        </span>
        {/* Kebab menu pushed to the right */}
        <div className="ml-auto">
          <EntryMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      {/* ── Content + tags — NOT tappable ── */}
      <div className="px-4 pb-[16px]">
        {entry.content ? (
          <div>
            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
              style={{ maxHeight: wrapperMaxH !== undefined ? `${wrapperMaxH}px` : undefined }}
            >
              <p
                ref={textRef}
                className={`font-body text-[15px] leading-[1.8] pt-[8px] ${!textExpanded ? "line-clamp-3" : ""}`}
                style={textStyle}
              >
                {searchQuery ? highlightText(entry.content, searchQuery) : entry.content}
              </p>
            </div>
            {needsTruncation && !textExpanded && (
              <button
                onClick={handleExpand}
                className="text-[11.5px] font-body font-medium mt-[2px] transition-colors"
                style={{ color: "#8c867c" }}
              >
                …more
              </button>
            )}
            {textExpanded && (
              <button
                onClick={handleCollapse}
                className="text-[11.5px] font-body font-medium mt-[2px] transition-colors"
                style={{ color: "#8c867c" }}
              >
                less
              </button>
            )}
          </div>
        ) : null}

        {/* Tags */}
        {visibleIds.length > 0 && (
          <div className="flex flex-wrap gap-[5px] items-center mt-3">
            {visibleIds.map((id) => {
              const tag = tagById?.[id];
              if (!tag) return null;
              const cat = categoryByKey?.[tag.category_key];
              return <MiniTagChip key={id} tag={tag} category={cat} />;
            })}
            {overflow > 0 && !tagsExpanded && (
              <button
                onClick={() => setTagsExpanded(true)}
                className="text-[10px] font-body font-semibold transition-colors"
                style={{ color: "#8c867c" }}
              >
                +{overflow}
              </button>
            )}
            {tagsExpanded && overflow > 0 && (
              <button
                onClick={() => setTagsExpanded(false)}
                className="text-[10px] font-body font-semibold transition-colors"
                style={{ color: "#8c867c" }}
              >
                less
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}