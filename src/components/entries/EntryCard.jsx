import { format } from "date-fns";
import { getEntryDate } from "@/utils/groupEntriesByDay";
import MiniTagChip from "@/components/tags/MiniTagChip";
import EntryMenu from "./EntryMenu";
import EntryMediaPreview from "./EntryMediaPreview";

const MOOD_HEX = [
  "#F87171", "#FBBF24", "#86EFAC",
  "#5EEAD4", "#7DD3FC", "#C4B5FD", "#F9A8D4",
];

function moodColor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return MOOD_HEX[Math.abs(hash) % MOOD_HEX.length];
}

const MAX_VISIBLE_TAGS = 3;

export default function EntryCard({ entry, onClick, onEdit, onDelete, tagById, categoryByKey }) {
  const date = getEntryDate(entry);
  const timeStr = format(date, "HH:mm");
  const dotColor = moodColor(entry.id);

  const tagIds = entry.tag_ids || [];
  const visibleIds = tagIds.slice(0, MAX_VISIBLE_TAGS);
  const overflow = tagIds.length - MAX_VISIBLE_TAGS;

  return (
    <div
      className="w-full bg-card px-5 py-4 transition-colors duration-150 hover:bg-muted/40 active:bg-muted/60"
    >
      {/* Meta row with menu */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
          <span className="text-xs font-body font-medium text-muted-foreground tabular-nums">
            {timeStr}
          </span>
        </div>
        <EntryMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Content — tappable area */}
      <button onClick={onClick} className="w-full text-left focus:outline-none">
        {entry.content ? (
          <>
            <p className="font-heading text-[15px] leading-relaxed text-foreground line-clamp-3">
              {entry.content}
            </p>
            {entry.content.length > 160 && (
              <span className="text-xs text-muted-foreground/70 font-body mt-1 inline-block">… more</span>
            )}
          </>
        ) : null}

        {/* Media preview */}
        <EntryMediaPreview media={entry.media} />

        {/* Tags */}
        {visibleIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 items-center">
            {visibleIds.map((id) => {
              const tag = tagById?.[id];
              if (!tag) return null;
              const cat = categoryByKey?.[tag.category_key];
              return <MiniTagChip key={id} tag={tag} category={cat} />;
            })}
            {overflow > 0 && (
              <span className="text-xs text-muted-foreground font-body">+{overflow}</span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}